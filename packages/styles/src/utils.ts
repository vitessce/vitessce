// Reference: https://github.com/mui/material-ui/tree/v4.x/packages/material-ui/src/utils
import { useMemo, MutableRefObject } from 'react';

/**
 * Safe chained function
 *
 * Will only create a new function if needed,
 * otherwise will pass back existing functions or null.
 *
 * @param {function} functions to chain
 * @returns {function|null}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, space-before-function-paren
export function createChainedFunction<T extends (...args: any[]) => void>(
  ...funcs: (T | null | undefined)[]) {
  return funcs.reduce(
    (acc, func) => {
      if (func == null) {
        return acc;
      }

      if (process.env.NODE_ENV !== 'production') {
        if (typeof func !== 'function') {
          console.error(
            'Material-UI: Invalid Argument Type, must only provide functions, undefined, or null.',
          );
        }
      }

      // eslint-disable-next-line func-names
      return function chainedFunction(this: unknown, ...args: Parameters<T>) {
        acc.apply(this, args);
        func.apply(this, args);
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (() => {}) as (...args: Parameters<T>) => void,
  );
}

export function setRef<T>(
  ref: ((instance: T | null) => void) | MutableRefObject<T | null> | null | undefined,
  value: T | null,
): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    // eslint-disable-next-line no-param-reassign
    ref.current = value;
  }
}

export function useForkRef<T>(
  refA: ((instance: T | null) => void) | MutableRefObject<T | null> | null | undefined,
  refB: ((instance: T | null) => void) | MutableRefObject<T | null> | null | undefined,
): ((instance: T | null) => void) | null {
  /**
   * This will create a new function if the ref props change and are defined.
   * This means react will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior
   */
  return useMemo(() => {
    if (refA == null && refB == null) {
      return null;
    }
    return (refValue: T | null) => {
      setRef(refA, refValue);
      setRef(refB, refValue);
    };
  }, [refA, refB]);
}
