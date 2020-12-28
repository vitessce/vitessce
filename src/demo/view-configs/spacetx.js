

const allenName = 'Allen Brain Institute, SpaceTx';
const allenDescription = 'Multiplexed smFISH data of mouse primary visual cortex generated as part of the SpaceTx consortium, with cell segmentations from Baysor (Petukhov et al. 2020)';
export const allenSpaceTx = {
  name: allenName,
  version: '1.0.0',
  description: allenDescription,
  public: true,
  datasets: [
    {
      uid: 'Allen smFISH',
      name: 'Allen smFISH',
      files: [
        {
          type: 'cells',
          fileType: 'cells.json',
          url: 'https://sealver.in/vitessce/allen_smfish/cells.json',
        },
        {
          type: 'cell-sets',
          fileType: 'cell-sets.json',
          url: 'https://sealver.in/vitessce/allen_smfish/cell-sets.json',
        },
        {
          type: 'molecules',
          fileType: 'molecules.json',
          url: 'https://sealver.in/vitessce/allen_smfish/molecules.json',
        },
        {
          type: 'expression-matrix',
          fileType: 'genes.json',
          url: 'https://sealver.in/vitessce/allen_smfish/genes.json',
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingZoom: {
      PCA: -5,
      UMAP: 4,
    },
    embeddingType: {
      PCA: 'PCA',
      UMAP: 'UMAP',
    },
    embeddingTargetX: {
      PCA: -6.264900002861395e-05,
      UMAP: 8.823951721191406,
    },
    embeddingTargetY: {
      PCA: 2.412833237031009e-05,
      UMAP: -5.24752950668335,
    },
    spatialZoom: {
      A: -2,
    },
    spatialTargetX: {
      A: -1646.553281965,
    },
    spatialTargetY: {
      A: -1217.57779983,
    },
    spatialLayers: {
      A: [
        {
          type: 'molecules',
          radius: 2,
          opacity: 1,
          visible: true,
        },
        {
          type: 'cells',
          opacity: 1,
          radius: 50,
          visible: true,
          stroked: false,
        },
      ],
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        description: allenDescription,
      },
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        spatialLayers: 'A',
      },
      x: 0,
      y: 2,
      w: 2,
      h: 3,
    },
    {
      component: 'status',
      x: 0,
      y: 5,
      w: 2,
      h: 1,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialLayers: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 2,
      y: 0,
      w: 4,
      h: 4,
    },
    {
      component: 'genes',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'cellSets',
      x: 9,
      y: 3,
      w: 3,
      h: 2,
    },
    {
      component: 'heatmap',
      props: {
        transpose: true,
      },
      x: 2,
      y: 4,
      w: 10,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'PCA',
        embeddingZoom: 'PCA',
        embeddingTargetY: 'PCA',
        embeddingTargetX: 'PCA',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'UMAP',
        embeddingZoom: 'UMAP',
        embeddingTargetY: 'UMAP',
        embeddingTargetX: 'UMAP',
      },
      x: 6,
      y: 2,
      w: 3,
      h: 2,
    },
  ],
};
