export const marshall2022iScience = {
  version: '1.0.15',
  name: 'Marshall et al., 2022 iScience',
  description: 'Spatial transcriptomics (Slide-seqV2) in the healthy human kidney (Puck_200903_13)',
  datasets: [{
    uid: 'marshall_2022',
    name: 'marshall_2022',
    files: [{
      fileType: 'anndata.zarr',
      url: 'https://data-1.vitessce.io/0.0.33/main/marshall-2022/marshall_2022_iscience.h5ad.zarr',
      coordinationValues: {
        obsType: 'bead',
        featureType: 'gene',
        featureValueType: 'expression',
        embeddingType: 'UMAP',
      },
      options: {
        obsFeatureMatrix: {
          path: 'obsm/X_hvg',
          featureFilterPath: 'var/highly_variable',
        },
        obsEmbedding: {
          path: 'obsm/X_umap',
        },
        obsLocations: {
          path: 'obsm/X_spatial',
        },
        obsSegmentations: {
          path: 'obsm/X_segmentations',
        },
        obsSets: [
          {
            name: 'Bead Type',
            path: 'obs/cell_type',
          },
        ],
        featureLabels: {
          path: 'var/feature_name',
        },
      },
    }],
  }],
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingType: {
      UMAP: 'UMAP',
    },
    obsType: {
      A: 'bead',
    },
    featureType: {
      A: 'gene',
    },
    featureValueType: {
      A: 'expression',
    },
    featureValueColormapRange: {
      A: [0.0, 0.1],
    },
    spatialSegmentationLayer: {
      A: {
        opacity: 1, radius: 50, visible: true, stroked: false,
      },
    },
  },
  layout: [{
    component: 'obsSets',
    h: 4,
    w: 4,
    x: 4,
    y: 0,
    coordinationScopes: {
      obsType: 'A',
    },
    uid: 'A',
  },
  {
    component: 'obsSetSizes',
    h: 4,
    w: 4,
    x: 8,
    y: 0,
    coordinationScopes: {
      obsType: 'A',
    },
    uid: 'B',
  },
  {
    component: 'scatterplot',
    h: 4,
    w: 4,
    x: 0,
    y: 0,
    coordinationScopes: {
      embeddingType: 'UMAP',
      obsType: 'A',
      featureType: 'A',
      featureValueType: 'A',
      featureValueColormapRange: 'A',
    },
    uid: 'C',
  },
  {
    component: 'spatial',
    h: 4,
    w: 4,
    x: 0,
    y: 4,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'A',
      featureValueType: 'A',
      spatialSegmentationLayer: 'A',
      featureValueColormapRange: 'A',
    },
    uid: 'E',
  },
  {
    component: 'layerController',
    h: 4,
    w: 4,
    x: 4,
    y: 4,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'A',
      featureValueType: 'A',
      spatialSegmentationLayer: 'A',
    },
    uid: 'F',
  },
  {
    component: 'featureList',
    h: 4,
    w: 2,
    x: 8,
    y: 4,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'A',
    },
    uid: 'G',
  },
  {
    component: 'description',
    h: 4,
    w: 2,
    x: 10,
    y: 4,
    uid: 'H',
  },
  ],
};
