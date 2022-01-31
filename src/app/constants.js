export const Component = {
  DESCRIPTION: 'description',
  STATUS: 'status',
  GENES: 'genes', // deprecate
  FEATURES: 'features',
  CELL_SETS: 'cellSets', // deprecate
  OBS_SETS: 'obsSets',
  SCATTERPLOT: 'scatterplot',
  SPATIAL: 'spatial',
  HEATMAP: 'heatmap',
  LAYER_CONTROLLER: 'layerController',
  CELL_SET_SIZES: 'cellSetSizes', // deprecate
  OBS_SET_SIZES: 'obsSetSizes',
  GENOMIC_PROFILES: 'genomicProfiles',
  CELL_SET_EXPRESSION: 'cellSetExpression', // deprecate
  OBS_SET_FEATURE_DISTRIBUTION: 'obsSetFeatureDistribution',
  EXPRESSION_HISTOGRAM: 'expressionHistogram', // deprecate
  FEATURE_VALUE_HISTOGRAM: 'featureValueHistogram',
};

export const DataType = {
  CELLS: 'cells', // deprecate
  OBS: 'obs',
  CELL_SETS: 'cell-sets', // deprecate
  OBS_SETS: 'obs-sets',
  EXPRESSION_MATRIX: 'expression-matrix', // deprecate
  OBS_FEATURE_MATRIX: 'obs-feature-matrix',
  GENOMIC_PROFILES: 'genomic-profiles',
  MOLECULES: 'molecules', // deprecate
  SUB_OBS: 'sub-obs',
  NEIGHBORHOODS: 'neighborhoods',
  RASTER: 'raster',
};

export const FileType = {
  CELLS_JSON: 'cells.json',
  CELL_SETS_JSON: 'cell-sets.json',
  EXPRESSION_MATRIX_ZARR: 'expression-matrix.zarr',
  GENOMIC_PROFILES_ZARR: 'genomic-profiles.zarr',
  MOLECULES_JSON: 'molecules.json',
  NEIGHBORHOODS_JSON: 'neighborhoods.json',
  RASTER_JSON: 'raster.json',
  RASTER_OME_ZARR: 'raster.ome-zarr',
  CLUSTERS_JSON: 'clusters.json',
  GENES_JSON: 'genes.json',
  ANNDATA_CELL_SETS_ZARR: 'anndata-cell-sets.zarr', // deprecate
  ANNDATA_OBS_SETS_ZARR: 'anndata-obs-sets.zarr',
  ANNDATA_CELLS_ZARR: 'anndata-cells.zarr', // deprecate
  ANNDATA_OBS_ZARR: 'anndata-obs.zarr',
  ANNDATA_EXPRESSION_MATRIX_ZARR: 'anndata-expression-matrix.zarr', // deprecate
  ANNDATA_OBS_FEATURE_MATRIX_ZARR: 'anndata-obs-feature-matrix.zarr',
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
