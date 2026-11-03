// Helpers for aborting reads that several callers share, such as one chunk
// fetch that coalesces concurrent reads of the same key.

/**
 * Whether an error comes from an aborted read: a DOMException or Error named
 * AbortError, as thrown by fetch, zarrita, geotiff, and AbortSignal.throwIfAborted.
 */
export function isAbortError(error: unknown): boolean {
  return (error as { name?: unknown } | null)?.name === 'AbortError';
}

/**
 * A reason to pass to AbortController.abort(), so that the resulting errors say
 * why a read was aborted. It is named AbortError, like the default reason, so
 * that isAbortError still recognizes it (fetch rejects with the reason itself).
 * @param message Why the read was aborted.
 */
export function createAbortReason(message: string): DOMException {
  return new DOMException(message, 'AbortError');
}

/**
 * Settle with the promise, or reject with the signal's reason as soon as the
 * signal aborts, whichever comes first. The promise itself keeps running.
 * @param promise The shared work.
 * @param signal The caller's signal, if any.
 */
export function raceAbortSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

export type SharedAbort = {
  /** Signal for the shared work: aborts once every attached caller has aborted. */
  signal: AbortSignal,
  /**
   * Add a caller. A caller without a signal can never abort, so the shared
   * work then runs to completion.
   */
  attach: (callerSignal?: AbortSignal) => void,
  /** Stop listening to the callers' signals, once the shared work has settled. */
  release: () => void,
};

/**
 * Reference-counted abort for work shared by several callers. Aborting the
 * shared work when only some of its callers abort would fail the others.
 * @param onAbort Called when the shared work is aborted, e.g. to forget it,
 * so that later callers start fresh instead of joining an aborted read.
 */
export function createSharedAbort(onAbort?: () => void): SharedAbort {
  const controller = new AbortController();
  let activeCallers = 0;
  const cleanups: (() => void)[] = [];
  function attach(callerSignal?: AbortSignal) {
    if (controller.signal.aborted) return;
    activeCallers += 1;
    if (!callerSignal) return;
    const onCallerAbort = () => {
      activeCallers -= 1;
      if (activeCallers === 0) {
        controller.abort(callerSignal.reason);
        onAbort?.();
      }
    };
    if (callerSignal.aborted) {
      onCallerAbort();
      return;
    }
    callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    cleanups.push(() => callerSignal.removeEventListener('abort', onCallerAbort));
  }
  function release() {
    cleanups.forEach(cleanup => cleanup());
    cleanups.length = 0;
  }
  return { signal: controller.signal, attach, release };
}
