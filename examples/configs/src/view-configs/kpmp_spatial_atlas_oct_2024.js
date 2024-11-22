export const kpmpSpatialAtlasOct2024 = {
  version: '1.0.15',
  name: 'KPMP Spatial Atlas, October 2024',
  description: 'KPMP Spatial Atlas, October 2024',
  datasets: [{
    uid: 'kpmp_spatial_atlas_1m',
    name: 'kpmp_spatial_atlas_1m',
    files: [{
      fileType: 'anndata.zarr',
      url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-spatial-atlas-oct-2024/kpmp_spatial_atlas_1m.adata.zarr',
      coordinationValues: {
        obsType: 'cell',
        featureType: 'biomarker',
        featureValueType: 'expression',
        embeddingType: 'UMAP',
      },
      options: {
        obsFeatureMatrix: {
          path: 'X',
        },
        obsEmbedding: {
          path: 'obsm/X_umap',
        },
        obsSets: [
          {
            name: 'Cluster',
            path: 'obs/cluster',
          },
        ],
      },
    }],
  }],
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingType: {
      UMAP: 'UMAP',
    },
    obsType: {
      A: 'cell',
    },
    featureType: {
      A: 'biomarker',
    },
    featureValueType: {
      A: 'expression',
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
  },
  layout: [{
    component: 'obsSets',
    h: 6,
    w: 2,
    x: 10,
    y: 6,
    coordinationScopes: {
      obsType: 'A',
    },
    uid: 'A',
  },
  {
    component: 'obsSetSizes',
    h: 5,
    w: 4,
    x: 8,
    y: 1,
    coordinationScopes: {
      obsType: 'A',
    },
    uid: 'B',
  },
  {
    component: 'scatterplot',
    h: 12,
    w: 8,
    x: 0,
    y: 0,
    coordinationScopes: {
      embeddingType: 'UMAP',
      obsType: 'A',
      featureType: 'A',
      featureValueType: 'A',
      embeddingObsSetLabelsVisible: 'A',
    },
    uid: 'C',
  },

  {
    component: 'featureList',
    h: 6,
    w: 2,
    x: 8,
    y: 6,
    coordinationScopes: {
      featureType: 'A',
    },
    uid: 'E',
  },
  {
    component: 'description',
    h: 1,
    w: 4,
    x: 8,
    y: 0,
    uid: 'F',
  },
  ],
};
