type AnnotationFrameView = {
  uid: string;
  coordinationValues?: Record<string, unknown>;
};

type AnnotationStory = {
  frames?: Array<{ layout?: AnnotationFrameView[] }>;
};

/**
 * Get the coordination values that the current annotation frame
 * defines for a particular view.
 * @param annotationStory The annotation story object.
 * @param annotationFrameIndex The index of the current frame, or null if no frame is active.
 * @param viewUid The uid of the view of interest.
 * @returns The per-view coordination values for the frame,
 * or undefined if no frame is active or the frame does not include the view.
 */
export function getAnnotationFrameCoordinationValues(
  annotationStory: AnnotationStory | null | undefined,
  annotationFrameIndex: number | null | undefined,
  viewUid: string,
): Record<string, unknown> | undefined {
  if (typeof annotationFrameIndex !== 'number') {
    return undefined;
  }
  return annotationStory?.frames?.[annotationFrameIndex]?.layout
    ?.find(v => v.uid === viewUid)
    ?.coordinationValues;
}

/**
 * The 2D view state values which can be animated
 * when transitioning between annotation frames.
 */
export type AnnotationTransitionViewState = {
  zoom: number | null | undefined;
  targetX: number | null | undefined;
  targetY: number | null | undefined;
};

const TRANSITION_VIEW_STATE_KEYS = ['zoom', 'targetX', 'targetY'] as const;

/**
 * Determine whether a change in the view state was caused by
 * applying the current annotation frame (as opposed to, e.g., the user
 * panning/zooming, or a linked view), and should therefore be animated.
 * The change is attributed to the frame when at least one value changed,
 * and every value that changed is defined by the frame and
 * now matches the frame's value.
 * @param prevViewState The previous view state values.
 * @param nextViewState The next view state values.
 * @param frameViewState The view state values that the current frame defines
 * for the view. Values which the frame does not define should be undefined.
 * @returns Whether the change should be animated.
 */
export function isAnnotationFrameViewStateChange(
  prevViewState: AnnotationTransitionViewState,
  nextViewState: AnnotationTransitionViewState,
  frameViewState: Partial<AnnotationTransitionViewState> | null | undefined,
): boolean {
  if (!frameViewState) {
    return false;
  }
  const changedKeys = TRANSITION_VIEW_STATE_KEYS
    .filter(key => prevViewState[key] !== nextViewState[key]);
  return changedKeys.length > 0 && changedKeys.every(key => (
    typeof prevViewState[key] === 'number'
    && typeof nextViewState[key] === 'number'
    && frameViewState[key] === nextViewState[key]
  ));
}
