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


export const legacyViewConfig1_0_6 = {
  version: '1.0.6',
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
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialRasterLayers: 'A',
        spatialCellsLayer: 'A',
        spatialMoleculesLayer: 'A',
        spatialNeighborhoodsLayer: 'A',
      },
      h: 4,
      props: {},
      w: 4,
      x: 5,
      y: 0,
    },
  ],
};

export const upgradedLegacyViewConfig1_0_6 = {
  version: '1.1.0',
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    featureType: {},
    obsType: {},
    subFeatureType: {},
    subObsType: {},
    spatialRasterLayers: {
      A: [
        { index: 2 },
        { index: 3 },
      ],
    },
    spatialObsLayer: {
      A: { radius: 10, visible: true },
    },
    spatialSubObsLayer: {
      A: { visible: false },
    },
    spatialNeighborhoodsLayer: {
      A: null,
    },
  },
  datasets: [
    {
      files: [
        {
          fileType: 'cells.json',
          dataType: 'obs',
          entityTypes: {
            obsType: 'cell',
          },
          url: 'https://example.com/cells.json',
        },
        {
          fileType: 'cellSets.json',
          dataType: 'obsSets',
          entityTypes: {
            obsType: 'cell',
          },
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
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialRasterLayers: 'A',
        spatialObsLayer: 'A',
        spatialSubObsLayer: 'A',
        spatialNeighborhoodsLayer: 'A',
      },
      h: 4,
      props: {},
      w: 4,
      x: 5,
      y: 0,
    },
  ],
};


export const initializedViewConfig = {
  version: '1.1.0',
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    obsColorEncoding: {
      A: 'obsSetSelection',
    },
    obsFilter: {
      A: null,
    },
    obsHighlight: {
      A: null,
    },
    obsSetHighlight: {
      A: null,
    },
    obsSetSelection: {
      A: null,
    },
    dataset: {
      A: 'A',
    },
    featureValueColormap: {
      A: 'plasma',
    },
    featureValueColormapRange: {
      A: [
        0,
        1,
      ],
    },
    featureHighlight: {
      A: null,
    },
    featureSelection: {
      A: null,
    },
    spatialRasterLayers: {
      A: [
        { index: 2 },
        { index: 3 },
      ],
    },
    spatialObsLayer: {
      A: {
        radius: 10,
        visible: true,
      },
    },
    spatialSubObsLayer: {
      A: { visible: false },
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
      A: null,
    },
    spatialTargetY: {
      A: null,
    },
    spatialTargetZ: {
      A: null,
    },
    spatialZoom: {
      A: null,
    },
    spatialAxisFixed: {
      A: false,
    },
    additionalObsSets: {
      A: null,
    },
    obsSetColor: {
      A: null,
    },
    subObsHighlight: {
      A: null,
    },
    featureType: {
      A: 'gene',
    },
    featureValueType: {
      A: 'expression',
    },
    obsType: {
      A: 'cell',
    },
    subFeatureType: {
      A: 'isoform',
    },
    subFeatureValueType: {
      A: 'intensity',
    },
    subObsType: {
      A: 'molecule',
    },
  },
  datasets: [
    {
      files: [
        {
          fileType: 'cells.json',
          dataType: 'obs',
          entityTypes: {
            obsType: 'cell',
          },
          url: 'https://example.com/cells.json',
        },
        {
          fileType: 'cellSets.json',
          dataType: 'obsSets',
          entityTypes: {
            obsType: 'cell',
          },
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
        featureType: 'A',
        featureValueType: 'A',
        obsType: 'A',
        spatialRasterLayers: 'A',
        subFeatureType: 'A',
        subFeatureValueType: 'A',
        subObsType: 'A',
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
        obsColorEncoding: 'A',
        obsFilter: 'A',
        obsHighlight: 'A',
        obsSetHighlight: 'A',
        obsSetSelection: 'A',
        obsSetColor: 'A',
        dataset: 'A',
        featureType: 'A',
        featureValueType: 'A',
        obsType: 'A',
        subFeatureType: 'A',
        subFeatureValueType: 'A',
        subObsType: 'A',
        featureValueColormap: 'A',
        featureValueColormapRange: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
        spatialRasterLayers: 'A',
        spatialObsLayer: 'A',
        spatialSubObsLayer: 'A',
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
        additionalObsSets: 'A',
        subObsHighlight: 'A',
      },
      h: 4,
      props: {},
      w: 4,
      x: 5,
      y: 0,
    },
  ],
};
