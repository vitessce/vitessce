export const legacyViewConfig = {
  version: '0.1.0',
  public: true,
  name: 'My config name',
  description: 'My config description',
  layers: [{
    name: 'cells',
    type: 'CELLS',
    fileType: 'cells.json',
    url: 'https://example.com/cells.json',
  }, {
    name: 'cell-sets',
    type: 'CELL-SETS',
    fileType: 'cell-sets.json',
    url: 'https://example.com/cell-sets.json',
  }],
  staticLayout: [{
    component: 'description',
    props: {
      description: 'My component description',
    },
    x: 9,
    y: 0,
    w: 3,
    h: 2,
  }, {
    component: 'scatterplot',
    props: {
      mapping: 't-SNE',
      view: {
        zoom: 3,
        target: [0, 0, 0],
      },
    },
    x: 0,
    y: 2,
    w: 5,
    h: 4,
  }, {
    component: 'spatial',
    props: {
      cellRadius: 50,
      view: {
        zoom: -4.4,
        target: [3800, -900, 0],
      },
    },
    x: 5,
    y: 0,
    w: 4,
    h: 4,
  }],
};

export const upgradedViewConfig = {
  version: '1.0.0',
  public: true,
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingTargetX: {
      A: 0,
    },
    embeddingTargetY: {
      A: 0,
    },
    embeddingType: {
      't-SNE': 't-SNE',
    },
    embeddingZoom: {
      A: 3,
    },
    spatialTargetX: {
      A: 3800,
    },
    spatialTargetY: {
      A: -900,
    },
    spatialZoom: {
      A: -4.4,
    },
  },
  datasets: [
    {
      files: [
        {
          fileType: 'cells.json',
          type: 'cells',
          url: 'https://example.com/cells.json',
        },
        {
          fileType: 'cell-sets.json',
          type: 'cell-sets',
          url: 'https://example.com/cell-sets.json',
        },
      ],
      name: 'A',
      uid: 'A',
    },
  ],
  layout: [
    {
      component: 'description',
      coordinationScopes: {},
      h: 2,
      props: {
        description: 'My component description',
      },
      w: 3,
      x: 9,
      y: 0,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingType: 't-SNE',
        embeddingZoom: 'A',
      },
      h: 4,
      props: {
        mapping: 't-SNE',
        view: {
          target: [
            0,
            0,
            0,
          ],
          zoom: 3,
        },
      },
      w: 5,
      x: 0,
      y: 2,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
      },
      h: 4,
      props: {
        cellRadius: 50,
        view: {
          target: [
            3800,
            -900,
            0,
          ],
          zoom: -4.4,
        },
      },
      w: 4,
      x: 5,
      y: 0,
    },
  ],
};
export const initializedViewConfig = {
  version: '1.0.0',
  public: true,
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    cellColorEncoding: {
      A: 'cellSetSelection',
    },
    cellFilter: {
      A: null,
    },
    cellHighlight: {
      A: null,
    },
    cellSetHighlight: {
      A: null,
    },
    cellSetSelection: {
      A: null,
    },
    dataset: {
      A: 'A',
    },
    embeddingRotation: {
      A: 0,
    },
    embeddingTargetX: {
      A: 0,
    },
    embeddingTargetY: {
      A: 0,
    },
    embeddingTargetZ: {
      A: 0,
    },
    embeddingType: {
      't-SNE': 't-SNE',
    },
    embeddingZoom: {
      A: 3,
    },
    embeddingCellRadius: {
      A: 1,
    },
    embeddingCellSetLabelSize: {
      A: 14,
    },
    embeddingCellSetLabelsVisible: {
      A: false,
    },
    embeddingCellSetPolygonsVisible: {
      A: false,
    },
    geneExpressionColormap: {
      A: 'plasma',
    },
    geneExpressionColormapRange: {
      A: [
        0,
        1,
      ],
    },
    geneHighlight: {
      A: null,
    },
    geneSelection: {
      A: null,
    },
    spatialLayers: {
      A: null,
    },
    spatialRotation: {
      A: 0,
    },
    spatialTargetX: {
      A: 3800,
    },
    spatialTargetY: {
      A: -900,
    },
    spatialTargetZ: {
      A: 0,
    },
    spatialZoom: {
      A: -4.4,
    },
    additionalCellSets: {
      A: null,
    },
    cellSetColor: {
      A: null,
    },
    moleculeHighlight: {
      A: null,
    },
  },
  datasets: [
    {
      files: [
        {
          fileType: 'cells.json',
          type: 'cells',
          url: 'https://example.com/cells.json',
        },
        {
          fileType: 'cell-sets.json',
          type: 'cell-sets',
          url: 'https://example.com/cell-sets.json',
        },
      ],
      name: 'A',
      uid: 'A',
    },
  ],
  layout: [
    {
      component: 'description',
      coordinationScopes: {
        dataset: 'A',
        spatialLayers: 'A',
      },
      h: 2,
      props: {
        description: 'My component description',
      },
      w: 3,
      x: 9,
      y: 0,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        cellColorEncoding: 'A',
        cellFilter: 'A',
        cellHighlight: 'A',
        cellSetHighlight: 'A',
        cellSetSelection: 'A',
        cellSetColor: 'A',
        dataset: 'A',
        embeddingRotation: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingTargetZ: 'A',
        embeddingType: 't-SNE',
        embeddingZoom: 'A',
        embeddingCellRadius: 'A',
        embeddingCellSetLabelSize: 'A',
        embeddingCellSetLabelsVisible: 'A',
        embeddingCellSetPolygonsVisible: 'A',
        geneExpressionColormap: 'A',
        geneExpressionColormapRange: 'A',
        geneHighlight: 'A',
        geneSelection: 'A',
        additionalCellSets: 'A',
      },
      h: 4,
      props: {
        mapping: 't-SNE',
        view: {
          target: [
            0,
            0,
            0,
          ],
          zoom: 3,
        },
      },
      w: 5,
      x: 0,
      y: 2,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        cellColorEncoding: 'A',
        cellFilter: 'A',
        cellHighlight: 'A',
        cellSetHighlight: 'A',
        cellSetSelection: 'A',
        cellSetColor: 'A',
        dataset: 'A',
        geneExpressionColormap: 'A',
        geneExpressionColormapRange: 'A',
        geneHighlight: 'A',
        geneSelection: 'A',
        spatialLayers: 'A',
        spatialRotation: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialTargetZ: 'A',
        spatialZoom: 'A',
        additionalCellSets: 'A',
        moleculeHighlight: 'A',
      },
      h: 4,
      props: {
        cellRadius: 50,
        view: {
          target: [
            3800,
            -900,
            0,
          ],
          zoom: -4.4,
        },
      },
      w: 4,
      x: 5,
      y: 0,
    },
  ],
};
