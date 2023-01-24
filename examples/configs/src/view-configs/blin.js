

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
            obsType: 'glomerulus',
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
      glomerulus: 'glomerulus',
      tubule: 'tubule',
    },
    obsType: {
      A: 'glomerulus',
      B: 'tubule',
    },
    spatialTargetC: {
      A: 2,
      B: 4,
    },
    spatialLayerVisible: {
      A: true,
      B: true,
    },
    spatialLayerOpacity: {
      A: 1,
      B: 1,
    },
    spatialChannelColor: {
      A: [255, 0, 0],
      B: [0, 0, 255],
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
        obsType: ['A', 'B'],
        spatialSegmentationLayer: ['glomerulus', 'tubule'],
      },
    },
    metaCoordinationScopesBy: {
      metaA: {
        spatialSegmentationLayer: {
          image: {
            glomerulus: 'A',
            tubule: 'A',
          },
          obsType: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialTargetC: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialLayerVisible: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialLayerOpacity: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialChannelColor: {
            glomerulus: 'A',
            tubule: 'B',
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
        obsType: ['A', 'B'],
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
        spatialSegmentationLayer: ['glomerulus', 'tubule'],
      },
      coordinationScopesBy: {
        spatialSegmentationLayer: {
          image: {
            glomerulus: 'A',
            tubule: 'A',
          },
          obsType: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialTargetC: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialLayerVisible: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialLayerOpacity: {
            glomerulus: 'A',
            tubule: 'B',
          },
          spatialChannelColor: {
            glomerulus: 'A',
            tubule: 'B',
          },
        },
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
