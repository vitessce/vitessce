// Reference: https://github.com/mui/material-ui/tree/v4.x/packages/material-ui/src/utils
import { useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any[]) => void;

/**
 * Safe chained function
 *
 * Will only create a new function if needed,
 * otherwise will pass back existing functions or null.
 *
 * @param {function} functions to chain
 * @returns {function|null}
 */
export function createChainedFunction(...funcs: (Func | null | undefined)[]): Func {
  return funcs.reduce<Func>(
    (acc, func) => {
      if (func == null) {
        return acc;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return function chainedFunction(this: any, ...args: any[]) {
        acc.apply(this, args);
        func.apply(this, args);
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
  );
}

export function setRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    // eslint-disable-next-line no-param-reassign
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

export function useForkRef<T>(
  refA: React.Ref<T> | undefined,
  refB: React.Ref<T> | undefined,
): React.Ref<T> | null {
  /**
   * This will create a new function if the ref props change and are defined.
   * This means react will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior
   */
  return useMemo(() => {
    if (refA == null && refB == null) {
      return null;
    }
    return (refValue: T) => {
      setRef(refA, refValue);
      setRef(refB, refValue);
    };
  }, [refA, refB]);
}
