import {
  CoordinationType,
  COMPONENT_COORDINATION_TYPES,
  ViewType,
} from '@vitessce/constants-internal';

// Coordination types which are captured by default (when available for a view):
// zoom/target, channel settings (colors, intensity ranges),
// and layer/channel visibility settings.
// For the (legacy) spatial view, channel settings and visibility are stored
// within the spatial*Layer values. For the spatialBeta view, they are stored
// within the multi-level *Layer values (serialized as `{ "$CL": [...] }`).
export const DEFAULT_CAPTURE_COORDINATION_TYPES = [
  CoordinationType.SPATIAL_ZOOM,
  CoordinationType.SPATIAL_TARGET_X,
  CoordinationType.SPATIAL_TARGET_Y,
  CoordinationType.SPATIAL_TARGET_Z,
  CoordinationType.EMBEDDING_ZOOM,
  CoordinationType.EMBEDDING_TARGET_X,
  CoordinationType.EMBEDDING_TARGET_Y,
  CoordinationType.SPATIAL_IMAGE_LAYER,
  CoordinationType.SPATIAL_SEGMENTATION_LAYER,
  CoordinationType.SPATIAL_POINT_LAYER,
  CoordinationType.SPATIAL_NEIGHBORHOOD_LAYER,
  CoordinationType.IMAGE_LAYER,
  CoordinationType.SEGMENTATION_LAYER,
  CoordinationType.SPOT_LAYER,
  CoordinationType.POINT_LAYER,
];

// Coordination types which cannot be captured into a frame:
// the annotation types (which are managed by the annotation controller),
// and structural types.
const NON_CAPTURABLE_COORDINATION_TYPES = [
  CoordinationType.DATASET,
  CoordinationType.META_COORDINATION_SCOPES,
  CoordinationType.META_COORDINATION_SCOPES_BY,
  CoordinationType.ANNOTATION_STORY,
  CoordinationType.ANNOTATION_FRAME_INDEX,
  CoordinationType.ANNOTATION_SHAPES,
  CoordinationType.ANNOTATION_OVERLAY_VISIBLE,
  CoordinationType.ANNOTATION_TRANSITION_DURATION,
  CoordinationType.ANNOTATION_SEMANTIC_ZOOM,
  CoordinationType.ANNOTATION_EDITABLE,
];

/**
 * Determine whether a view responds to annotation frames
 * (i.e., renders annotation shapes and merges frame coordination values).
 * Such views must have a uid, which frames use to target the view.
 * @param {object} view A view definition from the layout.
 * @returns {boolean} True if the view can be annotated.
 */
export function isAnnotatableView(view) {
  return Boolean(view.uid)
    && view.component !== ViewType.ANNOTATION_CONTROLLER
    && Boolean(COMPONENT_COORDINATION_TYPES[view.component]
      ?.includes(CoordinationType.ANNOTATION_SHAPES));
}

/**
 * Get the coordination types which may be captured for a view.
 * @param {string} component The view type.
 * @returns {string[]} The coordination types.
 */
export function getCapturableCoordinationTypes(component) {
  return (COMPONENT_COORDINATION_TYPES[component] || [])
    .filter(t => !NON_CAPTURABLE_COORDINATION_TYPES.includes(t));
}
