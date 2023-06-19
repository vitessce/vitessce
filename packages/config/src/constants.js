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
  title: "Don't use any hints",
  views: {},
  coordinationValues: {},
};

export const HINTS_CONFIG = {
  E: {
    hintType: ['AnnData-Zarr'],
    hints: {
      6: {
        ...NO_HINTS_CONFIG,
        title: 'Transcriptomics / scRNA-seq (with heatmap)',
        views: SINGLE_CELL_WITH_HEATMAP_VIEWS,
      },
      5: {
        ...NO_HINTS_CONFIG,
        title: 'Transcriptomics / scRNA-seq (without heatmap)',
        views: SINGLE_CELL_WITHOUT_HEATMAP_VIEWS,
      },
      4: {
        ...NO_HINTS_CONFIG,
        title: 'Spatial transcriptomics (with polygon cell segmentations)',
        views: SPATIAL_TRANSCRIPTOMICS_VIEWS,
      },
      3: {
        ...NO_HINTS_CONFIG,
        title: 'Chromatin accessibility / scATAC-seq (with heatmap)',
        views: SINGLE_CELL_WITH_HEATMAP_VIEWS,
        coordinationValues: {
          featureType: 'peak',
        },
      },
      2: {
        ...NO_HINTS_CONFIG,
        title: 'Chromatin accessibility / scATAC-seq (without heatmap)',
        views: SINGLE_CELL_WITHOUT_HEATMAP_VIEWS,
        coordinationValues: {
          featureType: 'peak',
        },
      },
      1: NO_HINTS_CONFIG,
    },
  },
  B: {
    hintType: ['OME-TIFF', 'AnnData-Zarr'],
    hints: {
      2: {
        ...NO_HINTS_CONFIG,
        title: 'Spatial transcriptomics (with histology image and polygon cell segmentations)',
        views: SPATIAL_TRANSCRIPTOMICS_WITH_HSITOLOGY_VIEWS,
      },
      1: NO_HINTS_CONFIG,
    },
  },
  C: {
    hintType: ['OME-TIFF'],
    hints: {
      2: {
        ...NO_HINTS_CONFIG,
        title: 'Image',
        views: IMAGE_VIEWS,
      },
      1: NO_HINTS_CONFIG,
    },
  },
  D: {
    hintType: [],
    hints: {
      1: {
        ...NO_HINTS_CONFIG,
        title: 'No hints are available. Generate config with no hints.',
      },
    },
  },
};
