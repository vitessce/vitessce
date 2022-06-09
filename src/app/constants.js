/**
 * This file defines the current constant values.
 * To deprecate a value, add it to ./constants-old.js
 * with a corresponding log message.
 */
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
  OBS_INDEX: 'obsIndex',
  OBS_EMBEDDING: 'obsEmbedding',
  OBS_LOCATIONS: 'obsLocations',
  OBS_FEATURE_MATRIX: 'obsFeatureMatrix',
  FEATURE_INDEX: 'featureIndex',
  OBS_SETS: 'obsSets',
  IMAGE: 'image',
  OBS_SEGMENTATIONS: 'obsSegmentations',
  NEIGHBORHOODS: 'neighborhoods',
  OBS_SET_GENOMIC_PROFILES: 'obsSetGenomicProfiles',
  // Old data types
  CELLS: 'cells',
  CELL_SETS: 'cell-sets',
  EXPRESSION_MATRIX: 'expression-matrix',
  GENOMIC_PROFILES: 'genomic-profiles',
  MOLECULES: 'molecules',
  RASTER: 'raster',
};


export const FileType = {
  // New file types
  OBS_SETS_JSON: 'obsSets.json',
  IMAGE_OME_ZARR: 'image.ome-zarr',
  ANNDATA_OBS_INDEX_ZARR: 'anndataObsIndex.zarr',
  ANNDATA_FEATURE_INDEX_ZARR: 'anndataFeatureIndex.zarr',
  ANNDATA_OBS_FEATURE_MATRIX_ZARR: 'anndataObsFeatureMatrix.zarr',
  ANNDATA_OBS_SETS_ZARR: 'anndataObsSets.zarr',
  ANNDATA_OBS_EMBEDDING_ZARR: 'anndataObsEmbedding.zarr',
  ANNDATA_OBS_LOCATIONS_ZARR: 'anndataObsLocations.zarr',
  // New file types to support old file types:
  // For cells.json
  OBS_INDEX_CELLS_JSON: 'obsIndex.cells.json',
  OBS_EMBEDDING_CELLS_JSON: 'obsEmbedding.cells.json',
  OBS_LOCATIONS_CELLS_JSON: 'obsLocations.cells.json',
  OBS_SEGMENTATIONS_CELLS_JSON: 'obsSegmentations.cells.json',
  // For cell-sets.json
  OBS_SETS_CELL_SETS_JSON: 'obsSets.cell-sets.json',
  // For genes.json
  OBS_INDEX_GENES_JSON: 'obsIndex.genes.json',
  FEATURE_INDEX_GENES_JSON: 'featureIndex.genes.json',
  OBS_FEATURE_MATRIX_GENES_JSON: 'obsFeatureMatrix.genes.json',
  // For clusters.json
  OBS_INDEX_CLUSTERS_JSON: 'obsIndex.clusters.json',
  FEATURE_INDEX_CLUSTERS_JSON: 'featureIndex.clusters.json',
  OBS_FEATURE_MATRIX_CLUSTERS_JSON: 'obsFeatureMatrix.clusters.json',
  // For anndata-expression-matrix.zarr
  ANNDATA_OBS_INDEX_EXPRESSION_MATRIX_ZARR: 'anndataObsIndex.anndata-expression-matrix.zarr',
  ANNDATA_FEATURE_INDEX_EXPRESSION_MATRIX_ZARR: 'anndataFeatureIndex.anndata-expression-matrix.zarr',
  ANNDATA_OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR: 'anndataObsFeatureMatrix.anndata-expression-matrix.zarr',
  // For anndata-cell-sets.zarr
  ANNDATA_OBS_SETS_CELL_SETS_ZARR: 'anndataObsSets.anndata-cell-sets.zarr',
  // For anndata-cells.zarr
  ANNDATA_OBS_EMBEDDING_CELLS_ZARR: 'anndataObsEmbedding.anndata-cells.zarr',
  ANNDATA_OBS_LOCATIONS_CELLS_ZARR: 'anndataObsLocations.anndata-cells.zarr',
  // For expression-matrix.zarr
  OBS_INDEX_EXPRESSION_MATRIX_ZARR: 'obsIndex.expression-matrix.zarr',
  FEATURE_INDEX_EXPRESSION_MATRIX_ZARR: 'featureIndex.expression-matrix.zarr',
  OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR: 'obsFeatureMatrix.expression-matrix.zarr',
  // For raster.json
  IMAGE_RASTER_JSON: 'image.raster.json',
  OBS_SEGMENTATIONS_RASTER_JSON: 'obsSegmentations.raster.json',
  // Old file types
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
  SPATIAL_RASTER_LAYER: 'spatialRasterLayer',
  SPATIAL_SEGMENTATION_LAYER: 'spatialSegmentationLayer',
  SPATIAL_POINT_LAYER: 'spatialPointLayer',
  SPATIAL_NEIGHBORHOOD_LAYER: 'spatialNeighborhoodLayer',
  GENOMIC_ZOOM_X: 'genomicZoomX',
  GENOMIC_ZOOM_Y: 'genomicZoomY',
  GENOMIC_TARGET_X: 'genomicTargetX',
  GENOMIC_TARGET_Y: 'genomicTargetY',
  ADDITIONAL_CELL_SETS: 'additionalCellSets',
  MOLECULE_HIGHLIGHT: 'moleculeHighlight',
};
