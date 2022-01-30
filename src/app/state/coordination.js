import { CoordinationType, Component } from '../constants';

/**
 * Coordination types may have default values,
 * which can be defined here, and used by the
 * auto initialization strategy.
 */
export const DEFAULT_COORDINATION_VALUES = {
  [CoordinationType.OBS_TYPE]: 'cell',
  [CoordinationType.OBS_FILTER]: null,
  [CoordinationType.OBS_HIGHLIGHT]: null,
  [CoordinationType.OBS_SELECTION]: null,
  [CoordinationType.OBS_SET_SELECTION]: null,
  [CoordinationType.OBS_SET_HIGHLIGHT]: null,
  [CoordinationType.OBS_SET_COLOR]: null,
  [CoordinationType.OBS_COLOR_ENCODING]: 'obsSetSelection',

  [CoordinationType.SUB_OBS_TYPE]: 'molecule',
  [CoordinationType.SUB_OBS_FILTER]: null,
  [CoordinationType.SUB_OBS_HIGHLIGHT]: null,
  [CoordinationType.SUB_OBS_SELECTION]: null,
  [CoordinationType.SUB_OBS_SET_SELECTION]: null,
  [CoordinationType.SUB_OBS_SET_HIGHLIGHT]: null,
  [CoordinationType.SUB_OBS_SET_COLOR]: null,
  [CoordinationType.SUB_OBS_COLOR_ENCODING]: 'subObsSetSelection',

  [CoordinationType.FEATURE_TYPE]: 'gene',
  [CoordinationType.FEATURE_FILTER]: null,
  [CoordinationType.FEATURE_HIGHLIGHT]: null,
  [CoordinationType.FEATURE_SELECTION]: null,
  [CoordinationType.FEATURE_SET_SELECTION]: null,
  [CoordinationType.FEATURE_SET_HIGHLIGHT]: null,
  [CoordinationType.FEATURE_SET_COLOR]: null,

  [CoordinationType.SUB_FEATURE_TYPE]: 'transcript',
  [CoordinationType.SUB_FEATURE_FILTER]: null,
  [CoordinationType.SUB_FEATURE_HIGHLIGHT]: null,
  [CoordinationType.SUB_FEATURE_SELECTION]: null,
  [CoordinationType.SUB_FEATURE_SET_SELECTION]: null,
  [CoordinationType.SUB_FEATURE_SET_HIGHLIGHT]: null,
  [CoordinationType.SUB_FEATURE_SET_COLOR]: null,

  [CoordinationType.FEATURE_VALUE_TYPE]: 'expression',
  [CoordinationType.FEATURE_VALUE_COLORMAP]: 'plasma',
  [CoordinationType.FEATURE_VALUE_COLORMAP_RANGE]: [0.0, 1.0],
  [CoordinationType.FEATURE_VALUE_TRANSFORM]: null,

  [CoordinationType.SUB_FEATURE_VALUE_TYPE]: 'intensity',
  [CoordinationType.SUB_FEATURE_VALUE_COLORMAP]: 'plasma',
  [CoordinationType.SUB_FEATURE_VALUE_COLORMAP_RANGE]: [0.0, 1.0],
  [CoordinationType.SUB_FEATURE_VALUE_TRANSFORM]: null,

  [CoordinationType.EMBEDDING_ZOOM]: null,
  [CoordinationType.EMBEDDING_ROTATION]: 0,
  [CoordinationType.EMBEDDING_TARGET_X]: null,
  [CoordinationType.EMBEDDING_TARGET_Y]: null,
  [CoordinationType.EMBEDDING_TARGET_Z]: 0,
  [CoordinationType.EMBEDDING_CELL_SET_POLYGONS_VISIBLE]: false, // change name
  [CoordinationType.EMBEDDING_CELL_SET_LABELS_VISIBLE]: false, // change name
  [CoordinationType.EMBEDDING_CELL_SET_LABEL_SIZE]: 14, // change name
  [CoordinationType.EMBEDDING_CELL_RADIUS]: 1, // change name
  [CoordinationType.EMBEDDING_CELL_RADIUS_MODE]: 'auto', // change name
  [CoordinationType.EMBEDDING_CELL_OPACITY]: 1, // change name
  [CoordinationType.EMBEDDING_CELL_OPACITY_MODE]: 'auto', // change name
  [CoordinationType.SPATIAL_ZOOM]: null,
  [CoordinationType.SPATIAL_ROTATION]: 0,
  [CoordinationType.SPATIAL_TARGET_X]: null,
  [CoordinationType.SPATIAL_TARGET_Y]: null,
  [CoordinationType.SPATIAL_TARGET_Z]: null,
  [CoordinationType.SPATIAL_ROTATION_X]: null,
  [CoordinationType.SPATIAL_ROTATION_Y]: null,
  [CoordinationType.SPATIAL_ROTATION_Z]: null,
  [CoordinationType.SPATIAL_AXIS_FIXED]: false,
  [CoordinationType.SPATIAL_ROTATION_ORBIT]: 0,
  [CoordinationType.SPATIAL_ORBIT_AXIS]: 'Y',
  [CoordinationType.SPATIAL_RASTER_LAYERS]: null,
  [CoordinationType.SPATIAL_CELLS_LAYER]: null, // change name
  [CoordinationType.SPATIAL_MOLECULES_LAYER]: null, // change name
  [CoordinationType.SPATIAL_NEIGHBORHOODS_LAYER]: null,
  [CoordinationType.HEATMAP_ZOOM_X]: 0,
  [CoordinationType.HEATMAP_ZOOM_Y]: 0,
  [CoordinationType.HEATMAP_TARGET_X]: 0,
  [CoordinationType.HEATMAP_TARGET_Y]: 0,
  [CoordinationType.GENE_EXPRESSION_COLORMAP]: 'plasma', // deprecate
  [CoordinationType.GENE_EXPRESSION_COLORMAP_RANGE]: [0.0, 1.0], // deprecate
  [CoordinationType.GENE_EXPRESSION_TRANSFORM]: null, // deprecate
  [CoordinationType.GENE_FILTER]: null, // deprecate
  [CoordinationType.GENE_HIGHLIGHT]: null, // deprecate
  [CoordinationType.GENE_SELECTION]: null, // deprecate
  [CoordinationType.CELL_FILTER]: null, // deprecate
  [CoordinationType.CELL_HIGHLIGHT]: null, // deprecate
  [CoordinationType.CELL_SET_SELECTION]: null, // deprecate
  [CoordinationType.CELL_SET_HIGHLIGHT]: null, // deprecate
  [CoordinationType.CELL_SET_COLOR]: null, // deprecate
  [CoordinationType.CELL_COLOR_ENCODING]: 'cellSetSelection', // deprecate
  [CoordinationType.GENOMIC_ZOOM_X]: 0,
  [CoordinationType.GENOMIC_ZOOM_Y]: 0,
  [CoordinationType.GENOMIC_TARGET_X]: 1549999999.5,
  [CoordinationType.GENOMIC_TARGET_Y]: 1549999999.5,
  [CoordinationType.ADDITIONAL_CELL_SETS]: null, // deprecate
  [CoordinationType.MOLECULE_HIGHLIGHT]: null, // deprecate
};

// The following coordination types should be
// initialized to independent scopes when
// initialized automatically.
// These make the resulting view config
// (after auto-initialization) behave
// like "legacy" Vitessce (pre-coordination model).
export const AUTO_INDEPENDENT_COORDINATION_TYPES = [
  CoordinationType.HEATMAP_ZOOM_X,
  CoordinationType.HEATMAP_ZOOM_Y,
  CoordinationType.HEATMAP_TARGET_X,
  CoordinationType.HEATMAP_TARGET_Y,
  CoordinationType.EMBEDDING_ZOOM,
  CoordinationType.EMBEDDING_TARGET_X,
  CoordinationType.EMBEDDING_TARGET_Y,
  CoordinationType.EMBEDDING_TARGET_Z,
  CoordinationType.EMBEDDING_CELL_SET_POLYGONS_VISIBLE,
  CoordinationType.EMBEDDING_CELL_SET_LABELS_VISIBLE,
  CoordinationType.EMBEDDING_CELL_SET_LABEL_SIZE,
  CoordinationType.EMBEDDING_CELL_RADIUS,
  CoordinationType.EMBEDDING_CELL_OPACITY,
];

/**
   * Mapping from component type to
   * supported coordination object types.
   * This mapping can be used to determine
   * which pieces of state that a component will
   * need to get/set.
   * Keys here are the component registry keys.
   */
export const COMPONENT_COORDINATION_TYPES = {
  [Component.SCATTERPLOT]: [
    CoordinationType.DATASET,
    CoordinationType.EMBEDDING_TYPE,
    CoordinationType.EMBEDDING_ZOOM,
    CoordinationType.EMBEDDING_ROTATION,
    CoordinationType.EMBEDDING_TARGET_X,
    CoordinationType.EMBEDDING_TARGET_Y,
    CoordinationType.EMBEDDING_TARGET_Z,
    CoordinationType.EMBEDDING_CELL_SET_POLYGONS_VISIBLE,
    CoordinationType.EMBEDDING_CELL_SET_LABELS_VISIBLE,
    CoordinationType.EMBEDDING_CELL_SET_LABEL_SIZE,
    CoordinationType.EMBEDDING_CELL_RADIUS,
    CoordinationType.EMBEDDING_CELL_RADIUS_MODE,
    CoordinationType.EMBEDDING_CELL_OPACITY,
    CoordinationType.EMBEDDING_CELL_OPACITY_MODE,
    CoordinationType.CELL_FILTER,
    CoordinationType.CELL_HIGHLIGHT,
    CoordinationType.CELL_SET_SELECTION,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.CELL_SET_COLOR,
    CoordinationType.GENE_HIGHLIGHT,
    CoordinationType.GENE_SELECTION,
    CoordinationType.GENE_EXPRESSION_COLORMAP,
    CoordinationType.GENE_EXPRESSION_COLORMAP_RANGE,
    CoordinationType.CELL_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_CELL_SETS,
  ],
  [Component.SPATIAL]: [
    CoordinationType.DATASET,
    CoordinationType.SPATIAL_ZOOM,
    CoordinationType.SPATIAL_ROTATION,
    CoordinationType.SPATIAL_RASTER_LAYERS,
    CoordinationType.SPATIAL_CELLS_LAYER,
    CoordinationType.SPATIAL_MOLECULES_LAYER,
    CoordinationType.SPATIAL_NEIGHBORHOODS_LAYER,
    CoordinationType.SPATIAL_TARGET_X,
    CoordinationType.SPATIAL_TARGET_Y,
    CoordinationType.SPATIAL_TARGET_Z,
    CoordinationType.SPATIAL_ROTATION_X,
    CoordinationType.SPATIAL_ROTATION_Y,
    CoordinationType.SPATIAL_ROTATION_Z,
    CoordinationType.SPATIAL_ROTATION_ORBIT,
    CoordinationType.SPATIAL_ORBIT_AXIS,
    CoordinationType.SPATIAL_AXIS_FIXED,
    CoordinationType.CELL_FILTER,
    CoordinationType.CELL_HIGHLIGHT,
    CoordinationType.CELL_SET_SELECTION,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.CELL_SET_COLOR,
    CoordinationType.GENE_HIGHLIGHT,
    CoordinationType.GENE_SELECTION,
    CoordinationType.GENE_EXPRESSION_COLORMAP,
    CoordinationType.GENE_EXPRESSION_COLORMAP_RANGE,
    CoordinationType.CELL_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_CELL_SETS,
    CoordinationType.MOLECULE_HIGHLIGHT,
  ],
  [Component.HEATMAP]: [
    CoordinationType.DATASET,
    CoordinationType.HEATMAP_ZOOM_X,
    CoordinationType.HEATMAP_ZOOM_Y,
    CoordinationType.HEATMAP_TARGET_X,
    CoordinationType.HEATMAP_TARGET_Y,
    CoordinationType.CELL_FILTER,
    CoordinationType.CELL_HIGHLIGHT,
    CoordinationType.CELL_SET_SELECTION,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.CELL_SET_COLOR,
    CoordinationType.GENE_FILTER,
    CoordinationType.GENE_HIGHLIGHT,
    CoordinationType.GENE_SELECTION,
    CoordinationType.GENE_EXPRESSION_COLORMAP,
    CoordinationType.GENE_EXPRESSION_COLORMAP_RANGE,
    CoordinationType.CELL_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_CELL_SETS,
  ],
  [Component.CELL_SETS]: [
    CoordinationType.DATASET,
    CoordinationType.CELL_SET_SELECTION,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.CELL_SET_COLOR,
    CoordinationType.CELL_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_CELL_SETS,
    CoordinationType.GENE_SELECTION,
  ],
  [Component.CELL_SET_SIZES]: [
    CoordinationType.DATASET,
    CoordinationType.CELL_SET_SELECTION,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.CELL_SET_COLOR,
    CoordinationType.ADDITIONAL_CELL_SETS,
  ],
  [Component.STATUS]: [
    CoordinationType.DATASET,
    CoordinationType.CELL_HIGHLIGHT,
    CoordinationType.GENE_HIGHLIGHT,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.MOLECULE_HIGHLIGHT,
  ],
  [Component.GENES]: [
    CoordinationType.DATASET,
    CoordinationType.GENE_FILTER,
    CoordinationType.GENE_HIGHLIGHT,
    CoordinationType.GENE_SELECTION,
    CoordinationType.CELL_COLOR_ENCODING,
    CoordinationType.CELL_SET_SELECTION,
  ],
  [Component.CELL_SET_EXPRESSION]: [
    CoordinationType.DATASET,
    CoordinationType.GENE_SELECTION,
    CoordinationType.GENE_EXPRESSION_TRANSFORM,
    CoordinationType.CELL_SET_SELECTION,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.CELL_SET_COLOR,
    CoordinationType.ADDITIONAL_CELL_SETS,
  ],
  [Component.EXPRESSION_HISTOGRAM]: [
    CoordinationType.DATASET,
    CoordinationType.GENE_SELECTION,
  ],
  [Component.LAYER_CONTROLLER]: [
    CoordinationType.DATASET,
    CoordinationType.SPATIAL_RASTER_LAYERS,
    CoordinationType.SPATIAL_CELLS_LAYER,
    CoordinationType.SPATIAL_MOLECULES_LAYER,
    CoordinationType.SPATIAL_NEIGHBORHOODS_LAYER,
    CoordinationType.SPATIAL_ZOOM,
    CoordinationType.SPATIAL_TARGET_X,
    CoordinationType.SPATIAL_TARGET_Y,
    CoordinationType.SPATIAL_TARGET_Z,
    CoordinationType.SPATIAL_ROTATION_X,
    CoordinationType.SPATIAL_ROTATION_Y,
    CoordinationType.SPATIAL_ROTATION_Z,
    CoordinationType.SPATIAL_ROTATION_ORBIT,
    CoordinationType.SPATIAL_ORBIT_AXIS,
  ],
  [Component.GENOMIC_PROFILES]: [
    CoordinationType.DATASET,
    CoordinationType.GENOMIC_ZOOM_X,
    CoordinationType.GENOMIC_ZOOM_Y,
    CoordinationType.GENOMIC_TARGET_X,
    CoordinationType.GENOMIC_TARGET_Y,
    CoordinationType.GENE_FILTER,
    CoordinationType.GENE_HIGHLIGHT,
    CoordinationType.GENE_SELECTION,
    CoordinationType.CELL_SET_SELECTION,
    CoordinationType.CELL_SET_HIGHLIGHT,
    CoordinationType.CELL_SET_COLOR,
    CoordinationType.ADDITIONAL_CELL_SETS,
  ],
  [Component.DESCRIPTION]: [
    CoordinationType.DATASET,
    CoordinationType.SPATIAL_RASTER_LAYERS,
  ],
  higlass: [
    CoordinationType.DATASET,
    CoordinationType.GENOMIC_ZOOM_X,
    CoordinationType.GENOMIC_ZOOM_Y,
    CoordinationType.GENOMIC_TARGET_X,
    CoordinationType.GENOMIC_TARGET_Y,
    CoordinationType.GENE_FILTER,
    CoordinationType.GENE_HIGHLIGHT,
    CoordinationType.GENE_SELECTION,
  ],
};
