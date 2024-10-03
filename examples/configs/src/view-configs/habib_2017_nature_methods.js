
function createHabib2017(storeType) {
  let adataUrl = 'https://storage.googleapis.com/vitessce-demo-data/habib-2017/habib17.processed.h5ad.zarr';
  let fileType = 'anndata.zarr';
  const extraOptions = {};
  if (storeType === 'zip') {
    adataUrl = 'https://storage.googleapis.com/vitessce-demo-data/habib-2017/habib17.processed.h5ad.zarr.zip';
    fileType = 'anndata.zarr.zip';
  } else if (storeType === 'h5ad') {
    adataUrl = 'https://storage.googleapis.com/vitessce-demo-data/habib-2017/habib17.processed.h5ad';
    fileType = 'anndata.h5ad';
    extraOptions.refSpecUrl = 'https://storage.googleapis.com/vitessce-demo-data/habib-2017/habib17.reference.json';
  }
  return {
    version: '1.0.17',
    name: 'Habib et al., 2017 Nature Methods',
    description: 'Archived frozen adult human post-mortem brain tissue profiled by snRNA-seq (DroNc-seq)',
    datasets: [{
      uid: 'habib-2017',
      name: 'Habib 2017',
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
          obsFeatureMatrix: {
            path: 'X',
            initialFeatureFilterPath: (storeType === 'h5ad'
              ? 'var/highly_variable'
              : 'var/top_highly_variable'
            ),
          },
          obsEmbedding: {
            path: 'obsm/X_umap',
          },
          obsSets: [{
            name: 'Cell Type',
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
      component: 'heatmap',
      h: 4,
      w: 8,
      x: 0,
      y: 4,
      coordinationScopes: {
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureValueColormapRange: 'A',
      },
      props: {
        transpose: true,
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
}

export const habib2017withQualityMetrics = {
  version: '1.0.15',
  name: 'Habib et al., 2017 Nature Methods',
  description: 'Archived frozen adult human post-mortem brain tissue profiled by snRNA-seq (DroNc-seq)',
  datasets: [{
    uid: 'habib-2017',
    name: 'Habib 2017',
    files: [
      {
        fileType: 'anndata.zarr',
        url: 'https://storage.googleapis.com/vitessce-demo-data/habib-2017/habib17.processed.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
          featureType: 'gene',
          featureValueType: 'expression',
          embeddingType: 'UMAP',
        },
        options: {
          obsFeatureMatrix: {
            path: 'X',
            initialFeatureFilterPath: 'var/top_highly_variable',
          },
          obsEmbedding: {
            path: 'obsm/X_umap',
          },
          obsSets: [{
            name: 'Cell Type',
            path: 'obs/CellType',
          }],
        },
      },
      {
        fileType: 'obsFeatureColumns.anndata.zarr',
        url: 'https://storage.googleapis.com/vitessce-demo-data/habib-2017/habib17.processed.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
          featureType: 'qualityMetric',
          featureValueType: 'value',
        },
        options: [
          { path: 'obs/n_genes' },
          { path: 'obs/n_counts' },
          { path: 'obs/percent_mito' },
          { path: 'obs/percent_ribo' },
        ],
      },
    ],
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
      B: 'qualityMetric',
    },
    featureValueType: {
      A: 'expression',
      B: 'value',
    },
    featureValueColormapRange: {
      A: [0.0, 0.35],
    },
    featureSelection: {
      B: null,
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
    component: 'featureValueHistogram',
    h: 4,
    w: 4,
    x: 8,
    y: 0,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'B',
      featureValueType: 'B',
      featureSelection: 'B',

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
    component: 'heatmap',
    h: 4,
    w: 8,
    x: 0,
    y: 4,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'A',
      featureValueType: 'A',
      featureValueColormapRange: 'A',
    },
    props: {
      transpose: true,
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
    component: 'featureList',
    h: 4,
    w: 2,
    x: 10,
    y: 4,
    uid: 'F',
    coordinationScopes: {
      featureType: 'B',
      featureSelection: 'B',
    },
  },
  ],
};

export const habib2017natureMethods = createHabib2017(null);
export const habib2017natureMethodsZip = createHabib2017('zip');
export const habib2017natureMethodsH5ad = createHabib2017('h5ad');
