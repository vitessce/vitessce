export const combat2022cell = {
  version: '1.0.15',
  name: 'COMBAT Consortium, 2022 Cell',
  description: 'COVID-19 Multi-omic Blood Atlas',
  datasets: [{
    uid: 'a',
    name: 'CITE-Seq',
    files: [
      {
        fileType: 'obsEmbedding.anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/combat-2022/combat_2022_cell.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
          embeddingType: 'UMAP',
        },
        options: {
          path: 'obsm/X_umap',
        },
      },
      {
        fileType: 'obsSets.anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/combat-2022/combat_2022_cell.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
        },
        options: [
          {
            name: 'Cell Type',
            path: 'obs/cell_type',
          },
          {
            name: 'Source',
            path: 'obs/Source',
          },
        ],
      },
      {
        fileType: 'obsFeatureMatrix.anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/combat-2022/combat_2022_cell.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
          featureType: 'gene',
          featureValueType: 'expression',
        },
        options: {
          path: 'obsm/X_gene_expression',
          featureFilterPath: 'var/is_gene_expression',
        },
      },
      {
        fileType: 'obsFeatureMatrix.anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/combat-2022/combat_2022_cell.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
          featureType: 'antibody',
          featureValueType: 'capture',
        },
        options: {
          path: 'obsm/X_antibody_capture',
          featureFilterPath: 'var/is_antibody_capture',
        },
      },
    ],
  }],
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingType: {
      UMAP: 'UMAP',
    },
    embeddingZoom: {
      A: null,
    },
    embeddingTargetX: {
      A: null,
    },
    embeddingTargetY: {
      A: null,
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
    obsType: {
      A: 'cell',
    },
    featureType: {
      A: 'gene',
      B: 'antibody',
    },
    featureValueType: {
      A: 'expression',
      B: 'capture',
    },
    obsColorEncoding: {
      A: 'cellSetSelection',
      B: 'cellSetSelection',
    },
    featureSelection: {
      A: null,
      B: null,
    },
    featureValueColormapRange: {
      A: [0, 0.05],
      B: [0, 0.05],
    },
  },
  layout: [{
    component: 'obsSets',
    h: 4,
    w: 3,
    x: 7,
    y: 0,
    coordinationScopes: {
      obsType: 'A',
    },
    uid: 'A',
  },
  {
    component: 'obsSetSizes',
    h: 4,
    w: 5,
    x: 7,
    y: 4,
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
      obsColorEncoding: 'A',
      featureSelection: 'A',
      embeddingZoom: 'A',
      embeddingTargetX: 'A',
      embeddingTargetY: 'A',
      embeddingObsSetLabelsVisible: 'A',
      featureValueColormapRange: 'A',
    },
    uid: 'C',
  },
  {
    component: 'scatterplot',
    h: 4,
    w: 4,
    x: 0,
    y: 4,
    coordinationScopes: {
      embeddingType: 'UMAP',
      obsType: 'A',
      featureType: 'B',
      featureValueType: 'B',
      obsColorEncoding: 'B',
      featureSelection: 'B',
      embeddingZoom: 'A',
      embeddingTargetX: 'A',
      embeddingTargetY: 'A',
      embeddingObsSetLabelsVisible: 'A',
      featureValueColormapRange: 'B',
    },
    uid: 'D',
  },
  {
    component: 'description',
    h: 4,
    w: 2,
    x: 10,
    y: 0,
    uid: 'E',
  },
  {
    component: 'featureList',
    h: 4,
    w: 3,
    x: 4,
    y: 0,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'A',
      obsColorEncoding: 'A',
      featureSelection: 'A',
    },
    uid: 'F',
  },
  {
    component: 'featureList',
    h: 4,
    w: 3,
    x: 4,
    y: 4,
    coordinationScopes: {
      obsType: 'A',
      featureType: 'B',
      obsColorEncoding: 'B',
      featureSelection: 'B',
    },
    uid: 'G',
  },
  ],
};
