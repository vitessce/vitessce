import { describe, it, expect, vi } from 'vitest';
import { deck } from '@vitessce/gl';
import AbstractSpatialOrScatterplot, {
  createStepMarkingInterpolator,
} from './AbstractSpatialOrScatterplot.js';

const transitionInterpolator = new deck.LinearInterpolator(['target', 'zoom']);

function getViewState(zoom, targetX, targetY, hasTransition) {
  return {
    zoom,
    target: [targetX, targetY, 0],
    ...(hasTransition ? { transitionDuration: 250, transitionInterpolator } : {}),
  };
}

function createInstance(viewState, setViewState = vi.fn()) {
  const instance = new AbstractSpatialOrScatterplot({ viewState, setViewState });
  // The instance is not mounted, so apply state updates synchronously.
  instance.setState = (nextState) => {
    instance.state = { ...instance.state, ...nextState };
  };
  return instance;
}

/**
 * Emulate DeckGL computing (and then emitting) a step of the transition,
 * using the interpolator from the viewState that was passed to DeckGL.
 */
function getTransitionStep(deckViewState, startViewState, t) {
  const stepProps = deckViewState.transitionInterpolator.interpolateProps(
    startViewState, deckViewState, t,
  );
  // DeckGL emits a new object containing the interpolated values.
  return { ...stepProps, target: [...stepProps.target] };
}

describe('createStepMarkingInterpolator', () => {
  it('reports each step and delegates to the original interpolator', () => {
    const onStep = vi.fn();
    const wrapper = createStepMarkingInterpolator(transitionInterpolator, onStep);
    const start = getViewState(0, 0, 0, false);
    const end = getViewState(-2, 10, 20, false);
    const step = wrapper.interpolateProps(start, end, 0.5);
    expect(step).toEqual(transitionInterpolator.interpolateProps(start, end, 0.5));
    expect(onStep).toHaveBeenCalledWith(step);
    expect(wrapper.arePropsEqual(start, end)).toBe(false);
    expect(wrapper.arePropsEqual(start, start)).toBe(true);
  });
});

describe('AbstractSpatialOrScatterplot.getDeckViewState', () => {
  it('passes the transition props to DeckGL to start a transition', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    const deckViewState = instance.getDeckViewState();
    expect(deckViewState.transitionDuration).toEqual(250);
    // The interpolator is wrapped, to mark the transition steps.
    expect(Object.getPrototypeOf(deckViewState.transitionInterpolator))
      .toBe(transitionInterpolator);
    expect(deckViewState.onTransitionEnd).toBe(instance.onTransitionEnd);
    // The wrapper is stable across renders.
    expect(instance.getDeckViewState().transitionInterpolator)
      .toBe(deckViewState.transitionInterpolator);
  });

  it('renders the intermediate values during the transition, without emitting them', () => {
    const setViewState = vi.fn();
    const instance = createInstance(getViewState(-2, 5, 6, true), setViewState);
    const deckViewState = instance.getDeckViewState();
    instance.onTransitionStart();
    const step = getTransitionStep(deckViewState, getViewState(0, 0, 0, false), 0.5);
    instance.onViewStateChange({ viewState: step });
    expect(instance.getDeckViewState()).toBe(step);
    expect(setViewState).not.toHaveBeenCalled();
  });

  it('omits the transition props after the transition ends, so it does not restart', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    const deckViewState = instance.getDeckViewState();
    const start = getViewState(-1.9, 4.8, 5.8, false);
    instance.onTransitionStart();
    instance.onViewStateChange({ viewState: getTransitionStep(deckViewState, start, 0.5) });
    instance.onViewStateChange({ viewState: getTransitionStep(deckViewState, start, 1) });
    instance.onTransitionEnd();

    expect(instance.getDeckViewState()).toEqual(getViewState(-2, 5, 6, false));
    // Unrelated re-renders keep the transition props in the viewState prop.
    instance.props = { ...instance.props, viewState: getViewState(-2, 5, 6, true) };
    expect(instance.getDeckViewState().transitionDuration).toBeUndefined();
  });

  it('omits the transition props after the transition is interrupted', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    const deckViewState = instance.getDeckViewState();
    instance.onTransitionStart();
    instance.onViewStateChange({
      viewState: getTransitionStep(deckViewState, getViewState(0, 0, 0, false), 0.5),
    });
    instance.onTransitionInterrupt();
    expect(instance.getDeckViewState().transitionDuration).toBeUndefined();
  });

  it('animates a transition to the same values after the view state has changed', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    instance.getDeckViewState();
    instance.onTransitionStart();
    instance.onTransitionEnd();
    expect(instance.getDeckViewState().transitionDuration).toBeUndefined();

    // For example, the user pans away from the annotation frame's view state.
    instance.props = { ...instance.props, viewState: getViewState(-2, 7, 6, false) };
    expect(instance.getDeckViewState()).toEqual(getViewState(-2, 7, 6, false));

    // The same annotation frame is re-applied.
    instance.props = { ...instance.props, viewState: getViewState(-2, 5, 6, true) };
    expect(instance.getDeckViewState().transitionDuration).toEqual(250);
  });
});

describe('AbstractSpatialOrScatterplot user interaction and transitions', () => {
  it('emits a user interaction during the transition, which ends the transition', () => {
    const setViewState = vi.fn();
    const instance = createInstance(getViewState(-2, 5, 6, true), setViewState);
    const deckViewState = instance.getDeckViewState();
    const start = getViewState(0, 0, 0, false);
    instance.onTransitionStart();
    instance.onViewStateChange({ viewState: getTransitionStep(deckViewState, start, 0.3) });

    // The user pans (DeckGL computes this from the rendered intermediate values).
    const userViewState = { ...getViewState(-0.6, 40, 2, false), transitionDuration: 0 };
    instance.onViewStateChange({ viewState: userViewState });
    expect(setViewState).toHaveBeenCalledTimes(1);
    expect(setViewState.mock.calls[0][0].target).toEqual(userViewState.target);
    expect(instance.transitionEndViewState).toBeNull();

    // A step which DeckGL emits before it interrupts the transition is not emitted.
    instance.onViewStateChange({ viewState: getTransitionStep(deckViewState, start, 0.35) });
    expect(setViewState).toHaveBeenCalledTimes(1);

    // Until the viewState prop is updated, the transition end values are rendered,
    // without the transition props, which interrupts the transition in DeckGL.
    expect(instance.getDeckViewState()).toEqual(getViewState(-2, 5, 6, false));
    instance.onTransitionInterrupt();
    expect(instance.getDeckViewState().transitionDuration).toBeUndefined();
  });

  it('emits user interactions even if DeckGL never ends the transition', () => {
    const setViewState = vi.fn();
    const instance = createInstance(getViewState(-2, 5, 6, true), setViewState);
    const deckViewState = instance.getDeckViewState();
    instance.onTransitionStart();
    instance.onViewStateChange({
      viewState: getTransitionStep(deckViewState, getViewState(0, 0, 0, false), 1),
    });
    // Neither onTransitionEnd nor onTransitionInterrupt is called.

    // The user pans and zooms away from the end of the transition.
    instance.onViewStateChange({
      viewState: { ...getViewState(-2, 50, 6, false), transitionDuration: 0 },
    });
    instance.onViewStateChange({
      viewState: { ...getViewState(-1, 50, 6, false), transitionDuration: 1 },
    });
    expect(setViewState).toHaveBeenCalledTimes(2);
    expect(setViewState.mock.calls[1][0].zoom).toEqual(-1);
  });
});
