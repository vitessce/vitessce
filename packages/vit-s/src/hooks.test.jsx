import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExpressionValueGetter } from './hooks.js';

describe('useExpressionValueGetter', () => {
  const expressionData = [new Uint8Array([10, 20, 30])];

  it('reads by position when the instance and matrix indices are the same array', () => {
    const obsIndex = ['a', 'b', 'c'];
    const { result } = renderHook(() => useExpressionValueGetter({
      instanceObsIndex: obsIndex, matrixObsIndex: obsIndex, expressionData,
    }));
    expect(result.current(null, { index: 0 })).toEqual(10);
    expect(result.current(null, { index: 2 })).toEqual(30);
  });

  it('maps through observation IDs when the indices differ', () => {
    const { result } = renderHook(() => useExpressionValueGetter({
      instanceObsIndex: ['c', 'unknown', 'a'],
      matrixObsIndex: ['a', 'b', 'c'],
      expressionData,
    }));
    expect(result.current(null, { index: 0 })).toEqual(30);
    // An observation absent from the matrix reads as undefined, as before.
    expect(result.current(null, { index: 1 })).toEqual(undefined);
    expect(result.current(null, { index: 2 })).toEqual(10);
  });

  it('returns 0 without indices or without data', () => {
    const { result: noIndices } = renderHook(() => useExpressionValueGetter({
      instanceObsIndex: null, matrixObsIndex: ['a'], expressionData,
    }));
    expect(noIndices.current(null, { index: 0 })).toEqual(0);
    const { result: noData } = renderHook(() => useExpressionValueGetter({
      instanceObsIndex: ['a'], matrixObsIndex: ['a'], expressionData: null,
    }));
    expect(noData.current(null, { index: 0 })).toEqual(0);
  });
});
