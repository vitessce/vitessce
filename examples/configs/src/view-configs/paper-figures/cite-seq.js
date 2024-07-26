export const citeSeq = {
  version: '1.0.15',
  name: 'CITE-seq example',
  description: 'RNA+ADT',
  datasets: [
    {
      uid: 'A',
      name: 'CBMC 8K',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/GSE100866_CBMC_8K_13AB_10X.mdata.zarr/mod/rna',
          options: {
            obsEmbedding: [
              {
                path: 'obsm/X_umap',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 'UMAP',
              },
              {
                path: 'obsm/X_pca',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 'PCA',
              },
            ],
            obsSets: [
              {
                name: 'Leiden Clusters',
                path: 'obs/leiden',
              },
              {
                name: 'Predicted Cell Type',
                path: [
                  'obs/high_majority_voting',
                  'obs/low_majority_voting',
                ],
              },
            ],
            obsFeatureMatrix: {
              path: 'X',
            },
          },
          coordinationValues: {
            featureType: 'gene',
            featureValueType: 'expression',
          },
        },
        {
          fileType: 'anndata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/GSE100866_CBMC_8K_13AB_10X.mdata.zarr/mod/adt',
          options: {
            obsEmbedding: [
              {
                path: 'obsm/X_umap',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 'UMAP',
              },
            ],
            obsSets: [
              {
                name: 'Leiden Clusters',
                path: 'obs/leiden',
              },
              {
                name: 'Predicted Cell Type',
                path: [
                  'obs/high_majority_voting',
                  'obs/low_majority_voting',
                ],
              },
            ],
            obsFeatureMatrix: {
              path: 'X',
            },
          },
          coordinationValues: {
            featureType: 'tag',
            featureValueType: 'count',
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
    featureType: {
      A: 'gene',
      B: 'tag',
    },
    featureValueType: {
      A: 'expression',
      B: 'count',
    },
    featureSelection: {
      A: [
        'GZMB',
      ],
      B: [
        'CD56',
      ],
    },
    obsColorEncoding: {
      A: 'geneSelection',
      B: 'geneSelection',
    },
    featureValueColormapRange: {
      A: [
        0.0,
        0.3,
      ],
      B: [
        0.0,
        0.5,
      ],
    },
    embeddingZoom: {
      A: 3,
    },
    embeddingTargetX: {
      A: 8,
    },
    embeddingTargetY: {
      A: -3,
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
    obsSetSelection: {
      A: [
        [
          'Predicted Cell Type',
          'ILC',
          'CD16- NK cells',
        ],
        [
          'Predicted Cell Type',
          'ILC',
          'CD16+ NK cells',
        ],
        [
          'Predicted Cell Type',
          'ILC',
          'Classical monocytes',
        ],
        [
          'Predicted Cell Type',
          'ILC',
          'NK cells',
        ],
      ],
    },
  },
  layout: [
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        embeddingType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'A',
        obsColorEncoding: 'A',
        featureValueColormapRange: 'A',
        embeddingZoom: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingObsSetLabelsVisible: 'A',
        obsSetSelection: 'A',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 6,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        embeddingType: 'B',
        featureType: 'B',
        featureValueType: 'B',
        featureSelection: 'B',
        obsColorEncoding: 'B',
        featureValueColormapRange: 'B',
        embeddingZoom: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingObsSetLabelsVisible: 'A',
        obsSetSelection: 'A',
      },
      x: 6,
      y: 6,
      w: 3,
      h: 6,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'A',
        obsColorEncoding: 'A',
        featureValueColormapRange: 'A',
        obsSetSelection: 'A',
      },
      x: 9,
      y: 0,
      w: 3,
      h: 4,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'B',
        featureValueType: 'B',
        featureSelection: 'B',
        obsColorEncoding: 'B',
        featureValueColormapRange: 'B',
        obsSetSelection: 'A',
      },
      x: 9,
      y: 8,
      w: 3,
      h: 4,
    },
    {
      component: 'obsSets',
      coordinationScopes: {
        dataset: 'A',
        obsSetSelection: 'A',
      },
      x: 9,
      y: 4,
      w: 3,
      h: 4,
    },
    {
      component: 'heatmap',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'A',
        obsColorEncoding: 'A',
        featureValueColormapRange: 'A',
        obsSetSelection: 'A',
      },
      x: 0,
      y: 0,
      w: 6,
      h: 6,
      props: {
        transpose: true,
      },
    },
    {
      component: 'heatmap',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'B',
        featureValueType: 'B',
        featureSelection: 'B',
        obsColorEncoding: 'B',
        featureValueColormapRange: 'B',
        obsSetSelection: 'A',
      },
      x: 0,
      y: 6,
      w: 6,
      h: 6,
      props: {
        transpose: true,
      },
    },
  ],
  initStrategy: 'auto',
};
