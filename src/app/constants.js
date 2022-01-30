export const Component = {
  DESCRIPTION: 'description',
  STATUS: 'status',
  GENES: 'genes',
  CELL_SETS: 'cellSets',
  SCATTERPLOT: 'scatterplot',
  SPATIAL: 'spatial',
  HEATMAP: 'heatmap',
  LAYER_CONTROLLER: 'layerController',
  CELL_SET_SIZES: 'cellSetSizes',
  GENOMIC_PROFILES: 'genomicProfiles',
  CELL_SET_EXPRESSION: 'cellSetExpression',
  EXPRESSION_HISTOGRAM: 'expressionHistogram',
};

export const DataType = {
  CELLS: 'cells',
  CELL_SETS: 'cell-sets',
  EXPRESSION_MATRIX: 'expression-matrix',
  GENOMIC_PROFILES: 'genomic-profiles',
  MOLECULES: 'molecules',
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
  ANNDATA_CELL_SETS_ZARR: 'anndata-cell-sets.zarr',
  ANNDATA_CELLS_ZARR: 'anndata-cells.zarr',
  ANNDATA_EXPRESSION_MATRIX_ZARR: 'anndata-expression-matrix.zarr',
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
  EMBEDDING_CELL_SET_POLYGONS_VISIBLE: 'embeddingCellSetPolygonsVisible', // deprecate
  EMBEDDING_CELL_SET_LABELS_VISIBLE: 'embeddingCellSetLabelsVisible', // deprecate
  EMBEDDING_CELL_SET_LABEL_SIZE: 'embeddingCellSetLabelSize', // deprecate
  EMBEDDING_CELL_RADIUS: 'embeddingCellRadius', // deprecate
  EMBEDDING_CELL_RADIUS_MODE: 'embeddingCellRadiusMode', // deprecate
  EMBEDDING_CELL_OPACITY: 'embeddingCellOpacity', // deprecate
  EMBEDDING_CELL_OPACITY_MODE: 'embeddingCellOpacityMode', // deprecate
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
  CELL_FILTER: 'cellFilter', // deprecate
  CELL_HIGHLIGHT: 'cellHighlight', // deprecate
  CELL_SET_SELECTION: 'cellSetSelection', // deprecate
  CELL_SET_HIGHLIGHT: 'cellSetHighlight', // deprecate
  CELL_SET_COLOR: 'cellSetColor', // deprecate
  GENE_FILTER: 'geneFilter', // deprecate
  GENE_HIGHLIGHT: 'geneHighlight', // deprecate
  GENE_SELECTION: 'geneSelection', // deprecate
  GENE_EXPRESSION_COLORMAP: 'geneExpressionColormap', // deprecate
  GENE_EXPRESSION_TRANSFORM: 'geneExpressionTransform', // deprecate
  GENE_EXPRESSION_COLORMAP_RANGE: 'geneExpressionColormapRange', // deprecate
  CELL_COLOR_ENCODING: 'cellColorEncoding', // deprecate
  SPATIAL_RASTER_LAYERS: 'spatialRasterLayers',
  SPATIAL_CELLS_LAYER: 'spatialCellsLayer', // deprecate
  SPATIAL_MOLECULES_LAYER: 'spatialMoleculesLayer', // deprecate
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
  ADDITIONAL_CELL_SETS: 'additionalCellSets', // deprecate
  MOLECULE_HIGHLIGHT: 'moleculeHighlight', // deprecate
};
