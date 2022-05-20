// TODO: use proxy to log deprecation messages
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
  // FOM components
  FEATURE_LIST: 'featureList',
  OBS_SETS: 'obsSets',
  OBS_SET_SIZES: 'obsSetSizes',
  OBS_SET_VALUE_DISTRIBUTION: 'obsSetValueDistribution',
  FEATURE_VALUE_HISTOGRAM: 'featureValueHistogram',
};

export const DataType = {
  CELLS: 'cells',
  CELL_SETS: 'cell-sets',
  EXPRESSION_MATRIX: 'expression-matrix',
  GENOMIC_PROFILES: 'genomic-profiles',
  MOLECULES: 'molecules',
  NEIGHBORHOODS: 'neighborhoods',
  RASTER: 'raster',
  // FOM data types
  OBS: 'obs',
  OBS_SETS: 'obsSets',
  FEATURES: 'features',
  OBS_FEATURE_MATRIX: 'obsFeatureMatrix',
};

export const EntityTypes = {
  OBS_TYPE: 'obsType',
  FEATURE_TYPE: 'featureType',
  FEATURE_VALUE_TYPE: 'featureValueType',
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
  // FOM file types
  ANNDATA_OBS_ZARR: 'anndataObs.zarr',
  ANNDATA_OBS_SETS_ZARR: 'anndataObsSets.zarr',
  ANNDATA_OBS_FEATURE_MATRIX_ZARR: 'anndataObsFeatureMatrix.zarr',
  ANNDATA_FEATURES_ZARR: 'anndataFeatures.zarr',
};

/**
 * Constants representing names of coordination types,
 * to help prevent typos.
 */
export const CoordinationType = {
  DATASET: 'dataset',
  EMBEDDING_TYPE: 'embeddingType',
  EMBEDDING_ZOOM: 'embeddingZoom',
  EMBEDDING_ROTATION: 'embeddingRotation',
  EMBEDDING_TARGET_X: 'embeddingTargetX',
  EMBEDDING_TARGET_Y: 'embeddingTargetY',
  EMBEDDING_TARGET_Z: 'embeddingTargetZ',
  EMBEDDING_CELL_SET_POLYGONS_VISIBLE: 'embeddingCellSetPolygonsVisible',
  EMBEDDING_CELL_SET_LABELS_VISIBLE: 'embeddingCellSetLabelsVisible',
  EMBEDDING_CELL_SET_LABEL_SIZE: 'embeddingCellSetLabelSize',
  EMBEDDING_CELL_RADIUS: 'embeddingCellRadius',
  EMBEDDING_CELL_RADIUS_MODE: 'embeddingCellRadiusMode',
  EMBEDDING_CELL_OPACITY: 'embeddingCellOpacity',
  EMBEDDING_CELL_OPACITY_MODE: 'embeddingCellOpacityMode',
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
  CELL_FILTER: 'cellFilter',
  CELL_HIGHLIGHT: 'cellHighlight',
  CELL_SET_SELECTION: 'cellSetSelection',
  CELL_SET_HIGHLIGHT: 'cellSetHighlight',
  CELL_SET_COLOR: 'cellSetColor',
  GENE_FILTER: 'geneFilter',
  GENE_HIGHLIGHT: 'geneHighlight',
  GENE_SELECTION: 'geneSelection',
  GENE_EXPRESSION_COLORMAP: 'geneExpressionColormap',
  GENE_EXPRESSION_TRANSFORM: 'geneExpressionTransform',
  GENE_EXPRESSION_COLORMAP_RANGE: 'geneExpressionColormapRange',
  CELL_COLOR_ENCODING: 'cellColorEncoding',
  SPATIAL_RASTER_LAYERS: 'spatialRasterLayers',
  SPATIAL_CELLS_LAYER: 'spatialCellsLayer',
  SPATIAL_MOLECULES_LAYER: 'spatialMoleculesLayer',
  SPATIAL_NEIGHBORHOODS_LAYER: 'spatialNeighborhoodsLayer',
  GENOMIC_ZOOM_X: 'genomicZoomX',
  GENOMIC_ZOOM_Y: 'genomicZoomY',
  GENOMIC_TARGET_X: 'genomicTargetX',
  GENOMIC_TARGET_Y: 'genomicTargetY',
  ADDITIONAL_CELL_SETS: 'additionalCellSets',
  MOLECULE_HIGHLIGHT: 'moleculeHighlight',
  // FOM coordination types
  // Observation type (e.g., cell)
  OBS_TYPE: 'obsType',
  // Feature type (e.g., gene)
  FEATURE_TYPE: 'featureType',
  // Feature value type (e.g., expression)
  FEATURE_VALUE_TYPE: 'featureValueType',
  EMBEDDING_OBS_SET_POLYGONS_VISIBLE: 'embeddingObsSetPolygonsVisible',
  EMBEDDING_OBS_SET_LABELS_VISIBLE: 'embeddingObsSetLabelsVisible',
  EMBEDDING_OBS_SET_LABEL_SIZE: 'embeddingObsSetLabelSize',
  EMBEDDING_OBS_RADIUS: 'embeddingObsRadius',
  EMBEDDING_OBS_RADIUS_MODE: 'embeddingObsRadiusMode',
  EMBEDDING_OBS_OPACITY: 'embeddingObsOpacity',
  EMBEDDING_OBS_OPACITY_MODE: 'embeddingObsOpacityMode',
  OBS_FILTER: 'obsFilter',
  OBS_HIGHLIGHT: 'obsHighlight',
  OBS_SET_SELECTION: 'obsSetSelection',
  OBS_SET_HIGHLIGHT: 'obsSetHighlight',
  OBS_SET_COLOR: 'obsSetColor',
  FEATURE_FILTER: 'featureFilter',
  FEATURE_HIGHLIGHT: 'featureHighlight',
  FEATURE_SELECTION: 'featureSelection',
  FEATURE_VALUE_COLORMAP: 'featureValueColormap',
  FEATURE_VALUE_TRANSFORM: 'featureValueTransform',
  FEATURE_VALUE_COLORMAP_RANGE: 'featureValueColormapRange',
  OBS_COLOR_ENCODING: 'obsColorEncoding',
  SPATIAL_RASTER_LAYER: 'spatialRasterLayer',
  SPATIAL_SEGMENTATION_LAYER: 'spatialSegmentationLayer',
  SPATIAL_POINT_LAYER: 'spatialPointLayer',
  SPATIAL_NEIGHBORHOOD_LAYER: 'spatialNeighborhoodLayer',
  ADDITIONAL_OBS_SETS: 'additionalObsSets',
};

// Keys for anndata cols/arrays.
export const DATA_KEYS = {
  // prev: anndata-cells.zarr/mappings/key and mappings/dims
  // values in files[].options should be { path: '', name: '', dims: [0, 1] }
  EMBEDDING: 'embedding',
  // prev: anndata-cells.zarr/xy
  // values in files[].options should be { path: '' }
  SPATIAL: 'spatial',
  // values in files[].options should be { path: '' }
  // prev: anndata-cells.zarr/poly
  SEGMENTATION_POLYGON: 'segmentationPolygon',
  // values in files[].options should be { path: '' }
  OBS_INDEX: 'obsIndex',
  // values in files[].options should be { path: '' }
  OBS_FILTER: 'obsFilter',
  // values in files[].options should be { path: '' }
  FEATURE_INDEX: 'featureIndex',
  // prev: anndata-expression-matrix.zarr/matrixGeneFilter
  // values in files[].options should be { path: '' }
  // when using the main X matrix, indicates which features to ignore when loading the data.
  // Should be a valid var column.
  FEATURE_FILTER: 'featureFilter',
  // prev: anndata-expression-matrix.zarr/geneFilter
  // values in files[].options should be { path: '' }
  // when using a smaller matrix, indicates which features of
  // the full var are used in the smaller matrix (like obsm/hvg_subset).
  // Should be a valid var column.
  MATRIX_FEATURE_SUBSET: 'matrixFeatureSubset',
  // prev: anndata-expression-matrix.zarr/geneAlias
  // values in files[].options should be { path: '' }
  FEATURE_INDEX_SECONDARY: 'featureIndexSecondary',
  // values in files[].options should be { path: '' }
  // Should be a valid array key with shape
  // (obsIndex.length after filtering by matrixObsSubset if present, featureIndex.length after filtering based on matrixFeatureSubset if present)
  OBS_FEATURE_MATRIX: 'obsFeatureMatrix',
  // values in files[].options should be { path: '', name: '' } or { path: ['', '', ...], name: '' }
  OBS_SET_INDEX: 'obsSetIndex', // prev: anndata-cell-sets.zarr/setName
  // values in files[].options should be { path: '' } or { path: ['', '', ...], name: '' }
  OBS_SET_SCORE: 'obsSetScore', // prev: anndata-cell-sets.zarr/scoreName
};
