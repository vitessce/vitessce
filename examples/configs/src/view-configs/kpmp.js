// Serve kpmp/OME-TIFF folder

//const baseUrl = 'http://localhost:8000';
const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023';

export const kpmp2023 = {
  version: '1.0.16',
  name: 'KPMP',
  description: 'multi-obsType segmentations',
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
            image: 'S-1905-017737',
          },
        },
        {
          fileType: 'image.ome-tiff',
          url: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.ome.tif`,
          options: {
            offsetsUrl: `${baseUrl}/S-1905-017737/S-1905-017737_PAS_2of2_bf.offsets.json`,
          },
          coordinationValues: {
            image: 'S-1905-017737_bf',
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
          url: `${baseUrl}/S-1905-017737/Tubules.adata.zarr`,
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
          url: `${baseUrl}/S-1905-017737/Peritubular Capillaries.adata.zarr`,
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
    image: {
      bitmask: 'S-1905-017737',
      rgb: 'S-1905-017737_bf',
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
      ngsg: [0.0, 1.0],
      gsg: [0.0, 1.0],
      t: [0.0, 1.0],
      a: [0.0, 1.0],
      ifta: [0.0, 1.0],
      ptc: [0.0, 1.0],
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
      imageR: true,
      imageG: true,
      imageB: true,
    },
    spatialLayerVisible: {
      // bitmask
      ci: false,
      ngsg: true,
      gsg: true,
      t: true,
      a: true,
      ifta: true,
      ptc: true,
      // RGB
      image: true,
    },
    spatialLayerOpacity: {
      // bitmask
      ci: 1,
      ngsg: 1,
      gsg: 1,
      t: 1,
      a: 1,
      ifta: 1,
      ptc: 1,
      // RGB
      image: 1,
    },
    spatialLayerFilled: {
      ci: true,
      ngsg: true,
      gsg: true,
      t: true,
      a: true,
      ifta: true,
      ptc: true,
    },
    spatialLayerStrokeWidth: {
      ci: 1,
      ngsg: 1,
      gsg: 1,
      t: 1,
      a: 1,
      ifta: 1,
      ptc: 1,
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
        obsType: ['ci', 'ngsg', 'gsg', 't', 'a', 'ifta', 'ptc'],
        // TODO: treat segmentation layers more like the image layers. add a level for channels,
        // i.e., additional level of coordination. This should make it more clear that the different
        // segmentations are coming from different channels in the image file.
        // Also, a segmentation layer should correspond to a single bitmask file.
        spatialSegmentationLayer: ['ci', 'ngsg', 'gsg', 't', 'a', 'ifta', 'ptc'],
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
            ngsg: 'bitmask',
            gsg: 'bitmask',
            t: 'bitmask',
            a: 'bitmask',
            ifta: 'bitmask',
            ptc: 'bitmask',
          },
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
          spatialLayerVisible: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialLayerOpacity: {
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
          spatialLayerFilled: {
            ci: 'ci',
            ngsg: 'ngsg',
            gsg: 'gsg',
            t: 't',
            a: 'a',
            ifta: 'ifta',
            ptc: 'ptc',
          },
          spatialLayerStrokeWidth: {
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
      h: 8,
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
      h: 8,
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
    // Cortical interstitia
    /*{
      component: 'featureList',
      coordinationScopes: {
        obsType: 'ci',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ci',
        obsColorEncoding: 'ci',
      },
      x: 0,
      y: 8,
      w: 3,
      h: 2,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 'ci',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ci',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 0,
      y: 8,
      w: 3,
      h: 2,
    },
    // IFTA
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 'ifta',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ifta',
        obsColorEncoding: 'ifta',
      },
      x: 3,
      y: 8,
      w: 3,
      h: 2,
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        obsType: 'ifta',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ifta',
      },
      props: {
        aggregateFeatureValues: false,
      },
      x: 3,
      y: 8,
      w: 3,
      h: 2,
    },*/
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
    // Violin plots
    {
      component: 'stratifiedFeatureValueDistribution',
      coordinationScopes: {
        obsType: 'ptc',
        featureType: 'global',
        featureValueType: 'global',
        featureSelection: 'ptc',
      },
      props: {
        // Feature columns to use for filtering and grouping,
        filterBy: 'PTC in Cortex',
        groupBy: 'PTC in IFTA',
      },
      x: 8,
      y: 8,
      w: 2,
      h: 4,
    },
    {
      component: 'obsDensity',
      coordinationScopes: {
        obsType: ['ptc', 'ci', 'ifta'],
        featureType: 'global',
        featureValueType: 'global',
      },
      x: 10,
      y: 8,
      w: 2,
      h: 4,
    },
    // Status
    /*{
      component: 'status',
      x: 12,
      y: 12,
      w: 1,
      h: 1,
    },*/
  ],
};
