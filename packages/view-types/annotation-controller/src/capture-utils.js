import {
  CoordinationType,
  COMPONENT_COORDINATION_TYPES,
  ViewType,
} from '@vitessce/constants-internal';

const CT = CoordinationType;

// Per-layer settings which are shared across the layer types of the spatialBeta view.
const SHARED_SPATIAL_LAYER_TYPES = [
  CT.SPATIAL_LAYER_VISIBLE,
  CT.SPATIAL_LAYER_OPACITY,
  CT.SPATIAL_LAYER_COLORMAP,
  CT.SPATIAL_LAYER_COLOR,
  CT.SPATIAL_LAYER_MODEL_MATRIX,
  CT.SPATIAL_LAYER_TRANSPARENT_COLOR,
];

// Categories of coordination types which may be captured into a frame.
// A coordination type may belong to multiple categories.
// Categories with isDefault are captured by default (when available for a view).
// For the (legacy) spatial view, channel settings and visibility are stored
// within the spatial*Layer values. For the spatialBeta view, they are stored
// within the multi-level *Layer values (serialized as `{ "$CL": [...] }`).
export const CAPTURE_CATEGORIES = [
  {
    key: 'spatialPanZoom',
    label: 'Spatial pan/zoom',
    isDefault: true,
    coordinationTypes: [
      CT.SPATIAL_ZOOM,
      CT.SPATIAL_TARGET_X,
      CT.SPATIAL_TARGET_Y,
      CT.SPATIAL_TARGET_Z,
      CT.SPATIAL_ROTATION,
      CT.SPATIAL_ROTATION_X,
      CT.SPATIAL_ROTATION_Y,
      CT.SPATIAL_ROTATION_Z,
      CT.SPATIAL_ROTATION_ORBIT,
      CT.SPATIAL_ORBIT_AXIS,
      CT.SPATIAL_AXIS_FIXED,
    ],
  },
  {
    key: 'spatialSlicing',
    label: 'Spatial 3D / slicing',
    isDefault: false,
    coordinationTypes: [
      CT.SPATIAL_TARGET_T,
      CT.SPATIAL_TARGET_C,
      CT.SPATIAL_SLICE_X,
      CT.SPATIAL_SLICE_Y,
      CT.SPATIAL_SLICE_Z,
      CT.SPATIAL_TARGET_RESOLUTION,
      CT.SPATIAL_MAX_RESOLUTION,
      CT.SPATIAL_RENDERING_MODE,
      CT.VOLUMETRIC_RENDERING_ALGORITHM,
    ],
  },
  {
    key: 'imageLayers',
    label: 'Image layers',
    isDefault: true,
    coordinationTypes: [
      CT.SPATIAL_IMAGE_LAYER,
      CT.IMAGE_LAYER,
      CT.IMAGE_CHANNEL,
      CT.SPATIAL_CHANNEL_COLOR,
      CT.SPATIAL_CHANNEL_VISIBLE,
      CT.SPATIAL_CHANNEL_OPACITY,
      CT.SPATIAL_CHANNEL_WINDOW,
      CT.SPATIAL_CHANNEL_LABELS_VISIBLE,
      CT.SPATIAL_CHANNEL_LABELS_ORIENTATION,
      CT.SPATIAL_CHANNEL_LABEL_SIZE,
      CT.SPATIAL_CHANNELS_SORT_ORDER,
      CT.PHOTOMETRIC_INTERPRETATION,
      ...SHARED_SPATIAL_LAYER_TYPES,
    ],
  },
  {
    key: 'segmentationLayers',
    label: 'Segmentation layers',
    isDefault: true,
    coordinationTypes: [
      CT.SPATIAL_SEGMENTATION_LAYER,
      CT.SEGMENTATION_LAYER,
      CT.SEGMENTATION_CHANNEL,
      CT.SPATIAL_SEGMENTATION_FILLED,
      CT.SPATIAL_SEGMENTATION_STROKE_WIDTH,
      ...SHARED_SPATIAL_LAYER_TYPES,
    ],
  },
  {
    key: 'spotLayers',
    label: 'Spot layers',
    isDefault: true,
    coordinationTypes: [
      CT.SPOT_LAYER,
      CT.SPATIAL_SPOT_RADIUS,
      CT.SPATIAL_SPOT_SHAPE,
      CT.SPATIAL_SPOT_FILLED,
      CT.SPATIAL_SPOT_STROKE_WIDTH,
      ...SHARED_SPATIAL_LAYER_TYPES,
    ],
  },
  {
    key: 'pointLayers',
    label: 'Point layers',
    isDefault: true,
    coordinationTypes: [
      CT.SPATIAL_POINT_LAYER,
      CT.POINT_LAYER,
      ...SHARED_SPATIAL_LAYER_TYPES,
    ],
  },
  {
    key: 'neighborhoodLayers',
    label: 'Neighborhood layers',
    isDefault: true,
    coordinationTypes: [
      CT.SPATIAL_NEIGHBORHOOD_LAYER,
    ],
  },
  {
    key: 'embeddingPanZoom',
    label: 'Embedding pan/zoom',
    isDefault: true,
    coordinationTypes: [
      CT.EMBEDDING_ZOOM,
      CT.EMBEDDING_TARGET_X,
      CT.EMBEDDING_TARGET_Y,
      CT.EMBEDDING_TARGET_Z,
      CT.EMBEDDING_ROTATION,
    ],
  },
  {
    key: 'embeddingAppearance',
    label: 'Embedding appearance',
    isDefault: false,
    coordinationTypes: [
      CT.EMBEDDING_OBS_RADIUS,
      CT.EMBEDDING_OBS_RADIUS_MODE,
      CT.EMBEDDING_OBS_OPACITY,
      CT.EMBEDDING_OBS_OPACITY_MODE,
      CT.EMBEDDING_POINTS_VISIBLE,
      CT.EMBEDDING_CONTOURS_VISIBLE,
      CT.EMBEDDING_CONTOURS_FILLED,
      CT.EMBEDDING_CONTOUR_PERCENTILES,
      CT.CONTOUR_COLOR_ENCODING,
      CT.CONTOUR_COLOR,
      CT.EMBEDDING_OBS_SET_POLYGONS_VISIBLE,
      CT.EMBEDDING_OBS_SET_LABELS_VISIBLE,
      CT.EMBEDDING_OBS_SET_LABEL_SIZE,
    ],
  },
  {
    key: 'obsSets',
    label: 'Obs sets & selection',
    isDefault: false,
    coordinationTypes: [
      CT.OBS_SET_SELECTION,
      CT.OBS_SET_FILTER,
      CT.OBS_SET_HIGHLIGHT,
      CT.OBS_SET_COLOR,
      CT.ADDITIONAL_OBS_SETS,
      CT.OBS_FILTER,
      CT.OBS_HIGHLIGHT,
      CT.SAMPLE_SET_SELECTION,
      CT.SAMPLE_SET_FILTER,
      CT.SAMPLE_SET_COLOR,
    ],
  },
  {
    key: 'featureColoring',
    label: 'Feature coloring',
    isDefault: false,
    coordinationTypes: [
      CT.FEATURE_SELECTION,
      CT.FEATURE_HIGHLIGHT,
      CT.FEATURE_COLOR,
      CT.FEATURE_FILTER_MODE,
      CT.FEATURE_VALUE_COLORMAP,
      CT.FEATURE_VALUE_COLORMAP_RANGE,
      CT.FEATURE_AGGREGATION_STRATEGY,
      CT.OBS_COLOR_ENCODING,
    ],
  },
];

// Category for the capturable coordination types which do not belong
// to any of the above categories (e.g., tooltip and legend visibility).
const OTHER_CATEGORY = {
  key: 'other',
  label: 'Other',
  isDefault: false,
};

// Coordination types which cannot be captured into a frame:
// the annotation types (which are managed by the annotation controller),
// and structural types (such as data types, which select the data to load).
const NON_CAPTURABLE_COORDINATION_TYPES = [
  CoordinationType.DATASET,
  CoordinationType.FILE_UID,
  CoordinationType.OBS_TYPE,
  CoordinationType.OBS_LABELS_TYPE,
  CoordinationType.FEATURE_TYPE,
  CoordinationType.FEATURE_VALUE_TYPE,
  CoordinationType.EMBEDDING_TYPE,
  CoordinationType.SAMPLE_TYPE,
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

/**
 * Get the categories of coordination types which may be captured for a view.
 * Each category only includes the coordination types supported by the view,
 * and empty categories are omitted.
 * @param {string} component The view type.
 * @returns {object[]} The categories, as { key, label, isDefault, coordinationTypes }.
 */
export function getCaptureCategories(component) {
  const capturableTypes = getCapturableCoordinationTypes(component);
  const categories = CAPTURE_CATEGORIES.map(category => ({
    ...category,
    coordinationTypes: category.coordinationTypes.filter(t => capturableTypes.includes(t)),
  }));
  const otherTypes = capturableTypes.filter(t => !CAPTURE_CATEGORIES
    .some(category => category.coordinationTypes.includes(t)));
  return [...categories, { ...OTHER_CATEGORY, coordinationTypes: otherTypes }]
    .filter(category => category.coordinationTypes.length > 0);
}

/**
 * Get the coordination types which are captured by default for a view.
 * @param {string} component The view type.
 * @returns {string[]} The coordination types.
 */
export function getDefaultCaptureCoordinationTypes(component) {
  const types = getCaptureCategories(component)
    .filter(category => category.isDefault)
    .flatMap(category => category.coordinationTypes);
  return [...new Set(types)];
}
