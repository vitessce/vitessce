export const Component = {
  DESCRIPTION: 'description',
  STATUS: 'status',
  FEATURES: 'features',
  OBS_SETS: 'obsSets',
  SCATTERPLOT: 'scatterplot',
  SPATIAL: 'spatial',
  HEATMAP: 'obsFeatureHeatmap',
  LAYER_CONTROLLER: 'layerController',
  OBS_SET_SIZES: 'obsSetSizes',
  GENOMIC_PROFILES: 'genomicProfiles',
  OBS_SET_FEATURE_DISTRIBUTION: 'obsSetFeatureDistribution',
  FEATURE_VALUE_HISTOGRAM: 'featureValueHistogram',
};

export const DataType = {
  OBS: 'obs',
  OBS_SETS: 'obsSets',
  OBS_FEATURE_MATRIX: 'obsFeatureMatrix',
  GENOMIC_PROFILES: 'genomicProfiles',
  SUB_OBS: 'subObs',
  SUB_OBS_SETS: 'subObsSets',
  SUB_OBS_SUB_FEATURE_MATRIX: 'subObsSubFeatureMatrix',
  NEIGHBORHOODS: 'neighborhoods',
  RASTER: 'raster',
  SUB_OBS_MAPPING: 'subObsMapping',
  SUB_FEATURE_MAPPING: 'subFeatureMapping',
};

export const EntityTypes = {
  OBS_TYPE: 'obsType',
  SUB_OBS_TYPE: 'subObsType',
  FEATURE_TYPE: 'featureType',
  SUB_FEATURE_TYPE: 'subFeatureType',
  FEATURE_VALUE_TYPE: 'featureValueType',
  SUB_FEATURE_VALUE_TYPE: 'subFeatureValueType',
};

export const FileType = {
  CELLS_JSON: 'cells.json',
  CELL_SETS_JSON: 'cellSets.json',
  EXPRESSION_MATRIX_ZARR: 'expressionMatrix.zarr',
  GENOMIC_PROFILES_ZARR: 'genomicProfiles.zarr',
  MOLECULES_JSON: 'molecules.json',
  NEIGHBORHOODS_JSON: 'neighborhoods.json',
  RASTER_JSON: 'raster.json',
  RASTER_OME_ZARR: 'raster.ome-zarr',
  EXPRESSION_MATRIX_JSON: 'expressionMatrix.json',
  GENES_JSON: 'genes.json',
  ANNDATA_OBS_SETS_ZARR: 'anndataObsSets.zarr',
  ANNDATA_OBS_ZARR: 'anndataObs.zarr',
  ANNDATA_OBS_FEATURE_MATRIX_ZARR: 'anndataObsFeatureMatrix.zarr',
  SUB_OBS_MAPPING_JSON: 'subObsMapping.json',
  SUB_FEATURE_MAPPING_JSON: 'subFeatureMapping.json',
};

// Which file types are supported by each data type?
export const FILE_TYPE_DATA_TYPE_MAPPING = {
  [FileType.CELLS_JSON]: DataType.OBS,
  [FileType.CELL_SETS_JSON]: DataType.OBS_SETS,
  [FileType.EXPRESSION_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENOMIC_PROFILES_ZARR]: DataType.GENOMIC_PROFILES,
  [FileType.MOLECULES_JSON]: DataType.SUB_OBS,
  [FileType.NEIGHBORHOODS_JSON]: DataType.NEIGHBORHOODS,
  [FileType.RASTER_JSON]: DataType.RASTER,
  [FileType.RASTER_OME_ZARR]: DataType.RASTER,
  [FileType.EXPRESSION_MATRIX_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENES_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.ANNDATA_OBS_ZARR]: DataType.OBS,
  [FileType.ANNDATA_OBS_SETS_ZARR]: DataType.OBS_SETS,
  [FileType.ANNDATA_OBS_FEATURE_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.SUB_OBS_MAPPING_JSON]: DataType.SUB_OBS_MAPPING,
  [FileType.SUB_FEATURE_MAPPING_JSON]: DataType.SUB_FEATURE_MAPPING,
};

// Which entity types are used for each data type?
export const DATA_TYPE_ENTITY_TYPES_MAPPING = {
  [DataType.OBS]: [EntityTypes.OBS_TYPE],
  [DataType.OBS_SETS]: [EntityTypes.OBS_TYPE],
  [DataType.OBS_FEATURE_MATRIX]: [
    EntityTypes.OBS_TYPE,
    EntityTypes.FEATURE_TYPE,
    EntityTypes.FEATURE_VALUE_TYPE,
  ],
  [DataType.SUB_OBS]: [EntityTypes.SUB_OBS_TYPE],
  [DataType.SUB_OBS_SETS]: [EntityTypes.SUB_OBS_TYPE],
  [DataType.SUB_OBS_MAPPING]: [EntityTypes.SUB_OBS_TYPE, EntityTypes.OBS_TYPE],
  [DataType.SUB_OBS_SUB_FEATURE_MATRIX]: [
    EntityTypes.SUB_OBS_TYPE,
    EntityTypes.SUB_FEATURE_TYPE,
    EntityTypes.SUB_FEATURE_VALUE_TYPE,
  ],
  [DataType.NEIGHBORHOODS]: [],
  [DataType.RASTER]: [],
  [DataType.SUB_FEATURE_MAPPING]: [EntityTypes.SUB_FEATURE_TYPE, EntityTypes.FEATURE_TYPE],
};

/**
 * Constants representing names of coordination types,
 * to help prevent typos.
 */
export const CoordinationType = {
  DATASET: 'dataset',

  // Observation type (e.g., cell)
  OBS_TYPE: 'obsType',
  OBS_FILTER: 'obsFilter',
  OBS_HIGHLIGHT: 'obsHighlight',
  OBS_SELECTION: 'obsSelection',
  OBS_SET_SELECTION: 'obsSetSelection',
  OBS_SET_HIGHLIGHT: 'obsSetHighlight',
  OBS_SET_COLOR: 'obsSetColor',
  OBS_COLOR_ENCODING: 'obsColorEncoding', // values: obsSetSelection, featureSelection, obsColor

  // Sub-observation type (e.g., molecule)
  SUB_OBS_TYPE: 'subObsType',
  SUB_OBS_FILTER: 'subObsFilter',
  SUB_OBS_HIGHLIGHT: 'subObsHighlight',
  SUB_OBS_SELECTION: 'subObsSelection',
  SUB_OBS_SET_SELECTION: 'subObsSetSelection',
  SUB_OBS_SET_HIGHLIGHT: 'subObsSetHighlight',
  SUB_OBS_SET_COLOR: 'subObsSetColor',
  SUB_OBS_COLOR_ENCODING: 'subObsColorEncoding', // values: subObsSetSelection, subFeatureSelection, subObsColor

  // Feature type (e.g., gene)
  FEATURE_TYPE: 'featureType',
  FEATURE_FILTER: 'featureFilter',
  FEATURE_HIGHLIGHT: 'featureHighlight',
  FEATURE_SELECTION: 'featureSelection',
  FEATURE_SET_SELECTION: 'featureSetSelection',
  FEATURE_SET_HIGHLIGHT: 'featureSetHighlight',
  FEATURE_SET_COLOR: 'featureSetColor',

  // Sub-feature type (e.g., transcript)
  SUB_FEATURE_TYPE: 'subFeatureType',
  SUB_FEATURE_FILTER: 'subFeatureFilter',
  SUB_FEATURE_HIGHLIGHT: 'subFeatureHighlight',
  SUB_FEATURE_SELECTION: 'subFeatureSelection',
  SUB_FEATURE_SET_SELECTION: 'subFeatureSetSelection',
  SUB_FEATURE_SET_HIGHLIGHT: 'subFeatureSetHighlight',
  SUB_FEATURE_SET_COLOR: 'subFeatureSetColor',

  // Feature value type (e.g., expression)
  FEATURE_VALUE_TYPE: 'featureValueType',
  FEATURE_VALUE_COLORMAP: 'featureValueColormap',
  FEATURE_VALUE_COLORMAP_RANGE: 'featureValueColormapRange',
  FEATURE_VALUE_TRANSFORM: 'featureValueTransform',

  // Sub-feature value type (e.g., intensity)
  SUB_FEATURE_VALUE_TYPE: 'subFeatureValueType',
  SUB_FEATURE_VALUE_COLORMAP: 'subFeatureValueColormap',
  SUB_FEATURE_VALUE_COLORMAP_RANGE: 'subFeatureValueColormapRange',
  SUB_FEATURE_VALUE_TRANSFORM: 'subFeatureValueTransform',

  EMBEDDING_TYPE: 'embeddingType',
  EMBEDDING_ZOOM: 'embeddingZoom',
  EMBEDDING_ROTATION: 'embeddingRotation',
  EMBEDDING_TARGET_X: 'embeddingTargetX',
  EMBEDDING_TARGET_Y: 'embeddingTargetY',
  EMBEDDING_TARGET_Z: 'embeddingTargetZ',
  EMBEDDING_OBS_SET_POLYGONS_VISIBLE: 'embeddingObsSetPolygonsVisible',
  EMBEDDING_OBS_SET_LABELS_VISIBLE: 'embeddingObsSetLabelsVisible',
  EMBEDDING_OBS_SET_LABEL_SIZE: 'embeddingObsSetLabelSize',
  EMBEDDING_OBS_RADIUS: 'embeddingObsRadius',
  EMBEDDING_OBS_RADIUS_MODE: 'embeddingObsRadiusMode',
  EMBEDDING_OBS_OPACITY: 'embeddingObsOpacity',
  EMBEDDING_OBS_OPACITY_MODE: 'embeddingObsOpacityMode',
  SPATIAL_ZOOM: 'spatialZoom',
  SPATIAL_ROTATION: 'spatialRotation',
  SPATIAL_TARGET_X: 'spatialTargetX',
  SPATIAL_TARGET_Y: 'spatialTargetY',
  SPATIAL_TARGET_Z: 'spatialTargetZ',
  SPATIAL_ROTATION_X: 'spatialRotationX',
  SPATIAL_ROTATION_Y: 'spatialRotationY',
  SPATIAL_ROTATION_Z: 'spatialRotationZ',
  SPATIAL_ROTATION_ORBIT: 'spatialRotationOrbit',
  SPATIAL_ORBIT_AXIS: 'spatialOrbitAxis',
  SPATIAL_AXIS_FIXED: 'spatialAxisFixed',
  HEATMAP_ZOOM_X: 'heatmapZoomX',
  HEATMAP_ZOOM_Y: 'heatmapZoomY',
  HEATMAP_TARGET_X: 'heatmapTargetX',
  HEATMAP_TARGET_Y: 'heatmapTargetY',
  SPATIAL_RASTER_LAYERS: 'spatialRasterLayers',
  SPATIAL_OBS_LAYER: 'spatialObsLayer',
  SPATIAL_SUB_OBS_LAYER: 'spatialSubObsLayer',
  SPATIAL_NEIGHBORHOODS_LAYER: 'spatialNeighborhoodsLayer',
  GENOMIC_ZOOM_X: 'genomicZoomX',
  GENOMIC_ZOOM_Y: 'genomicZoomY',
  GENOMIC_TARGET_X: 'genomicTargetX',
  GENOMIC_TARGET_Y: 'genomicTargetY',
  ADDITIONAL_OBS_SETS: 'additionalObsSets',
  ADDITIONAL_SUB_OBS_SETS: 'additionalSubObsSets',
  ADDITIONAL_FEATURE_SETS: 'additionalFeatureSets',
  ADDITIONAL_SUB_FEATURE_SETS: 'additionalSubFeatureSets',
};
