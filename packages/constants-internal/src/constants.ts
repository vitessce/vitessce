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
  SPATIAL_BETA: 'spatialBeta',
  HEATMAP: 'heatmap',
  LAYER_CONTROLLER: 'layerController',
  LAYER_CONTROLLER_BETA: 'layerControllerBeta',
  GENOMIC_PROFILES: 'genomicProfiles',
  GATING: 'gating',
  FEATURE_LIST: 'featureList',
  OBS_SETS: 'obsSets',
  OBS_SET_SIZES: 'obsSetSizes',
  OBS_SET_FEATURE_VALUE_DISTRIBUTION: 'obsSetFeatureValueDistribution',
  FEATURE_VALUE_HISTOGRAM: 'featureValueHistogram',
  DOT_PLOT: 'dotPlot',
  FEATURE_BAR_PLOT: 'featureBarPlot',
  VOLCANO_PLOT: 'volcanoPlot',
  OBS_SET_COMPOSITION_BAR_PLOT: 'obsSetCompositionBarPlot',
  FEATURE_SET_ENRICHMENT_BAR_PLOT: 'featureSetEnrichmentBarPlot',
  BIOMARKER_SELECT: 'biomarkerSelect',
  COMPARATIVE_HEADING: 'comparativeHeading',
  LINK_CONTROLLER: 'linkController',
  NEUROGLANCER: 'neuroglancer',
  DUAL_SCATTERPLOT: 'dualScatterplot',
  TREEMAP: 'treemap',
  SAMPLE_SET_PAIR_MANAGER: 'sampleSetPairManager',
  FEATURE_STATS_TABLE: 'featureStatsTable',
};

export const DataType = {
  OBS_LABELS: 'obsLabels',
  OBS_EMBEDDING: 'obsEmbedding',
  OBS_FEATURE_MATRIX: 'obsFeatureMatrix',
  OBS_SETS: 'obsSets',
  FEATURE_LABELS: 'featureLabels',
  IMAGE: 'image',
  OBS_SEGMENTATIONS: 'obsSegmentations',
  NEIGHBORHOODS: 'neighborhoods',
  GENOMIC_PROFILES: 'genomic-profiles',
  OBS_SPOTS: 'obsSpots',
  OBS_POINTS: 'obsPoints',
  OBS_LOCATIONS: 'obsLocations',
  SAMPLE_SETS: 'sampleSets',
  SAMPLE_EDGES: 'sampleEdges',
  COMPARISON_METADATA: 'comparisonMetadata',
  FEATURE_STATS: 'featureStats',
  FEATURE_SET_STATS: 'featureSetStats',
  OBS_SET_STATS: 'obsSetStats',
};

export const AsyncFunctionType = {
  // String input (rather than Node input)
  AUTOCOMPLETE_FEATURE: 'autocompleteFeature', // (partial: string, targetModality: null | 'gene' | 'protein' | 'genomic-region' | 'cell-type') -> list of feature nodes
  GET_ALTERNATIVE_TERMS: 'getAlternativeTerms', // (curieString) -> list of alternative curie strings
  GET_TERM_MAPPING: 'getTermMapping', // (keyCuriePrefix, valueCuriePrefix) -> Record<curieString, curieString> for key to value

  TRANSFORM_FEATURE: 'transformFeature', // (featureNode, targetModality) -> list of feature nodes from target modality
  RELATED_FEATURES: 'relatedFeatures', // (featureNode) -> list of related feature nodes
  FEATURE_TO_URL: 'featureToUrl', // (featureNode) -> URL
  FEATURE_TO_INTERVAL: 'featureToInterval', // (featureNode) -> genomic interval { chr, start, end }

  // Cell2Sentence/LLM-based?
  OBS_SET_TO_FEATURES: 'obsSetToFeatures', // (cell type node) -> list of feature nodes
  FEATURES_TO_OBS_SET: 'featuresToObsSet', // (list of feature nodes) -> cell type node
};

export const FileType = {
  // Joint file types
  ANNDATA_ZARR: 'anndata.zarr',
  ANNDATA_ZARR_ZIP: 'anndata.zarr.zip',
  ANNDATA_H5AD: 'anndata.h5ad',
  SPATIALDATA_ZARR: 'spatialdata.zarr',
  // Atomic file types
  OBS_EMBEDDING_CSV: 'obsEmbedding.csv',
  OBS_SPOTS_CSV: 'obsSpots.csv',
  OBS_POINTS_CSV: 'obsPoints.csv',
  OBS_LOCATIONS_CSV: 'obsLocations.csv',
  OBS_LABELS_CSV: 'obsLabels.csv',
  FEATURE_LABELS_CSV: 'featureLabels.csv',
  OBS_FEATURE_MATRIX_CSV: 'obsFeatureMatrix.csv',
  OBS_SEGMENTATIONS_JSON: 'obsSegmentations.json',
  OBS_SETS_CSV: 'obsSets.csv',
  OBS_SETS_JSON: 'obsSets.json',
  SAMPLE_SETS_CSV: 'sampleSets.csv',
  // OME-Zarr
  IMAGE_OME_ZARR: 'image.ome-zarr',
  OBS_SEGMENTATIONS_OME_ZARR: 'obsSegmentations.ome-zarr',
  // OME-Zarr - Zipped
  IMAGE_OME_ZARR_ZIP: 'image.ome-zarr.zip',
  OBS_SEGMENTATIONS_OME_ZARR_ZIP: 'obsSegmentations.ome-zarr.zip',
  // AnnData
  OBS_FEATURE_MATRIX_ANNDATA_ZARR: 'obsFeatureMatrix.anndata.zarr',
  OBS_FEATURE_COLUMNS_ANNDATA_ZARR: 'obsFeatureColumns.anndata.zarr',
  OBS_SETS_ANNDATA_ZARR: 'obsSets.anndata.zarr',
  OBS_EMBEDDING_ANNDATA_ZARR: 'obsEmbedding.anndata.zarr',
  OBS_SPOTS_ANNDATA_ZARR: 'obsSpots.anndata.zarr',
  OBS_POINTS_ANNDATA_ZARR: 'obsPoints.anndata.zarr',
  OBS_LOCATIONS_ANNDATA_ZARR: 'obsLocations.anndata.zarr',
  OBS_SEGMENTATIONS_ANNDATA_ZARR: 'obsSegmentations.anndata.zarr',
  OBS_LABELS_ANNDATA_ZARR: 'obsLabels.anndata.zarr',
  FEATURE_LABELS_ANNDATA_ZARR: 'featureLabels.anndata.zarr',
  SAMPLE_EDGES_ANNDATA_ZARR: 'sampleEdges.anndata.zarr',
  SAMPLE_SETS_ANNDATA_ZARR: 'sampleSets.anndata.zarr',

  COMPARISON_METADATA_ANNDATA_ZARR: 'comparisonMetadata.anndata.zarr',
  COMPARATIVE_FEATURE_STATS_ANNDATA_ZARR: 'comparativeFeatureStats.anndata.zarr',
  COMPARATIVE_FEATURE_SET_STATS_ANNDATA_ZARR: 'comparativeFeatureSetStats.anndata.zarr',
  COMPARATIVE_OBS_SET_STATS_ANNDATA_ZARR: 'comparativeObsSetStats.anndata.zarr',

  // AnnData - zipped
  OBS_FEATURE_MATRIX_ANNDATA_ZARR_ZIP: 'obsFeatureMatrix.anndata.zarr.zip',
  OBS_FEATURE_COLUMNS_ANNDATA_ZARR_ZIP: 'obsFeatureColumns.anndata.zarr.zip',
  OBS_SETS_ANNDATA_ZARR_ZIP: 'obsSets.anndata.zarr.zip',
  OBS_EMBEDDING_ANNDATA_ZARR_ZIP: 'obsEmbedding.anndata.zarr.zip',
  OBS_SPOTS_ANNDATA_ZARR_ZIP: 'obsSpots.anndata.zarr.zip',
  OBS_POINTS_ANNDATA_ZARR_ZIP: 'obsPoints.anndata.zarr.zip',
  OBS_LOCATIONS_ANNDATA_ZARR_ZIP: 'obsLocations.anndata.zarr.zip',
  OBS_SEGMENTATIONS_ANNDATA_ZARR_ZIP: 'obsSegmentations.anndata.zarr.zip',
  OBS_LABELS_ANNDATA_ZARR_ZIP: 'obsLabels.anndata.zarr.zip',
  FEATURE_LABELS_ANNDATA_ZARR_ZIP: 'featureLabels.anndata.zarr.zip',
  SAMPLE_EDGES_ANNDATA_ZARR_ZIP: 'sampleEdges.anndata.zarr.zip',
  SAMPLE_SETS_ANNDATA_ZARR_ZIP: 'sampleSets.anndata.zarr.zip',

  COMPARISON_METADATA_ANNDATA_ZARR_ZIP: 'comparisonMetadata.anndata.zarr.zip',
  COMPARATIVE_FEATURE_STATS_ANNDATA_ZARR_ZIP: 'comparativeFeatureStats.anndata.zarr.zip',
  COMPARATIVE_FEATURE_SET_STATS_ANNDATA_ZARR_ZIP: 'comparativeFeatureSetStats.anndata.zarr.zip',
  COMPARATIVE_OBS_SET_STATS_ANNDATA_ZARR_ZIP: 'comparativeObsSetStats.anndata.zarr.zip',

  // AnnData - h5ad via reference spec
  OBS_FEATURE_MATRIX_ANNDATA_H5AD: 'obsFeatureMatrix.anndata.h5ad',
  OBS_FEATURE_COLUMNS_ANNDATA_H5AD: 'obsFeatureColumns.anndata.h5ad',
  OBS_SETS_ANNDATA_H5AD: 'obsSets.anndata.h5ad',
  OBS_EMBEDDING_ANNDATA_H5AD: 'obsEmbedding.anndata.h5ad',
  OBS_SPOTS_ANNDATA_H5AD: 'obsSpots.anndata.h5ad',
  OBS_POINTS_ANNDATA_H5AD: 'obsPoints.anndata.h5ad',
  OBS_LOCATIONS_ANNDATA_H5AD: 'obsLocations.anndata.h5ad',
  OBS_SEGMENTATIONS_ANNDATA_H5AD: 'obsSegmentations.anndata.h5ad',
  OBS_LABELS_ANNDATA_H5AD: 'obsLabels.anndata.h5ad',
  FEATURE_LABELS_ANNDATA_H5AD: 'featureLabels.anndata.h5ad',
  SAMPLE_EDGES_ANNDATA_H5AD: 'sampleEdges.anndata.h5ad',
  SAMPLE_SETS_ANNDATA_H5AD: 'sampleSets.anndata.h5ad',

  COMPARISON_METADATA_ANNDATA_H5AD: 'comparisonMetadata.anndata.h5ad',
  COMPARATIVE_FEATURE_STATS_ANNDATA_H5AD: 'comparativeFeatureStats.anndata.h5ad',
  COMPARATIVE_FEATURE_SET_STATS_ANNDATA_H5AD: 'comparativeFeatureSetStats.anndata.h5ad',
  COMPARATIVE_OBS_SET_STATS_ANNDATA_H5AD: 'comparativeObsSetStats.anndata.h5ad',
  // SpatialData
  IMAGE_SPATIALDATA_ZARR: 'image.spatialdata.zarr',
  LABELS_SPATIALDATA_ZARR: 'labels.spatialdata.zarr',
  SHAPES_SPATIALDATA_ZARR: 'shapes.spatialdata.zarr',
  OBS_FEATURE_MATRIX_SPATIALDATA_ZARR: 'obsFeatureMatrix.spatialdata.zarr',
  OBS_SETS_SPATIALDATA_ZARR: 'obsSets.spatialdata.zarr',
  OBS_SPOTS_SPATIALDATA_ZARR: 'obsSpots.spatialdata.zarr',
  FEATURE_LABELS_SPATIALDATA_ZARR: 'featureLabels.spatialdata.zarr',
  // TODO:
  // OBS_POINTS_SPATIALDATA_ZARR: 'obsPoints.spatialdata.zarr',
  // OBS_LOCATIONS_SPATIALDATA_ZARR: 'obsLocations.spatialdata.zarr',
  // MuData
  OBS_FEATURE_MATRIX_MUDATA_ZARR: 'obsFeatureMatrix.mudata.zarr',
  OBS_SETS_MUDATA_ZARR: 'obsSets.mudata.zarr',
  OBS_EMBEDDING_MUDATA_ZARR: 'obsEmbedding.mudata.zarr',
  OBS_SPOTS_MUDATA_ZARR: 'obsSpots.mudata.zarr',
  OBS_POINTS_MUDATA_ZARR: 'obsPoints.mudata.zarr',
  OBS_LOCATIONS_MUDATA_ZARR: 'obsLocations.mudata.zarr',
  OBS_SEGMENTATIONS_MUDATA_ZARR: 'obsSegmentations.mudata.zarr',
  OBS_LABELS_MUDATA_ZARR: 'obsLabels.mudata.zarr',
  FEATURE_LABELS_MUDATA_ZARR: 'featureLabels.mudata.zarr',
  GENOMIC_PROFILES_ZARR: 'genomic-profiles.zarr',
  NEIGHBORHOODS_JSON: 'neighborhoods.json',
  // OME-TIFF
  IMAGE_OME_TIFF: 'image.ome-tiff',
  OBS_SEGMENTATIONS_OME_TIFF: 'obsSegmentations.ome-tiff',
  // GLB
  OBS_SEGMENTATIONS_GLB: 'obsSegmentations.glb',
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
  FEATURE_LABELS_TYPE: 'featureLabelsType',
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
  SPATIAL_TARGET_T: 'spatialTargetT',
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
  OBS_HIGHLIGHT: 'obsHighlight',
  OBS_SELECTION: 'obsSelection',
  OBS_SET_SELECTION: 'obsSetSelection',
  OBS_SELECTION_MODE: 'obsSelectionMode',
  OBS_FILTER: 'obsFilter',
  OBS_SET_FILTER: 'obsSetFilter',
  OBS_FILTER_MODE: 'obsFilterMode',
  OBS_SET_HIGHLIGHT: 'obsSetHighlight',
  OBS_SET_EXPANSION: 'obsSetExpansion',
  OBS_SET_COLOR: 'obsSetColor',
  FEATURE_HIGHLIGHT: 'featureHighlight',
  FEATURE_SELECTION: 'featureSelection',
  FEATURE_SET_SELECTION: 'featureSetSelection',
  FEATURE_SELECTION_MODE: 'featureSelectionMode',
  FEATURE_FILTER: 'featureFilter',
  FEATURE_SET_FILTER: 'featureSetFilter',
  FEATURE_FILTER_MODE: 'featureFilterMode',
  FEATURE_VALUE_COLORMAP: 'featureValueColormap',
  FEATURE_VALUE_TRANSFORM: 'featureValueTransform',
  FEATURE_VALUE_COLORMAP_RANGE: 'featureValueColormapRange',
  FEATURE_AGGREGATION_STRATEGY: 'featureAggregationStrategy',
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
  FEATURE_VALUE_POSITIVITY_THRESHOLD: 'featureValuePositivityThreshold',
  TOOLTIPS_VISIBLE: 'tooltipsVisible',
  FILE_UID: 'fileUid',
  IMAGE_LAYER: 'imageLayer',
  IMAGE_CHANNEL: 'imageChannel',
  SEGMENTATION_LAYER: 'segmentationLayer',
  SEGMENTATION_CHANNEL: 'segmentationChannel',
  SPATIAL_TARGET_C: 'spatialTargetC',
  SPATIAL_LAYER_VISIBLE: 'spatialLayerVisible',
  SPATIAL_LAYER_OPACITY: 'spatialLayerOpacity',
  SPATIAL_LAYER_COLORMAP: 'spatialLayerColormap',
  SPATIAL_LAYER_TRANSPARENT_COLOR: 'spatialLayerTransparentColor',
  SPATIAL_LAYER_MODEL_MATRIX: 'spatialLayerModelMatrix',
  SPATIAL_SEGMENTATION_FILLED: 'spatialSegmentationFilled',
  SPATIAL_SEGMENTATION_STROKE_WIDTH: 'spatialSegmentationStrokeWidth',
  SPATIAL_CHANNEL_COLOR: 'spatialChannelColor',
  SPATIAL_CHANNEL_VISIBLE: 'spatialChannelVisible',
  SPATIAL_CHANNEL_OPACITY: 'spatialChannelOpacity',
  SPATIAL_CHANNEL_WINDOW: 'spatialChannelWindow',
  PHOTOMETRIC_INTERPRETATION: 'photometricInterpretation',
  // For 3D volume rendering
  SPATIAL_RENDERING_MODE: 'spatialRenderingMode', // For whole spatial view
  VOLUMETRIC_RENDERING_ALGORITHM: 'volumetricRenderingAlgorithm', // Could be per-image-layer
  SPATIAL_TARGET_RESOLUTION: 'spatialTargetResolution', // Per-spatial-layer
  // For clipping plane sliders
  SPATIAL_SLICE_X: 'spatialSliceX',
  SPATIAL_SLICE_Y: 'spatialSliceY',
  SPATIAL_SLICE_Z: 'spatialSliceZ',
  // For spatial spot and point layers
  SPOT_LAYER: 'spotLayer',
  POINT_LAYER: 'pointLayer',
  SPATIAL_SPOT_RADIUS: 'spatialSpotRadius', // In micrometers?
  SPATIAL_SPOT_FILLED: 'spatialSpotFilled',
  SPATIAL_SPOT_STROKE_WIDTH: 'spatialSpotStrokeWidth',
  SPATIAL_LAYER_COLOR: 'spatialLayerColor',
  PIXEL_HIGHLIGHT: 'pixelHighlight', // Per-image-layer
  TOOLTIP_CROSSHAIRS_VISIBLE: 'tooltipCrosshairsVisible',
  LEGEND_VISIBLE: 'legendVisible',
  SPATIAL_CHANNEL_LABELS_VISIBLE: 'spatialChannelLabelsVisible',
  SPATIAL_CHANNEL_LABELS_ORIENTATION: 'spatialChannelLabelsOrientation',
  SPATIAL_CHANNEL_LABEL_SIZE: 'spatialChannelLabelSize',
  // Multi-sample / comparative
  SAMPLE_TYPE: 'sampleType',
  SAMPLE_SELECTION: 'sampleSelection',
  SAMPLE_SET_SELECTION: 'sampleSetSelection',
  SAMPLE_SELECTION_MODE: 'sampleSelectionMode',
  SAMPLE_FILTER: 'sampleFilter',
  SAMPLE_SET_FILTER: 'sampleSetFilter',
  SAMPLE_FILTER_MODE: 'sampleFilterMode',
  SAMPLE_SET_COLOR: 'sampleSetColor',
  SAMPLE_HIGHLIGHT: 'sampleHighlight',
  EMBEDDING_POINTS_VISIBLE: 'embeddingPointsVisible',
  EMBEDDING_CONTOURS_VISIBLE: 'embeddingContoursVisible',
  EMBEDDING_CONTOURS_FILLED: 'embeddingContoursFilled',
  EMBEDDING_CONTOUR_PERCENTILES: 'embeddingContourPercentiles',
  CONTOUR_COLOR_ENCODING: 'contourColorEncoding',
  CONTOUR_COLOR: 'contourColor',
  // For volcano plot:
  FEATURE_POINT_SIGNIFICANCE_THRESHOLD: 'featurePointSignificanceThreshold',
  FEATURE_LABEL_SIGNIFICANCE_THRESHOLD: 'featureLabelSignificanceThreshold',
  FEATURE_POINT_FOLD_CHANGE_THRESHOLD: 'featurePointFoldChangeThreshold',
  FEATURE_LABEL_FOLD_CHANGE_THRESHOLD: 'featureLabelFoldChangeThreshold',
  // Treemap
  HIERARCHY_LEVELS: 'hierarchyLevels',
};

export const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const DescriptionType = {
  PLAIN: 'plain',
  MARKDOWN: 'markdown',
};

/**
 * Constants representing the help text for
 * each view.
 */
export const ViewHelpMapping = {
  SCATTERPLOT: 'The scatterplot displays two-dimensional (pre-computed) dimensionality reduction results (such as from t-SNE or UMAP). Each point on the scatterplot represents an observation (e.g., cell).',
  HEATMAP: 'The heatmap displays an observation-by-feature (e.g., cell-by-gene) matrix, typically with transformed (e.g., normalized or standardized) values.',
  SPATIAL: 'The spatial view displays (potentially layered) spatially-resolved data including RGB or multiplexed images, segmentations of observations (bitmask- or polygon-based), and/or points (e.g., representing FISH transcripts).',
  DESCRIPTION: 'The description view displays additional information about a dataset. When images are included in a dataset, the description view also includes image metadata (if contained in the image files).',
  STATUS: 'The status view displays debugging messages, including app-wide error messages when datasets fail to load or when schemas fail to validate. Details about the entity under the mouse cursor (cell, gene, and/or molecule) are displayed during hover interactions.',
  LAYER_CONTROLLER: 'The spatial layer controller provides an interface for manipulating the visualization layers displayed in the spatial view.',
  GENOMIC_PROFILES: 'The genomic profiles view displays genome browser tracks (using the genomic-profiles data type) containing bar plots, where the genome is along the x-axis and the value at each genome position is encoded with a bar along the y-axis.',
  GATING: 'The gating scatterplot displays expression data for two genes (along the X and Y axes). Users can select two genes, and the scatterplot is dynamically generated using observation-by-feature matrix data. Gating can then be performed by using the lasso or box select tools.',
  FEATURE_LIST: 'The feature list controller displays an interactive list of features (e.g., genes).',
  OBS_SETS: 'The observation sets controller displays an interactive list of (potentially hierarchical) observation sets (e.g., cell clusters or cell type annotations).',
  OBS_SET_SIZES: 'The observation set sizes view displays a bar plot with the currently-selected observation sets (e.g., cell types) on the x-axis and bars representing their size (e.g., number of cells) on the y-axis.',
  OBS_SET_FEATURE_VALUE_DISTRIBUTION: 'The observation set feature value distribution view displays a violin plot with values (e.g., expression values) per set (e.g., cell type) for the selected feature (e.g., gene).',
  FEATURE_VALUE_HISTOGRAM: 'The feature value histogram displays the distribution of values (e.g., expression) for the selected feature (e.g., gene).',
  DOT_PLOT: 'The dot plot displays summary information about expression of the selected features (e.g., genes) for each selected observation set (e.g., cell type).',
  FEATURE_BAR_PLOT: 'The feature bar plot displays one bar per observation (e.g., cell) along the x-axis, where the value of a selected feature (e.g., gene) is encoded along the y-axis.',
  NEUROGLANCER: 'The Neuroglancer view displays 3d meshes using Neuroglancer developed by Google.',
  TREEMAP: 'The treemap provides an overview of the current state of sample-level or cell-level selection and filtering.',
  VOLCANO_PLOT: 'The volcano plot displays differential expression results. Each data point represents a feature (as opposed to an observation).',
  OBS_SET_COMPOSITION_BAR_PLOT: 'The set composition bar plot displays the results of a compositional analysis conducted using the scCODA method (Büttner et al. 2021 Nature Communications).',
  FEATURE_SET_ENRICHMENT_BAR_PLOT: 'The feature set enrichment bar plot displays the results of a hypergeometric test applied to the differential expression test results to identify enriched pathway gene sets.',
  SAMPLE_SET_PAIR_MANAGER: 'Select pairs of sample groups.',
  FEATURE_STATS_TABLE: 'This table displays per-feature statistics, for example, from a differential expression test.',
};
