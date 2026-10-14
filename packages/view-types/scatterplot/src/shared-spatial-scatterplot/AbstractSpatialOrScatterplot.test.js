import { describe, it, expect } from 'vitest';
import AbstractSpatialOrScatterplot from './AbstractSpatialOrScatterplot.js';

const transitionInterpolator = {};

function getViewState(zoom, targetX, targetY, hasTransition) {
  return {
    zoom,
    target: [targetX, targetY, 0],
    ...(hasTransition ? { transitionDuration: 250, transitionInterpolator } : {}),
  };
}

function createInstance(viewState) {
  const instance = new AbstractSpatialOrScatterplot({ viewState });
  // The instance is not mounted, so apply state updates synchronously.
  instance.setState = (nextState) => {
    instance.state = { ...instance.state, ...nextState };
  };
  return instance;
}

describe('AbstractSpatialOrScatterplot.getDeckViewState', () => {
  it('passes the transition props to DeckGL to start a transition', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    const deckViewState = instance.getDeckViewState();
    expect(deckViewState.transitionDuration).toEqual(250);
    expect(deckViewState.transitionInterpolator).toBe(transitionInterpolator);
    expect(deckViewState.onTransitionEnd).toBe(instance.onTransitionEnd);
  });

  it('renders the intermediate values during the transition', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    instance.onTransitionStart();
    const intermediateViewState = getViewState(-1, 2, 3, false);
    instance.onViewStateChange({ viewState: intermediateViewState });
    expect(instance.getDeckViewState()).toBe(intermediateViewState);
  });

  it('omits the transition props after the transition ends, so it does not restart', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    instance.onTransitionStart();
    instance.onViewStateChange({ viewState: getViewState(-1.9, 4.8, 5.8, false) });
    instance.onViewStateChange({ viewState: getViewState(-2, 5, 6, false) });
    instance.onTransitionEnd();

    const deckViewState = instance.getDeckViewState();
    expect(deckViewState).toEqual(getViewState(-2, 5, 6, false));
    // Unrelated re-renders keep the transition props in the viewState prop.
    instance.props = { viewState: getViewState(-2, 5, 6, true) };
    expect(instance.getDeckViewState().transitionDuration).toBeUndefined();
  });

  it('omits the transition props after the transition is interrupted', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    instance.onTransitionStart();
    instance.onViewStateChange({ viewState: getViewState(-1, 2, 3, false) });
    instance.onTransitionInterrupt();
    expect(instance.getDeckViewState().transitionDuration).toBeUndefined();
  });

  it('animates a transition to the same values after the view state has changed', () => {
    const instance = createInstance(getViewState(-2, 5, 6, true));
    instance.onTransitionStart();
    instance.onTransitionEnd();
    expect(instance.getDeckViewState().transitionDuration).toBeUndefined();

    // For example, the user pans away from the annotation frame's view state.
    instance.props = { viewState: getViewState(-2, 7, 6, false) };
    expect(instance.getDeckViewState()).toEqual(getViewState(-2, 7, 6, false));

    // The same annotation frame is re-applied.
    instance.props = { viewState: getViewState(-2, 5, 6, true) };
    expect(instance.getDeckViewState().transitionDuration).toEqual(250);
  });
});
