export const salcher2022 = {
  version: '1.0.15',
  name: 'Salcher et al., Cancer Cell 2022',
  description: 'Extended single-cell lung cancer atlas (LuCA) containing over one million cells',
  datasets: [
    {
      uid: 'A',
      name: 'An automatically generated view config for dataset. Adjust values and add layout components if needed.',
      files: [
        {
          url: 'https://storage.googleapis.com/vitessce-demo-data/salcher-2022/salcher_2022_extended.h5ad.zarr',
          fileType: 'anndata.zarr',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
          },
          options: {
            obsEmbedding: [
              {
                path: 'obsm/X_umap',
                embeddingType: 'UMAP',
              },
            ],
            obsFeatureMatrix: {
              path: 'X',
            },
            obsSets: [
              {
                name: 'Cell Type',
                path: 'obs/cell_type',
              },
            ],
            featureLabels: {
              path: 'var/feature_name',
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
    },
    featureSelection: {
      A: ['ENSG00000133639'],
    },
    obsColorEncoding: {
      A: 'geneSelection',
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
    featureValueColormapRange: {
      A: [0.0, 0.25],
    },
    featureValueColormap: {
      A: 'plasma',
    },
  },
  layout: [
    {
      component: 'obsSets',
      coordinationScopes: {
        dataset: 'A',
        obsColorEncoding: 'A',
        featureSelection: 'A',
      },
      x: 10,
      y: 6,
      w: 2,
      h: 6,
    },
    {
      component: 'obsSetSizes',
      coordinationScopes: {
        dataset: 'A',
        obsColorEncoding: 'A',
        featureSelection: 'A',
      },
      x: 8,
      y: 1,
      w: 4,
      h: 6,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        embeddingType: 'A',
        obsSetLabelsVisible: 'A',
        obsColorEncoding: 'A',
        featureSelection: 'A',
        embeddingObsSetLabelsVisible: 'A',
        featureValueColormapRange: 'A',
        featureValueColormap: 'A',
      },
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsColorEncoding: 'A',
        featureSelection: 'A',
      },
      x: 8,
      y: 6,
      w: 2,
      h: 6,
    },
  ],
  initStrategy: 'auto',
};
