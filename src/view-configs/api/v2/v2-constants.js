export const ViewType = {
  DESCRIPTION: 'description',
  STATUS: 'status',
  FEATURES: 'features',
  OBS_SETS: 'obsSets',
  OBS_SCATTERPLOT: 'obsScatterplot',
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
  NEIGHBORHOODS: 'neighborhoods',
  RASTER: 'raster',
};

export const EntityTypes = {
  OBS_TYPE: 'obsType',
  FEATURE_TYPE: 'featureType',
  FEATURE_VALUE_TYPE: 'featureValueType',
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

  // Feature type (e.g., gene)
  FEATURE_TYPE: 'featureType',
  FEATURE_FILTER: 'featureFilter',
  FEATURE_HIGHLIGHT: 'featureHighlight',
  FEATURE_SELECTION: 'featureSelection',
  FEATURE_SET_SELECTION: 'featureSetSelection',
  FEATURE_SET_HIGHLIGHT: 'featureSetHighlight',
  FEATURE_SET_COLOR: 'featureSetColor',

  // Feature value type (e.g., expression)
  FEATURE_VALUE_TYPE: 'featureValueType',
  FEATURE_VALUE_COLORMAP: 'featureValueColormap',
  FEATURE_VALUE_COLORMAP_RANGE: 'featureValueColormapRange',
  FEATURE_VALUE_TRANSFORM: 'featureValueTransform',

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
  SPATIAL_NEIGHBORHOODS_LAYER: 'spatialNeighborhoodsLayer',
  GENOMIC_ZOOM_X: 'genomicZoomX',
  GENOMIC_ZOOM_Y: 'genomicZoomY',
  GENOMIC_TARGET_X: 'genomicTargetX',
  GENOMIC_TARGET_Y: 'genomicTargetY',
  ADDITIONAL_OBS_SETS: 'additionalObsSets',
  ADDITIONAL_FEATURE_SETS: 'additionalFeatureSets',
};
