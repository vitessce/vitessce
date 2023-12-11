export const manu = {
  version: '1.0.15',
  name: 'Setty et al',
  description: 'Glia Cells',
  datasets: [
    {
      uid: 'A',
      name: 'Glia',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://wormglia.org/data/glia.zarr',
          options: {
            obsEmbedding: [
              {
                path: 'obsm/X_umap',
                dims: [0, 1],
                embeddingType: 'UMAP',
              },
              {
                path: 'obsm/X_umap_noBC',
                dims: [0, 1],
                embeddingType: 'UMAP No BC',
              },
              {
                path: 'obsm/X_pca',
                dims: [0, 1],
                embeddingType: 'PCA',
              },
              {
                path: 'obsm/X_pca_harmony',
                dims: [0, 1],
                embeddingType: 'PCA Harmony',
              },
            ],
            obsSets: [
              {
                name: 'glia cell ID',
                path: 'obs/glia cell ID',
              },
              {
                name: 'glia type',
                path: 'obs/glia-type',
              },
              {
                name: 'cluster',
                path: 'obs/cluster',
              },
              {
                name: 'sex dimorphism',
                path: 'obs/sex-dimorphism',
              },

              {
                name: 'cell fraction by sex',
                path: 'obs/cell fraction by sex',
              },

            ],
            obsFeatureMatrix: {
              path: 'X',
            },
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    embeddingType: {
      A: 'UMAP',
      B: 'UMAP',
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
    obsColorEncoding: {
      A: 'geneSelection',
      B: 'cellSetSelection',
    },
    embeddingTargetX: {
      A: 0,
    },
    embeddingTargetY: {
      A: 1,
    },
    embeddingZoom: {
      A: 4,
    },
  },
  layout: [
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        obsColorEncoding: 'B',
        embeddingType: 'A',
        embeddingZoom: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingObsSetLabelsVisible: 'A',
      },
      x: 0.0,
      y: 0.0,
      w: 5.0,
      h: 6.0,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        obsColorEncoding: 'A',
        embeddingType: 'B',
        embeddingZoom: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingObsSetLabelsVisible: 'A',
      },
      x: 5.0,
      y: 0.0,
      w: 5.0,
      h: 6.0,
    },
    {
      component: 'obsSets',
      coordinationScopes: {
        dataset: 'A',
      },
      x: 10.0,
      y: 3.0,
      w: 2.0,
      h: 2.0,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
      },
      x: 10.0,
      y: 0.0,
      w: 2.0,
      h: 4.0,
    },
  ],
  initStrategy: 'auto',
};
