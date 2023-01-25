

const blinName = 'Blin et al., PLoS Biol 2019';
const blinDescription = '18-142_PAS_1of6.ome.tif';
export const blin2019 = {
  version: '1.0.16',
  name: blinName,
  description: blinDescription,
  datasets: [
    {
      uid: 'idr0062-blin-nuclearsegmentation/6001240',
      name: 'idr0062-blin-nuclearsegmentation/6001240',
      files: [
        {
          fileType: 'obsSegmentations.ome-tiff',
          url: 'http://localhost:8000/18-142_PAS_1of6.pyramid.ome.tif',
          options: {
            offsetsUrl: 'http://localhost:8000/18-142_PAS_1of6.pyramid.offsets.json',
          },
          coordinationValues: {
            image: '18-142_PAS_1of6',
          },
        },
        {
          fileType: 'image.ome-tiff',
          url: 'http://localhost:8000/18-142_PAS_1of6_bf.ome.tif',
          options: {
            offsetsUrl: 'http://localhost:8000/18-142_PAS_1of6_bf.offsets.json',
          },
          coordinationValues: {},
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    image: {
      A: '18-142_PAS_1of6',
    },
    spatialSegmentationLayer: {
      ci: 'ci',
      mi: 'mi',
      g: 'g',
      gsg: 'gsg',
      t: 't',
      a: 'a',
    },
    obsType: {
      A: 'Cortical Interstitia',
      B: 'Medullary Interstitia',
      C: 'Glomeruli',
      D: 'Globally Sclerotic Glomeruli',
      E: 'Tubules',
      F: 'Arteries/Arterioles',
    },
    spatialTargetC: {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
      F: 5,
    },
    spatialLayerVisible: {
      A: false,
      B: true,
      C: true,
      D: true,
      E: true,
      F: true,
    },
    spatialLayerOpacity: {
      A: 1,
      B: 1,
      C: 1,
      D: 1,
      E: 1,
      F: 1,
    },
    spatialLayerColor: {
      A: [0xFF, 0xFF, 0xFF],
      B: [0x00, 0x92, 0x92],
      C: [0x24, 0xFF, 0x24],
      D: [0x00, 0x49, 0x49],
      E: [0xFF, 0xFF, 0x6D],
      F: [0xDB, 0x6D, 0x00],
    },
    spatialLayerFilled: {
      A: false,
      B: true,
    },
    spatialLayerStrokeWidth: {
      A: 1,
      B: 1,
      C: 1,
      D: 1,
      E: 1,
      F: 1,
    },
    spatialTargetX: {
      A: 19375.01239458,
    },
    spatialTargetY: {
      A: 18524.67196937,
    },
    spatialZoom: {
      A: -4.60703913795,
    },
    metaCoordinationScopes: {
      metaA: {
        obsType: ['A', 'B', 'C', 'D', 'E', 'F'],
        spatialSegmentationLayer: ['ci', 'mi', 'g', 'gsg', 't', 'a'],
      },
    },
    metaCoordinationScopesBy: {
      metaA: {
        spatialSegmentationLayer: {
          image: {
            ci: 'A',
            mi: 'A',
            g: 'A',
            gsg: 'A',
            t: 'A',
            a: 'A',
          },
          obsType: {
            ci: 'A',
            mi: 'B',
            g: 'C',
            gsg: 'D',
            t: 'E',
            a: 'F',
          },
          spatialTargetC: {
            ci: 'A',
            mi: 'B',
            g: 'C',
            gsg: 'D',
            t: 'E',
            a: 'F',
          },
          spatialLayerVisible: {
            ci: 'A',
            mi: 'B',
            g: 'C',
            gsg: 'D',
            t: 'E',
            a: 'F',
          },
          spatialLayerOpacity: {
            ci: 'A',
            mi: 'B',
            g: 'C',
            gsg: 'D',
            t: 'E',
            a: 'F',
          },
          spatialLayerColor: {
            ci: 'A',
            mi: 'B',
            g: 'C',
            gsg: 'D',
            t: 'E',
            a: 'F',
          },
          spatialLayerFilled: {
            ci: 'B',
            mi: 'A',
            g: 'A',
            gsg: 'A',
            t: 'A',
            a: 'A',
          },
          spatialLayerStrokeWidth: {
            ci: 'A',
            mi: 'A',
            g: 'A',
            gsg: 'A',
            t: 'A',
            a: 'A',
          },
        },
      },
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        metaCoordinationScopes: ['metaA'],
        metaCoordinationScopesBy: ['metaA'],
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
      },
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'layerController',
      props: {
        disableChannelsIfRgbDetected: true,
      },
      coordinationScopes: {
        metaCoordinationScopes: ['metaA'],
        metaCoordinationScopesBy: ['metaA'],
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
      },
      x: 8,
      y: 0,
      w: 4,
      h: 6,
    },
    {
      component: 'status',
      x: 8,
      y: 9,
      w: 4,
      h: 3,
    },
  ],
};
