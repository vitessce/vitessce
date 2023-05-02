/* eslint-disable camelcase */
import { z } from 'zod';
import {
  configSchema0_1_0,
  configSchema1_0_0,
  configSchema1_0_1,
  configSchema1_0_15,
  configSchema1_0_16,
} from './previous-config-schemas.js';

/* eslint-disable camelcase */
export const legacyViewConfig0_1_0: z.infer<typeof configSchema0_1_0> = {
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

export const upgradedLegacyViewConfig0_1_0: z.infer<typeof configSchema1_0_0> = {
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
          url: 'https://example.com/cells.json',
        },
        {
          fileType: 'cell-sets.json',
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

export const legacyViewConfig1_0_0: z.infer<typeof configSchema1_0_0> = {
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

export const upgradedLegacyViewConfig1_0_0: z.infer<typeof configSchema1_0_1> = {
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


export const missingViewUids = {
  version: '1.0.9',
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: {
      A: 'A',
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
      },
      h: 2,
      w: 3,
      x: 9,
      y: 0,
    },
    {
      component: 'scatterplot',
      uid: 'some-umap',
      coordinationScopes: {
        dataset: 'A',
      },
      h: 4,
      w: 5,
      x: 0,
      y: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
      },
      h: 4,
      w: 5,
      x: 0,
      y: 2,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
      },
      h: 4,
      w: 4,
      x: 5,
      y: 0,
    },
  ],
};


export const viewConfig1_0_10 = {
  version: '1.0.10',
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
  version: '1.0.10',
  name: 'My config name',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    obsType: {
      A: 'cell',
    },
    featureType: {
      A: 'gene',
    },
    featureValueType: {
      A: 'expression',
    },
    obsColorEncoding: {
      A: 'cellSetSelection',
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
    embeddingObsOpacity: {
      A: 1,
    },
    embeddingObsOpacityMode: {
      A: 'auto',
    },
    embeddingObsRadius: {
      A: 1,
    },
    embeddingObsRadiusMode: {
      A: 'auto',
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
    embeddingObsSetLabelSize: {
      A: 14,
    },
    embeddingObsSetLabelsVisible: {
      A: false,
    },
    embeddingObsSetPolygonsVisible: {
      A: false,
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
    spatialImageLayer: {
      A: null,
    },
    spatialSegmentationLayer: {
      A: null,
    },
    spatialPointLayer: {
      A: null,
    },
    spatialNeighborhoodLayer: {
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
    additionalObsSets: {
      A: null,
    },
    obsSetColor: {
      A: null,
    },
    obsLabelsType: {
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
          fileType: 'obsSegmentations.cells.json',
          url: 'https://example.com/cells.json',
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          fileType: 'obsLocations.cells.json',
          url: 'https://example.com/cells.json',
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          fileType: 'obsSets.cell-sets.json',
          url: 'https://example.com/cell-sets.json',
          coordinationValues: {
            obsType: 'cell',
          },
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
        spatialImageLayer: 'A',
      },
      h: 2,
      props: {
        description: 'My component description',
      },
      uid: 'A',
      w: 3,
      x: 9,
      y: 0,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        obsType: 'A',
        obsLabelsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        obsColorEncoding: 'A',
        obsFilter: 'A',
        obsHighlight: 'A',
        obsSetHighlight: 'A',
        obsSetSelection: 'A',
        obsSetColor: 'A',
        dataset: 'A',
        embeddingObsOpacity: 'A',
        embeddingObsOpacityMode: 'A',
        embeddingObsRadius: 'A',
        embeddingObsRadiusMode: 'A',
        embeddingRotation: 'A',
        embeddingTargetX: 'A',
        embeddingTargetY: 'A',
        embeddingTargetZ: 'A',
        embeddingType: 't-SNE',
        embeddingZoom: 'A',
        embeddingObsSetLabelSize: 'A',
        embeddingObsSetLabelsVisible: 'A',
        embeddingObsSetPolygonsVisible: 'A',
        featureValueColormap: 'A',
        featureValueColormapRange: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
        additionalObsSets: 'A',
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
      uid: 'B',
      w: 5,
      x: 0,
      y: 2,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        obsType: 'A',
        obsLabelsType: 'A',
        obsColorEncoding: 'A',
        obsFilter: 'A',
        obsHighlight: 'A',
        obsSetHighlight: 'A',
        obsSetSelection: 'A',
        obsSetColor: 'A',
        dataset: 'A',
        featureValueColormap: 'A',
        featureValueColormapRange: 'A',
        featureValueType: 'A',
        featureHighlight: 'A',
        featureSelection: 'A',
        featureType: 'A',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        spatialPointLayer: 'A',
        spatialNeighborhoodLayer: 'A',
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
      uid: 'C',
      w: 4,
      x: 5,
      y: 0,
    },
  ],
};

export const implicitPerDatasetCoordinations: z.infer<typeof configSchema1_0_15> = {
  version: '1.0.15',
  name: 'Per-dataset coordinations',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: {
      A: 'first',
      B: 'second',
    },
    embeddingCellRadius: {
      small: 2,
      big: 20,
    },
    embeddingCellRadiusMode: {
      all: 'manual',
    },
  },
  datasets: [
    {
      files: [],
      name: 'First dataset',
      uid: 'first',
    },
    {
      files: [],
      name: 'Second dataset',
      uid: 'second',
    },
  ],
  layout: [
    {
      component: 'somePluginView',
      coordinationScopes: {
        dataset: ['A', 'B'],
        embeddingCellRadius: { A: 'small', B: 'big' },
        embeddingCellRadiusMode: 'all',
      },
      h: 4,
      w: 5,
      x: 0,
      y: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        embeddingCellRadius: 'small',
        embeddingCellRadiusMode: 'all',
      },
      h: 4,
      w: 5,
      x: 0,
      y: 2,
    },
  ],
};

export const explicitPerDatasetCoordinations: z.infer<typeof configSchema1_0_16> = {
  version: '1.0.16',
  name: 'Per-dataset coordinations',
  description: 'My config description',
  initStrategy: 'auto',
  coordinationSpace: {
    dataset: {
      A: 'first',
      B: 'second',
    },
    embeddingCellRadius: {
      small: 2,
      big: 20,
    },
    embeddingCellRadiusMode: {
      all: 'manual',
    },
  },
  datasets: [
    {
      files: [],
      name: 'First dataset',
      uid: 'first',
    },
    {
      files: [],
      name: 'Second dataset',
      uid: 'second',
    },
  ],
  layout: [
    {
      component: 'somePluginView',
      coordinationScopes: {
        dataset: ['A', 'B'],
        embeddingCellRadiusMode: 'all',
      },
      coordinationScopesBy: {
        dataset: {
          embeddingCellRadius: { A: 'small', B: 'big' },
        },
      },
      h: 4,
      w: 5,
      x: 0,
      y: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        embeddingCellRadius: 'small',
        embeddingCellRadiusMode: 'all',
      },
      h: 4,
      w: 5,
      x: 0,
      y: 2,
    },
  ],
};
