/**
 * This file defines the current constant values.
 * To deprecate a value, add it to ./constants-old.js
 * with a corresponding log message.
 */
export const ViewType = {
  DESCRIPTION: 'description',
  STATUS: 'status',
  SCATTERPLOT: 'scatterplot',
  SPATIAL: 'spatial',
  HEATMAP: 'heatmap',
  LAYER_CONTROLLER: 'layerController',
  GENOMIC_PROFILES: 'genomicProfiles',
  GATING: 'gating',
  FEATURE_LIST: 'featureList',
  OBS_SETS: 'obsSets',
  OBS_SET_SIZES: 'obsSetSizes',
  OBS_SET_FEATURE_VALUE_DISTRIBUTION: 'obsSetFeatureValueDistribution',
  FEATURE_VALUE_HISTOGRAM: 'featureValueHistogram',
  STRATIFIED_FEATURE_VALUE_DISTRIBUTION: 'stratifiedFeatureValueDistribution',
  OBS_DENSITY: 'obsDensity',
};

export const DataType = {
  OBS_LABELS: 'obsLabels',
  OBS_EMBEDDING: 'obsEmbedding',
  OBS_LOCATIONS: 'obsLocations',
  OBS_FEATURE_MATRIX: 'obsFeatureMatrix',
  OBS_SETS: 'obsSets',
  FEATURE_LABELS: 'featureLabels',
  IMAGE: 'image',
  OBS_SEGMENTATIONS: 'obsSegmentations',
  NEIGHBORHOODS: 'neighborhoods',
  GENOMIC_PROFILES: 'genomic-profiles',
};


export const FileType = {
  // Joint file types
  ANNDATA_ZARR: 'anndata.zarr',
  // Atomic file types
  OBS_EMBEDDING_CSV: 'obsEmbedding.csv',
  OBS_LOCATIONS_CSV: 'obsLocations.csv',
  OBS_LABELS_CSV: 'obsLabels.csv',
  FEATURE_LABELS_CSV: 'featureLabels.csv',
  OBS_FEATURE_MATRIX_CSV: 'obsFeatureMatrix.csv',
  OBS_SEGMENTATIONS_JSON: 'obsSegmentations.json',
  OBS_SETS_CSV: 'obsSets.csv',
  OBS_SETS_JSON: 'obsSets.json',
  IMAGE_OME_ZARR: 'image.ome-zarr',
  // AnnData
  OBS_FEATURE_MATRIX_ANNDATA_ZARR: 'obsFeatureMatrix.anndata.zarr',
  OBS_SETS_ANNDATA_ZARR: 'obsSets.anndata.zarr',
  OBS_EMBEDDING_ANNDATA_ZARR: 'obsEmbedding.anndata.zarr',
  OBS_LOCATIONS_ANNDATA_ZARR: 'obsLocations.anndata.zarr',
  OBS_SEGMENTATIONS_ANNDATA_ZARR: 'obsSegmentations.anndata.zarr',
  OBS_LABELS_ANNDATA_ZARR: 'obsLabels.anndata.zarr',
  FEATURE_LABELS_ANNDATA_ZARR: 'featureLabels.anndata.zarr',
  // MuData
  OBS_FEATURE_MATRIX_MUDATA_ZARR: 'obsFeatureMatrix.mudata.zarr',
  OBS_SETS_MUDATA_ZARR: 'obsSets.mudata.zarr',
  OBS_EMBEDDING_MUDATA_ZARR: 'obsEmbedding.mudata.zarr',
  OBS_LOCATIONS_MUDATA_ZARR: 'obsLocations.mudata.zarr',
  OBS_SEGMENTATIONS_MUDATA_ZARR: 'obsSegmentations.mudata.zarr',
  OBS_LABELS_MUDATA_ZARR: 'obsLabels.mudata.zarr',
  FEATURE_LABELS_MUDATA_ZARR: 'featureLabels.mudata.zarr',
  GENOMIC_PROFILES_ZARR: 'genomic-profiles.zarr',
  NEIGHBORHOODS_JSON: 'neighborhoods.json',
  // OME-TIFF
  IMAGE_OME_TIFF: 'image.ome-tiff',
  OBS_SEGMENTATIONS_OME_TIFF: 'obsSegmentations.ome-tiff',
  // New file types to support old file types:
  // - cells.json
  OBS_EMBEDDING_CELLS_JSON: 'obsEmbedding.cells.json',
  OBS_SEGMENTATIONS_CELLS_JSON: 'obsSegmentations.cells.json',
  OBS_LOCATIONS_CELLS_JSON: 'obsLocations.cells.json',
  OBS_LABELS_CELLS_JSON: 'obsLabels.cells.json',
  // - cell-sets.json
  OBS_SETS_CELL_SETS_JSON: 'obsSets.cell-sets.json',
  // - genes.json
  OBS_FEATURE_MATRIX_GENES_JSON: 'obsFeatureMatrix.genes.json',
  // - clusters.json
  OBS_FEATURE_MATRIX_CLUSTERS_JSON: 'obsFeatureMatrix.clusters.json',
  // - expression-matrix.zarr
  OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR: 'obsFeatureMatrix.expression-matrix.zarr',
  // - raster.json
  IMAGE_RASTER_JSON: 'image.raster.json',
  OBS_SEGMENTATIONS_RASTER_JSON: 'obsSegmentations.raster.json',
  // - molecules.json
  OBS_LOCATIONS_MOLECULES_JSON: 'obsLocations.molecules.json',
  OBS_LABELS_MOLECULES_JSON: 'obsLabels.molecules.json',
  // Legacy joint file types
  CELLS_JSON: 'cells.json',
  CELL_SETS_JSON: 'cell-sets.json',
  ANNDATA_CELL_SETS_ZARR: 'anndata-cell-sets.zarr',
  ANNDATA_CELLS_ZARR: 'anndata-cells.zarr',
  EXPRESSION_MATRIX_ZARR: 'expression-matrix.zarr',
  MOLECULES_JSON: 'molecules.json',
  RASTER_JSON: 'raster.json',
  RASTER_OME_ZARR: 'raster.ome-zarr',
  CLUSTERS_JSON: 'clusters.json',
  GENES_JSON: 'genes.json',
  ANNDATA_EXPRESSION_MATRIX_ZARR: 'anndata-expression-matrix.zarr',
};

/**
 * Constants representing names of coordination types,
 * to help prevent typos.
 */
export const CoordinationType = {
  META_COORDINATION_SCOPES: 'metaCoordinationScopes',
  META_COORDINATION_SCOPES_BY: 'metaCoordinationScopesBy',
  DATASET: 'dataset',
  // Entity types
  OBS_TYPE: 'obsType',
  FEATURE_TYPE: 'featureType',
  FEATURE_VALUE_TYPE: 'featureValueType',
  OBS_LABELS_TYPE: 'obsLabelsType',
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
  GATING_FEATURE_SELECTION_X: 'gatingFeatureSelectionX',
  GATING_FEATURE_SELECTION_Y: 'gatingFeatureSelectionY',
  FEATURE_VALUE_TRANSFORM_COEFFICIENT: 'featureValueTransformCoefficient',
  IMAGE: 'image', // TODO: change to fileUid?
  SPATIAL_TARGET_C: 'spatialTargetC',
  SPATIAL_LAYER_VISIBLE: 'spatialLayerVisible',
  SPATIAL_LAYER_OPACITY: 'spatialLayerOpacity',
  SPATIAL_LAYER_FILLED: 'spatialLayerFilled',
  SPATIAL_LAYER_STROKE_WIDTH: 'spatialLayerStrokeWidth',
  SPATIAL_CHANNEL_COLOR: 'spatialChannelColor', // TODO: have both SPATIAL_LAYER_COLOR (for bitmasks) and SPATIAL_CHANNEL_COLOR (for images)?
  SPATIAL_IMAGE_CHANNEL: 'spatialImageChannel',
  SPATIAL_CHANNEL_VISIBLE: 'spatialChannelVisible',
};

export const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};
