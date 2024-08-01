export const meta2022azimuth = {
  version: '1.0.15',
  name: 'Meta-analysis, Azimuth 2022',
  description: 'Meta-analysis of 10 datasets of healthy and diseased human lung',
  datasets: [{
    uid: 'azimuth_2022_meta',
    name: 'azimuth_2022_meta',
    files: [{
      fileType: 'anndata.zarr',
      url: 'https://data-1.vitessce.io/0.0.33/main/meta-2022-azimuth/meta_2022_azimuth.h5ad.zarr',
      coordinationValues: {
        obsType: 'cell',
        featureType: 'gene',
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
        featureLabels: {
          path: 'var/feature_name',
        },
        obsSets: [
          {
            name: 'Cell Type',
            path: 'obs/cell_type',
          },
          {
            name: 'Cell Type Annotation',
            path: ['obs/annotation.l2', 'obs/annotation.l1'],
          },
          {
            name: 'Assay',
            path: 'obs/assay',
          },
          {
            name: 'Disease',
            path: 'obs/disease',
          },
          {
            name: 'Organism',
            path: 'obs/organism',
          },
          {
            name: 'Sex',
            path: 'obs/sex',
          },
          {
            name: 'Tissue',
            path: 'obs/tissue',
          },
          {
            name: 'Ethnicity',
            path: 'obs/ethnicity',
          },
          {
            name: 'Development Stage',
            path: 'obs/development_stage',
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
      A: 'gene',
    },
    featureValueType: {
      A: 'expression',
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
