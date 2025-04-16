export const multiome = {
  version: '1.0.15',
  name: 'Multiome data',
  description: 'RNA+ATAC',
  datasets: [
    {
      uid: 'A',
      name: 'RNA+ATAC',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/brain3k_processed.mdata.zarr/mod/rna',
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
                name: 'Cell Type',
                path: 'obs/celltype',
              },
            ],
            obsFeatureMatrix: {
              path: 'obsm/X_hvg',
              featureFilterPath: 'var/highly_variable',
            },
          },
          coordinationValues: {
            featureType: 'gene',
            featureValueType: 'expression',
          },
        },
        {
          fileType: 'anndata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/brain3k_processed.mdata.zarr/mod/atac',
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
                name: 'Cell Type',
                path: 'obs/celltype',
              },
            ],
            obsFeatureMatrix: {
              path: 'obsm/X_hvg',
              featureFilterPath: 'var/highly_variable',
            },
          },
          coordinationValues: {
            featureType: 'peak',
            featureValueType: 'count',
          },
        },
        {
          fileType: 'genomic-profiles.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/brain3k.multivec.zarr',
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
      B: 'peak',
    },
    featureValueType: {
      A: 'expression',
      B: 'count',
    },
    featureSelection: {
      A: null,
      B: null,
      C: [
        'SMARCA4',
      ],
    },
    obsColorEncoding: {
      A: 'cellSetSelection',
      B: 'cellSetSelection',
    },
    featureValueColormapRange: {
      A: [
        0.0,
        0.3,
      ],
      B: [
        0.0,
        1.0,
      ],
    },
    embeddingZoom: {
      A: 3,
    },
    embeddingTargetX: {
      A: 0,
    },
    embeddingTargetY: {
      A: 0,
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
    genomicTargetX: {
      A: 2665412779,
    },
    genomicTargetY: {
      A: 834360634,
    },
    genomicZoomX: {
      A: 13.8699,
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
        featureSelection: 'C',
        obsColorEncoding: 'A',
        featureValueColormapRange: 'A',
        embeddingZoom: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingObsSetLabelsVisible: 'A',
      },
      x: 6.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
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
      },
      x: 6.0,
      y: 6.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'C',
        obsColorEncoding: 'A',
        featureValueColormapRange: 'A',
      },
      x: 9.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
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
      },
      x: 9.0,
      y: 6.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'heatmap',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'C',
        obsColorEncoding: 'A',
        featureValueColormapRange: 'A',
      },
      x: 0.0,
      y: 0.0,
      w: 6.0,
      h: 6.0,
      props: {
        transpose: false,
      },
    },
    {
      component: 'genomicProfiles',
      coordinationScopes: {
        dataset: 'A',
        genomicTargetX: 'A',
        genomicTargetY: 'A',
        genomicZoomX: 'A',
      },
      x: 0.0,
      y: 6.0,
      w: 6.0,
      h: 6.0,
    },
  ],
  initStrategy: 'auto',
};
