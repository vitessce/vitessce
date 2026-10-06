import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnnotationFrameTransition } from './annotation-transition.js';

describe('useAnnotationFrameTransition', () => {
  const frameViewState = { zoom: -2, targetX: 5, targetY: 6 };

  function renderTransitionHook(initialViewState) {
    return renderHook(
      ({ viewState }) => useAnnotationFrameTransition(viewState, frameViewState, 250),
      { initialProps: { viewState: initialViewState } },
    );
  }

  it('returns transition props when the view state changes to the frame values', () => {
    const { result, rerender } = renderTransitionHook({ zoom: 0, targetX: 0, targetY: 0 });
    expect(result.current).toBeNull();
    rerender({ viewState: { zoom: -2, targetX: 5, targetY: 6 } });
    expect(result.current.transitionDuration).toEqual(250);
    expect(result.current.transitionInterpolator).toBeDefined();
    // Unrelated re-renders keep the transition props, which deck.gl
    // ignores since the zoom/target have not changed.
    rerender({ viewState: { zoom: -2, targetX: 5, targetY: 6 } });
    expect(result.current.transitionDuration).toEqual(250);
  });

  it('returns null when the view state changes due to user interaction', () => {
    const { result, rerender } = renderTransitionHook({ zoom: -2, targetX: 5, targetY: 6 });
    rerender({ viewState: { zoom: -2, targetX: 7, targetY: 6 } });
    expect(result.current).toBeNull();
  });
});
