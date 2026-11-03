import { describe, it, expect } from 'vitest';
import {
  createAbortReason, createSharedAbort, isAbortError, raceAbortSignal,
} from './abort.js';

describe('createSharedAbort', () => {
  it('aborts once every attached caller has aborted', () => {
    let forgotten = 0;
    const shared = createSharedAbort(() => { forgotten += 1; });
    const [a, b] = [new AbortController(), new AbortController()];
    shared.attach(a.signal);
    shared.attach(b.signal);
    a.abort();
    expect(shared.signal.aborted).toBe(false);
    b.abort();
    expect(shared.signal.aborted).toBe(true);
    expect(forgotten).toBe(1);
  });

  it('aborts with the reason of the last caller to abort', () => {
    const shared = createSharedAbort();
    const controller = new AbortController();
    shared.attach(controller.signal);
    const reason = createAbortReason('no longer needed');
    controller.abort(reason);
    expect(shared.signal.reason).toBe(reason);
  });

  it('never aborts while a caller without a signal is attached', () => {
    const shared = createSharedAbort();
    const controller = new AbortController();
    shared.attach(controller.signal);
    shared.attach();
    controller.abort();
    expect(shared.signal.aborted).toBe(false);
  });

  it('counts a caller whose signal is already aborted as gone', () => {
    const shared = createSharedAbort();
    shared.attach(AbortSignal.abort());
    expect(shared.signal.aborted).toBe(true);
  });

  it('stops listening to callers once released', () => {
    const shared = createSharedAbort();
    const controller = new AbortController();
    shared.attach(controller.signal);
    shared.release();
    controller.abort();
    expect(shared.signal.aborted).toBe(false);
  });
});

describe('raceAbortSignal', () => {
  it('rejects as soon as the signal aborts, and otherwise settles with the promise', async () => {
    const never = new Promise(() => undefined);
    const controller = new AbortController();
    const raced = raceAbortSignal(never, controller.signal);
    controller.abort();
    await expect(raced).rejects.toSatisfy(isAbortError);
    expect(await raceAbortSignal(Promise.resolve(1), new AbortController().signal)).toBe(1);
    expect(await raceAbortSignal(Promise.resolve(2))).toBe(2);
    await expect(raceAbortSignal(Promise.resolve(3), AbortSignal.abort()))
      .rejects.toSatisfy(isAbortError);
  });
});

describe('createAbortReason', () => {
  it('is an AbortError with the given message', () => {
    const reason = createAbortReason('loading was stopped');
    expect(reason.message).toBe('loading was stopped');
    expect(isAbortError(reason)).toBe(true);
  });
});
