import { useEffect, useMemo, useRef } from 'react';
import { deck } from '@vitessce/gl';
import { isAnnotationFrameViewStateChange } from '@vitessce/utils';

const TRANSITION_INTERPOLATOR = new deck.LinearInterpolator(['target', 'zoom']);

/**
 * Get the deck.gl viewState transition props to animate the 2D zoom/target
 * of a view when they change as a result of applying an annotation frame.
 * Changes which are not caused by the frame (e.g., the user panning/zooming,
 * or a linked view) are not animated.
 * @param {object} viewState The current { zoom, targetX, targetY }
 * values from the coordination space.
 * @param {object|null|undefined} frameViewState The { zoom, targetX, targetY }
 * values that the current annotation frame defines for the view
 * (values which the frame does not define should be undefined).
 * @param {number|null|undefined} transitionDuration The transition duration, in milliseconds.
 * @returns {object|null} The { transitionDuration, transitionInterpolator }
 * props to add to the deck.gl viewState, or null.
 */
export function useAnnotationFrameTransition(viewState, frameViewState, transitionDuration) {
  const { zoom, targetX, targetY } = viewState;
  // The view state values as of the previous commit.
  const prevViewStateRef = useRef(viewState);

  const transitionProps = useMemo(() => {
    const isFrameChange = isAnnotationFrameViewStateChange(
      prevViewStateRef.current, { zoom, targetX, targetY }, frameViewState,
    );
    if (isFrameChange && transitionDuration > 0) {
      return {
        transitionDuration,
        transitionInterpolator: TRANSITION_INTERPOLATOR,
      };
    }
    return null;
  // Deliberate dependency omissions: frameViewState and transitionDuration,
  // since the transition should only start when the view state values change
  // (the frame changes before its values have been merged into the coordination space).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, targetX, targetY]);

  useEffect(() => {
    prevViewStateRef.current = { zoom, targetX, targetY };
  }, [zoom, targetX, targetY]);

  return transitionProps;
}
