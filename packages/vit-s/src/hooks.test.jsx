import React from 'react';
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { renderHook, render, act } from '@testing-library/react';
import { useExpressionValueGetter, useGridItemSize } from './hooks.js';
import { useGridResize } from './state/hooks.js';

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

describe('useGridItemSize', () => {
  let observers;
  let rect;
  let originalResizeObserver;

  function GridItem(props) {
    const { sizes, withContainer = true } = props;
    const [width, height, containerRef] = useGridItemSize();
    sizes.push([width, height]);
    return withContainer ? <div ref={containerRef} /> : null;
  }

  beforeEach(() => {
    observers = [];
    rect = { width: 0, height: 0 };
    originalResizeObserver = globalThis.ResizeObserver;
    // jsdom does not implement ResizeObserver.
    globalThis.ResizeObserver = class {
      constructor(callback) {
        this.callback = callback;
        this.element = null;
        observers.push(this);
      }

      observe(element) {
        this.element = element;
        // The real ResizeObserver invokes its callback once upon observe().
        this.callback([{ target: element }], this);
      }

      unobserve() {
        this.element = null;
      }

      disconnect() {
        this.element = null;
      }
    };
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => ({ ...rect }));
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    vi.restoreAllMocks();
  });

  it('measures the container element on mount and on subsequent resizes', () => {
    rect = { width: 300, height: 200 };
    const sizes = [];
    render(<GridItem sizes={sizes} />);
    expect(sizes.at(-1)).toEqual([300, 200]);

    // A later element resize is picked up without any window or grid event.
    rect = { width: 320, height: 180 };
    act(() => {
      observers[0].callback([{ target: observers[0].element }], observers[0]);
    });
    expect(sizes.at(-1)).toEqual([320, 180]);
  });

  it('stops re-rendering when the observed size is unchanged', () => {
    rect = { width: 300, height: 200 };
    const sizes = [];
    render(<GridItem sizes={sizes} />);
    const renderCount = sizes.length;
    // Repeated callbacks reporting the same size must not keep re-rendering,
    // otherwise a ResizeObserver callback could feed back into itself.
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-loop-func
      act(() => {
        observers[0].callback([{ target: observers[0].element }], observers[0]);
      });
    }
    // React may still render once before bailing out on the unchanged state.
    expect(sizes.length).toBeLessThanOrEqual(renderCount + 1);
    expect(sizes.at(-1)).toEqual([300, 200]);
  });

  it('observes a container element which only mounts after the first render', () => {
    rect = { width: 300, height: 200 };
    const sizes = [];
    const { rerender } = render(<GridItem sizes={sizes} withContainer={false} />);
    expect(sizes.at(-1)).toEqual([undefined, undefined]);

    rerender(<GridItem sizes={sizes} withContainer />);
    expect(sizes.at(-1)).toEqual([300, 200]);
  });

  it('does not notify sibling views when it mounts', () => {
    // Regression test: emitting a global grid-resize event on mount caused
    // every other view in the grid to re-render (and DeckGL views to re-measure)
    // whenever any view mounted.
    const resizeCounts = [];
    function Sibling() {
      resizeCounts.push(useGridResize());
      return null;
    }
    const { rerender } = render(<><Sibling /></>);
    rerender(<><Sibling /><GridItem sizes={[]} /></>);
    expect(new Set(resizeCounts).size).toEqual(1);
  });
});
