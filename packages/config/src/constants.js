const SINGLE_CELL_WITH_HEATMAP_VIEWS = {
  obsSets: { x: 4, y: 0, w: 4, h: 4 },
  obsSetSizes: { x: 8, y: 0, w: 4, h: 4 },
  scatterplot: { x: 0, y: 0, w: 4, h: 4 },
  heatmap: { x: 0, y: 4, w: 8, h: 4 },
  featureList: { x: 8, y: 4, w: 4, h: 4 },
};

const SINGLE_CELL_WITHOUT_HEATMAP_VIEWS = {
  obsSets: { x: 10, y: 6, w: 2, h: 6 },
  obsSetSizes: { x: 8, y: 1, w: 4, h: 6 },
  scatterplot: { x: 0, y: 0, w: 8, h: 12 },
  featureList: { x: 8, y: 6, w: 2, h: 6 },
};

const SPATIAL_TRANSCRIPTOMICS_VIEWS = {
  scatterplot: { x: 0, y: 0, w: 3, h: 4 },
  spatial: { x: 3, y: 0, w: 5, h: 4 },
  obsSets: { x: 8, y: 0, w: 4, h: 2 },
  featureList: { x: 8, y: 0, w: 4, h: 2 },
  heatmap: { x: 0, y: 4, w: 6, h: 4 },
  obsSetFeatureValueDistribution: { x: 6, y: 4, w: 6, h: 4 },
};

const SPATIAL_TRANSCRIPTOMICS_WITH_HSITOLOGY_VIEWS = {
  spatial: { x: 0, y: 0, w: 6, h: 6 },
  heatmap: { x: 0, y: 6, w: 8, h: 6 },
  layerController: { x: 8, y: 6, w: 4, h: 6 },
  obsSets: { x: 9, y: 0, w: 3, h: 6 },
  featureList: { x: 6, y: 0, w: 3, h: 6 },
};

const IMAGE_VIEWS = {
  spatial: { x: 0, y: 0, w: 8, h: 12 },
  layerController: { x: 8, y: 0, w: 4, h: 7 },
  description: { x: 8, y: 9, w: 4, h: 5 },
};

export const NO_HINTS_CONFIG = {
  views: {},
  coordinationValues: {},
};

export const HINTS_CONFIG = {
  'No hints are available. Generate config with no hints.': NO_HINTS_CONFIG,
  Basic: NO_HINTS_CONFIG,
  'Transcriptomics / scRNA-seq (with heatmap)': {
    views: SINGLE_CELL_WITH_HEATMAP_VIEWS,
  },
  'Transcriptomics / scRNA-seq (without heatmap)': {
    views: SINGLE_CELL_WITHOUT_HEATMAP_VIEWS,
  },
  'Spatial transcriptomics (with polygon cell segmentations)': {
    views: SPATIAL_TRANSCRIPTOMICS_VIEWS,
  },
  'Chromatin accessibility / scATAC-seq (with heatmap)': {
    views: SINGLE_CELL_WITH_HEATMAP_VIEWS,
    coordinationValues: {
      featureType: 'peak',
    },
  },
  'Chromatin accessibility / scATAC-seq (without heatmap)': {
    views: SINGLE_CELL_WITHOUT_HEATMAP_VIEWS,
    coordinationValues: {
      featureType: 'peak',
    },
  },
  'Spatial transcriptomics (with histology image and polygon cell segmentations)': {
    views: SPATIAL_TRANSCRIPTOMICS_WITH_HSITOLOGY_VIEWS,
    coordinationSpaceRequired: true,
  },
  Image: {
    views: IMAGE_VIEWS,
  },
};

export const HINT_TYPE_TO_FILE_TYPE_MAP = {
  'AnnData-Zarr': [
    'Basic',
    'Transcriptomics / scRNA-seq (with heatmap)',
    'Transcriptomics / scRNA-seq (without heatmap)',
    'Spatial transcriptomics (with polygon cell segmentations)',
    'Chromatin accessibility / scATAC-seq (with heatmap)',
    'Chromatin accessibility / scATAC-seq (without heatmap)',
  ],
  'OME-TIFF': [
    'Basic',
    'Image',
  ],
  'AnnData-Zarr,OME-TIFF': [
    'Basic',
    'Spatial transcriptomics (with histology image and polygon cell segmentations)',
  ],
};
