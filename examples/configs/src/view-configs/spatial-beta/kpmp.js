/* eslint-disable no-unused-vars */

// Serve kpmp/OME-TIFF folder
const localBaseUrl = 'http://localhost:8000';
const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023';

export const kpmp2023 = {
  version: '1.0.16',
  name: 'Multi-obsType segmentations',
  description: 'Segmentations of functional tissue units in the kidney with associated quantitative features',
  datasets: [
    {
      uid: 'S-1905-017737',
      name: 'S-1905-017737',
      files: [
        {
          fileType: 'obsSegmentations.ome-tiff',
          url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.ome.tif`,
          options: {
            offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2.offsets.json`,
          },
          coordinationValues: {
            fileUid: 'S-1905-017737',
          },
        },
        {
          fileType: 'image.ome-tiff',
          url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.ome.tif`,
          options: {
            offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.offsets.json`,
          },
          coordinationValues: {
            fileUid: 'S-1905-017737_bf',
          },
        },
        {
          fileType: 'obsFeatureMatrix.anndata.zarr',
          url: `${baseUrl}/S-1905-017737/Cortical Interstitium.adata.zarr`,
          options: {
            path: 'X',
          },
          coordinationValues: {
            obsType: 'Cortical Interstitia',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'obsFeatureMatrix.anndata.zarr',
          url: `${baseUrl}/S-1905-017737/Glomeruli.adata.zarr`,
          options: {
            path: 'X',
          },
          coordinationValues: {
            obsType: 'Non-Globally Sclerotic Glomeruli',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'obsFeatureMatrix.anndata.zarr',
          url: `${baseUrl}/S-1905-017737/Globally Sclerotic Glomeruli.adata.zarr`,
          options: {
            path: 'X',
          },
          coordinationValues: {
            obsType: 'Globally Sclerotic Glomeruli',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'obsFeatureMatrix.anndata.zarr',
          url: `${baseUrl}/S-1905-017737/Tubules with Area non infinity.adata.zarr`,
          options: {
            path: 'X',
          },
          coordinationValues: {
            obsType: 'Tubules',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'obsFeatureMatrix.anndata.zarr',
          url: `${baseUrl}/S-1905-017737/IFTA.adata.zarr`,
          options: {
            path: 'X',
          },
          coordinationValues: {
            obsType: 'Interstitial Fibrosis and Tubular Atrophy',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'obsFeatureMatrix.anndata.zarr',
          url: `${baseUrl}/S-1905-017737/Peritubular Capillaries renamed.adata.zarr`,
          options: {
            path: 'X',
          },
          coordinationValues: {
            obsType: 'Peritubular Capillaries',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    fileUid: {
      bitmask: 'S-1905-017737',
      rgb: 'S-1905-017737_bf',
    },
    imageLayer: {
      histology: 'histology',
    },
    imageChannel: {
      R: 'R',
      G: 'G',
      B: 'B',
    },
    segmentationLayer: {
      ml: 'ml',
    },
    segmentationChannel: {
      ci: 'ci',
      ngsg: 'ngsg',
      gsg: 'gsg',
      t: 't',
      a: 'a',
      ifta: 'ifta',
      ptc: 'ptc',
    },
    obsType: {
      ci: 'Cortical Interstitia',
      ngsg: 'Non-Globally Sclerotic Glomeruli',
      gsg: 'Globally Sclerotic Glomeruli',
      t: 'Tubules',
      a: 'Arteries/Arterioles',
      ifta: 'Interstitial Fibrosis and Tubular Atrophy',
      ptc: 'Peritubular Capillaries',
    },
    obsColorEncoding: {
      ci: 'spatialChannelColor',
      ngsg: 'spatialChannelColor',
      gsg: 'spatialChannelColor',
      t: 'spatialChannelColor',
      a: 'spatialChannelColor',
      ifta: 'spatialChannelColor',
      ptc: 'spatialChannelColor',
    },
    featureValueColormap: {
      ci: 'plasma',
      ngsg: 'plasma',
      gsg: 'plasma',
      t: 'plasma',
      a: 'plasma',
      ifta: 'plasma',
      ptc: 'plasma',
    },
    featureValueColormapRange: {
      ci: [0.0, 1.0],
      ngsg: [0.0, 1 - (59451 - 29911) / (59451 - 3077)],
      gsg: [(3077 - 2333) / (29911 - 2333), 1.0],
      t: [0.0, 0.3],
      a: [0.0, 1.0],
      ifta: [0.0, 1.0],
      ptc: [0.0, 0.2],
    },
    featureType: {
      global: 'feature',
    },
    featureValueType: {
      global: 'value',
    },
    featureSelection: {
      ci: null,
      ngsg: null,
      gsg: null,
      t: null,
      a: null,
      ifta: null,
      ptc: null,
    },
    spatialTargetC: {
      // bitmask
      ci: 0,
      ngsg: 1,
      gsg: 2,
      t: 3,
      a: 4,
      ifta: 5,
      ptc: 6,
      // RGB
      imageR: 0,
      imageG: 1,
      imageB: 2,
    },
    spatialChannelColor: {
      // bitmask
      ci: [0xFF, 0xFF, 0xFF],
      ngsg: [0x5b, 0xb5, 0xe7],
      gsg: [0x10, 0x73, 0xb0],
      t: [0x16, 0x9D, 0x74],
      a: [0xEF, 0xE2, 0x52],
      ifta: [0xE4, 0x9E, 0x25],
      ptc: [0xD3, 0x5E, 0x1A],
      // RGB
      imageR: [255, 0, 0],
      imageG: [0, 255, 0],
      imageB: [0, 0, 255],
    },
    spatialChannelVisible: {
      // bitmask
      ci: false,
      ngsg: false,
      gsg: false,
      t: true,
      a: false,
      ifta: false,
      ptc: false,
      // RGB
      imageR: true,
      imageG: true,
      imageB: true,
    },
    spatialLayerVisible: {
      image: true,
      bitmask: true,
    },
    spatialChannelOpacity: {
      // bitmask
      ci: 1,
      ngsg: 1,
      gsg: 1,
      t: 1,
      a: 1,
      ifta: 1,
      ptc: 1,
      // RGB
      imageR: 1,
      imageG: 1,
      imageB: 1,
    },
    spatialLayerOpacity: {
      // RGB
      image: 1,
      bitmask: 1,
    },
    spatialSegmentationFilled: {
      ci: true,
      ngsg: true,
      gsg: true,
      t: true,
      a: true,
      ifta: true,
      ptc: true,
    },
    spatialSegmentationStrokeWidth: {
      ci: 1,
      ngsg: 1,
      gsg: 1,
      t: 1,
      a: 1,
      ifta: 1,
      ptc: 1,
    },
    obsHighlight: {
      ci: null,
      ngsg: null,
      gsg: null,
      t: null,
      a: null,
      ifta: null,
      ptc: null,
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
    photometricInterpretation: {
      rgb: 'RGB',
      multiChannel: 'RGB',
    },
    spatialChannelWindow: {
      imageR: [0, 255],
      imageG: [0, 255],
      imageB: [0, 255],
    },
    metaCoordinationScopes: {
      metaA: {
        obsType: ['ci', 'ngsg', 'gsg', 't', 'a', 'ifta', 'ptc'],
        // TODO: treat segmentation layers more like the image layers. add a level for channels,
        // i.e., additional level of coordination. This should make it more clear that the different
        // segmentations are coming from different channels in the image file.
        // Also, a segmentation layer should correspond to a single bitmask file.
        segmentationLayer: ['ml'],
        imageLayer: ['histology'],
      },
    },
    metaCoordinationScopesBy: {
      metaA: {
        imageLayer: {
          fileUid: {
            histology: 'rgb',
          },
          imageChannel: {
            histology: ['R', 'G', 'B'],
          },
          spatialLayerVisible: {
            histology: 'image',
          },
          spatialLayerOpacity: {
            histology: 'image',
          },
          photometricInterpretation: {
            histology: 'multiChannel', // alternatively: 'multiChannel'
          },
        },
        imageChannel: {
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
          spatialChannelOpacity: { // TODO: implement
            R: 'imageR',
            G: 'imageG',
            B: 'imageB',
          },
          spatialChannelWindow: {
            R: 'imageR',
            G: 'imageG',
            B: 'imageB',
          },
        },
        segmentationLayer: {
          fileUid: {
            ml: 'bitmask',
          },
          segmentationChannel: {
            ml: ['ci', 'ngsg', 'gsg', 't', 'a', 'ifta', 'ptc'],
          },
          spatialLayerVisible: {
            ml: 'bitmask',
          },
          spatialLayerOpacity: {
            ml: 'bitmask',
          },
        },
        segmentationChannel: {
          obsType: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          featureType: {
            ci: 'global',
            ngsg: 'global',
            gsg: 'global',
            t: 'global',
            a: 'global',
            ifta: 'global',
            ptc: 'global',
          },
          featureValueType: {
            ci: 'global',
            ngsg: 'global',
            gsg: 'global',
            t: 'global',
            a: 'global',
            ifta: 'global',
            ptc: 'global',
          },
          featureSelection: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialTargetC: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          obsColorEncoding: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          featureValueColormap: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          featureValueColormapRange: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialChannelVisible: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialChannelOpacity: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialChannelColor: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialSegmentationFilled: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialSegmentationStrokeWidth: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          obsHighlight: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
        },
      },
    },
  },
  layout: [
    {
      component: 'spatialBeta',
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
      h: 8,
    },
    {
      component: 'layerControllerBeta',
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
      h: 12,
    },
    // Tubules
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 't',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 't',
        obsColorEncoding: 't',
      },
      props: {
        title: 'Tubules',
      },
      x: 4,
      y: 8,
      w: 2,
      h: 2,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 't',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 't',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 4,
      y: 10,
      w: 2,
      h: 2,
    },
    // Glomerulus
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 'ngsg',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ngsg',
        obsColorEncoding: 'ngsg',
      },
      props: {
        title: 'Non-Globally Sclerotic Glomeruli',
      },
      x: 0,
      y: 8,
      w: 2,
      h: 2,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 'ngsg',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ngsg',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 0,
      y: 10,
      w: 2,
      h: 2,
    },
    // GSG
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 'gsg',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'gsg',
        obsColorEncoding: 'gsg',
      },
      props: {
        title: 'Globally Sclerotic Glomeruli',
      },
      x: 2,
      y: 8,
      w: 2,
      h: 2,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 'gsg',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'gsg',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 2,
      y: 10,
      w: 2,
      h: 2,
    },
    // PTC
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 'ptc',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ptc',
        obsColorEncoding: 'ptc',
      },
      props: {
        omitFeatures: ['PTC in Cortex', 'PTC in IFTA'],
        title: 'Peritubular Capillaries',
      },
      x: 6,
      y: 8,
      w: 2,
      h: 2,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 'ptc',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ptc',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 6,
      y: 10,
      w: 2,
      h: 2,
    },
  ],
};
