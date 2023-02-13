export const kpmp2023 = {
  version: '1.0.16',
  name: 'KPMP',
  description: 'multi-obsType segmentations',
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
          coordinationValues: {
            image: '18-142_PAS_1of6_bf',
          },
        },
        {
          fileType: 'obsFeatureMatrix.csv',
          url: 'http://localhost:8000/fake_glom_info.csv',
          coordinationValues: {
            obsType: 'Glomeruli',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'obsFeatureMatrix.csv',
          url: 'http://localhost:8000/fake_tub_info.csv',
          coordinationValues: {
            obsType: 'Tubules',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    image: {
      bitmask: '18-142_PAS_1of6',
      rgb: '18-142_PAS_1of6_bf',
    },
    spatialImageLayer: {
      histology: 'histology',
    },
    spatialImageChannel: {
      R: 'R',
      G: 'G',
      B: 'B',
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
    obsColorEncoding: {
      A: 'spatialChannelColor',
    },
    featureType: {
      A: 'feature',
    },
    featureValueType: {
      A: 'value',
    },
    featureSelection: {
      C: null,
      E: null,
    },
    spatialTargetC: {
      // bitmask
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
      F: 5,
      // RGB
      imageR: 0,
      imageG: 1,
      imageB: 2,
    },
    spatialChannelColor: {
      // bitmask
      A: [0xFF, 0xFF, 0xFF],
      B: [0x00, 0x92, 0x92],
      C: [0x24, 0xFF, 0x24],
      D: [0x00, 0x49, 0x49],
      E: [0xFF, 0xFF, 0x6D],
      F: [0xDB, 0x6D, 0x00],
      // RGB
      imageR: [255, 0, 0],
      imageG: [0, 255, 0],
      imageB: [0, 0, 255],
    },
    spatialChannelVisible: {
      imageR: true,
      imageG: true,
      imageB: true,
    },
    spatialLayerVisible: {
      A: false,
      B: true,
      C: true,
      D: true,
      E: true,
      F: true,
      image: true,
    },
    spatialLayerOpacity: {
      // bitmask
      A: 1,
      B: 1,
      C: 1,
      D: 1,
      E: 1,
      F: 1,
      // RGB
      image: 1,
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
        // TODO: treat segmentation layers more like the image layers. add a level for channels,
        // i.e., additional level of coordination. This should make it more clear that the different
        // segmentations are coming from different channels in the image file.
        // Also, a segmentation layer should correspond to a single bitmask file.
        spatialSegmentationLayer: ['ci', 'mi', 'g', 'gsg', 't', 'a'],
        spatialImageLayer: ['histology'],
      },
    },
    metaCoordinationScopesBy: {
      metaA: {
        spatialImageLayer: {
          image: {
            histology: 'rgb',
          },
          spatialImageChannel: {
            histology: ['R', 'G', 'B'],
          },
          spatialLayerVisible: {
            histology: 'image',
          },
          spatialLayerOpacity: {
            histology: 'image',
          },
        },
        spatialImageChannel: {
          spatialTargetC: {
            R: 'imageR',
            G: 'imageG',
            B: 'imageB',
          },
          spatialChannelColor: {
            R: 'imageR',
            G: 'imageG',
            B: 'imageB',
          },
          spatialChannelVisible: {
            R: 'imageR',
            G: 'imageG',
            B: 'imageB',
          },
        },
        spatialSegmentationLayer: {
          image: {
            ci: 'bitmask',
            mi: 'bitmask',
            g: 'bitmask',
            gsg: 'bitmask',
            t: 'bitmask',
            a: 'bitmask',
          },
          obsType: {
            ci: 'A',
            mi: 'B',
            g: 'C',
            gsg: 'D',
            t: 'E',
            a: 'F',
          },
          featureType: {
            g: 'A',
            t: 'A',
          },
          featureValueType: {
            g: 'A',
            t: 'A',
          },
          featureSelection: {
            g: 'C',
            t: 'E',
          },
          spatialTargetC: {
            ci: 'A',
            mi: 'B',
            g: 'C',
            gsg: 'D',
            t: 'E',
            a: 'F',
          },
          obsColorEncoding: {
            ci: 'A',
            mi: 'A',
            g: 'A',
            gsg: 'A',
            t: 'A',
            a: 'A',
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
          spatialChannelColor: {
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
      h: 5,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 'C',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'C',
      },
      props: {
        title: 'Glomerulus Features',
      },
      x: 8,
      y: 5,
      w: 4,
      h: 1,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 'C',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'C',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 8,
      y: 6,
      w: 4,
      h: 2,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 'E',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'E',
      },
      props: {
        title: 'Tubule Features',
      },
      x: 8,
      y: 8,
      w: 4,
      h: 1,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 'E',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'E',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 8,
      y: 9,
      w: 4,
      h: 2,
    },
    {
      component: 'status',
      x: 8,
      y: 11,
      w: 4,
      h: 1,
    },
  ],
};
