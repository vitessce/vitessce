/* eslint-disable camelcase */
export const legacyViewConfig0_1_0 = {
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

export const upgradedLegacyViewConfig0_1_0 = {
  version: '1.0.1',
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

export const legacyViewConfig1_0_0 = {
  version: '1.0.0',
  public: true,
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    spatialLayers: {
      A: [
        { type: 'cells', radius: 10, visible: true },
        { type: 'molecules', visible: false },
        { type: 'raster', index: 2 },
        { type: 'raster', index: 3 },
      ],
    },
  },
  datasets: [
    {
      files: [],
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
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialLayers: 'A',
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

export const upgradedLegacyViewConfig1_0_0 = {
  version: '1.0.1',
  public: true,
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    spatialRasterLayers: {
      A: [
        { index: 2 },
        { index: 3 },
      ],
    },
    spatialCellsLayer: {
      A: { radius: 10, visible: true },
    },
    spatialMoleculesLayer: {
      A: { visible: false },
    },
    spatialNeighborhoodsLayer: {
      A: null,
    },
  },
  datasets: [
    {
      files: [],
      name: 'A',
      uid: 'A',
    },
  ],
  layout: [
    {
      component: 'description',
      coordinationScopes: {
        dataset: 'A',
        spatialRasterLayers: 'A',
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
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialRasterLayers: 'A',
        spatialCellsLayer: 'A',
        spatialMoleculesLayer: 'A',
        spatialNeighborhoodsLayer: 'A',
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
  version: '1.0.1',
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
    spatialRasterLayers: {
      A: null,
    },
    spatialCellsLayer: {
      A: null,
    },
    spatialMoleculesLayer: {
      A: null,
    },
    spatialNeighborhoodsLayer: {
      A: null,
    },
    spatialRotation: {
      A: 0,
    },
    spatialRotationOrbit: {
      A: 0,
    },
    spatialOrbitAxis: {
      A: 'Y',
    },
    spatialRotationX: {
      A: null,
    },
    spatialRotationY: {
      A: null,
    },
    spatialRotationZ: {
      A: null,
    },
    spatialTargetX: {
      A: 3800,
    },
    spatialTargetY: {
      A: -900,
    },
    spatialTargetZ: {
      A: null,
    },
    spatialZoom: {
      A: -4.4,
    },
    spatialAxisFixed: {
      A: false,
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
        spatialRasterLayers: 'A',
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
        spatialRasterLayers: 'A',
        spatialCellsLayer: 'A',
        spatialMoleculesLayer: 'A',
        spatialNeighborhoodsLayer: 'A',
        spatialRotation: 'A',
        spatialRotationOrbit: 'A',
        spatialOrbitAxis: 'A',
        spatialRotationX: 'A',
        spatialRotationY: 'A',
        spatialRotationZ: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialTargetZ: 'A',
        spatialAxisFixed: 'A',
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
