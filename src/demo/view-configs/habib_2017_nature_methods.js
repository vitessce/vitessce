export const habib2017natureMethods = {
  version: '1.0.15',
  name: 'Habib et al., 2017 Nature Methods',
  description: 'Archived frozen adult human post-mortem brain tissue profiled by snRNA-seq (DroNc-seq)',
  datasets: [{
    uid: '339952f4-a47f-46dc-9228-18ba2ca256f2',
    name: '339952f4-a47f-46dc-9228-18ba2ca256f2',
    files: [{
      fileType: 'anndata.zarr',
      url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/habib_2017_nature_methods/habib_2017_nature_methods.h5ad.zarr',
      coordinationValues: {
        obsType: 'nucleus',
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
        obsSets: [{
          name: 'Nucleus Type',
          path: 'obs/CellType',
        }],
      },
    }],
  }],
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingType: {
      UMAP: 'UMAP',
    },
    obsType: {
      A: 'nucleus',
    },
    featureType: {
      A: 'gene',
    },
    featureValueType: {
      A: 'expression',
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
    },
    uid: 'C',
  },
  {
    component: 'heatmap',
    h: 4,
    w: 8,
    x: 0,
    y: 4,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'A',
      featureValueType: 'A',
    },
    props: {
      transpose: false,
    },
    uid: 'D',
  },
  {
    component: 'featureList',
    h: 4,
    w: 2,
    x: 8,
    y: 4,
    coordinationScopes: {
      featureType: 'A',
    },
    uid: 'E',
  },
  {
    component: 'description',
    h: 4,
    w: 2,
    x: 10,
    y: 4,
    uid: 'F',
  },
  ],
};
