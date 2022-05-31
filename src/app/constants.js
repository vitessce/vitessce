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
  // Entity types
  OBS_TYPE: 'obsType',
  FEATURE_TYPE: 'featureType',
  FEATURE_VALUE_TYPE: 'featureValueType',
  // Other types
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
  SPATIAL_IMAGE_LAYER: 'spatialImageLayer',
  SPATIAL_SEGMENTATION_LAYER: 'spatialSegmentationLayer',
  SPATIAL_POINT_LAYER: 'spatialPointLayer',
  SPATIAL_NEIGHBORHOOD_LAYER: 'spatialNeighborhoodLayer',
  GENOMIC_ZOOM_X: 'genomicZoomX',
  GENOMIC_ZOOM_Y: 'genomicZoomY',
  GENOMIC_TARGET_X: 'genomicTargetX',
  GENOMIC_TARGET_Y: 'genomicTargetY',
  ADDITIONAL_OBS_SETS: 'additionalObsSets',
  // TODO: use obsHighlight rather than moleculeHighlight.
  MOLECULE_HIGHLIGHT: 'moleculeHighlight',
};
