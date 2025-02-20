const adataUrl = 'https://storage.googleapis.com/vitessce-demo-data/nakshatri-2024/84df8fa1-ab53-43c9-a439-95dcb9148265.h5ad';
const fileType = 'anndata.h5ad';
const extraOptions = {
  refSpecUrl: 'https://storage.googleapis.com/vitessce-demo-data/nakshatri-2024/nakshatri_2024.ref_spec.json',
};
export const nakshatri2024natureMedH5ad = {
  version: '1.0.17',
  name: 'Nakshatri et al., 2024 Nature Medicine',
  description: 'Single-nucleus chromatin accessibility and transcriptomic map of breast tissues of women of diverse genetic ancestry',
  datasets: [{
    uid: 'nakshatri-2024',
    name: 'Nakshatri 2024',
    files: [{
      fileType,
      url: adataUrl,
      coordinationValues: {
        obsType: 'cell',
        featureType: 'gene',
        featureValueType: 'expression',
        embeddingType: 'UMAP',
      },
      options: {
        ...extraOptions,
        featureLabels: {
          path: 'var/feature_name',
        },
        obsFeatureMatrix: {
          path: 'X',
        },
        obsEmbedding: {
          path: 'obsm/X_wnn.umap',
        },
        obsSets: [{
          name: 'Cell Type',
          path: 'obs/cell_type',
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
      A: 'cell',
    },
    featureType: {
      A: 'gene',
    },
    featureValueType: {
      A: 'expression',
    },
    featureValueColormapRange: {
      A: [0.0, 0.35],
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
      featureValueColormapRange: 'A',
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
