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
