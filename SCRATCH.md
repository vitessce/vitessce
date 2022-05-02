currently:
```js
coordinationSpace: {
  spatialRasterLayers: {
    A: []
  }
},
layout: [
  {
    component: 'spatial',
    coordinationScopes: {
      spatialRasterLayers: 'A',
    }
  }
]
```

proposal:

```js
coordinationSpace: {
  obsType: {
    A: 'cell',
    B: 'molecule',
    C: 'nucleus',
  },
  spatialRasterLayer: {
    PAS: 'PAS', // the image file contents OR the options array for an image should define the mapping between this string value and a particular image in the file (since some image files can contain multiple images).
    AF: 'AF',
    IMSPosMode: 'IMSPosMode',
    IMSNegMode: 'IMSNegMode',
  },
  spatialPointLayer: {
    molecule: 'molecule',
  },
  spatialBitmaskLayer: {
    cell: 'cell',
    nucleus: 'nucleus',
  },
  spatialRasterChannel: {
    PAS_A: 'PAS_A',
    PAS_B: 'PAS_B',
    ...,
    IMSN_D: 'IMSN_D',
  },
  spatialTargetX: {
    ...
  },
  spatialTargetY: {
    ...
  },
  spatialTargetC: {
    PAS_A: 0,
    PAS_B: 1,
    ...,
    IMSN_D: 3,
  },
  spatialTargetZ: {
    PAS: 0,
    AF: 0,
    IMSPosMode: 0,
    IMSNegMode: 0,
  },
  spatialTargetT: {
    PAS: 0,
    AF: 0,
    IMSPosMode: 0,
    IMSNegMode: 0,
  },
  spatialPointRadius: {
    molecule: 5,
  },
  spatialLayerVisible: {
    PAS: true,
    AF: true,
    IMSPosMode: true,
    IMSNegMode: true,
    cell: true,
    nucleus: true,
    molecule: true
  },
  spatialChannelVisible: {
    PAS_A: true,
    PAS_B: true,
    ...,
    IMSN_D: true,
  },
  spatialRasterLayerColormap: {
    PAS: null,
    AF: null,
    IMSPosMode: null,
    IMSNegMode: null,
  },
  spatialRasterTransparentColor: {
    PAS: null,
    AF: null,
    IMSPosMode: null,
    IMSNegMode: null,
  },
  spatialRasterColormapRangeType: {
    PAS: "Min/Max",
    AF: "Min/Max",
    IMSPosMode: "Min/Max",
    IMSNegMode: "Min/Max",
  },
  spatialRasterColormapRange: {
    PAS_A: [0, 255],
    PAS_B: [0, 255],
    ...,
    IMSN_D: [1024, 23753],
  },
  spatialRenderingMode: {
    A: '2D',
  },
  spatialRasterVolumeRenderingMethod: {
    A: 'Additive',
  },
  spatialLayerOpacity: {
    PAS: 1,
    AF: 1,
    IMSPosMode: 1,
    IMSNegMode: 1,
    cell: 1,
    nucleus: 1,
    molecule: 1,
  }
},
layout: [
  {
    component: 'spatial',
    coordinationScopes: {
      dataset: 'A',
      spatialTargetX: 'A',
      spatialTargetY: 'A',
      spatialRenderingMode: 'A',  // if 3D, then will _currently_ render the first raster layer that has spatialLayerVisible: true.
      spatialRasterVolumeRenderingMethod: 'A',
      spatialRasterLayer: ['PAS', 'AF', 'IMSPosMode', 'IMSNegMode'], // the ordering here will also dictate the render ordering
      spatialBitmaskLayer: ['cell', 'nucleus'], // the ordering here will also dictate the render ordering
      spatialPointLayer: ['molecule'],
    },
    coordinationScopesBy: {
      dataset: { },
      spatialRasterLayer: {
        spatialLayerVisible: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialRasterLayerColormap: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialRasterTransparentColor: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialRasterColormapRangeType: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialLayerOpacity: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialRasterChannel: {
          PAS: ['PAS_A', 'PAS_B', 'PAS_C', 'PAS_D'],
          AF: ['AF_A', 'AF_B', 'AF_C', 'AF_D'],
          IMSPosMode: ['IMFP_A', 'IMFP_B', 'IMFP_C', 'IMFP_D'],
          IMSNegMode: ['IMFN_A', 'IMFN_B', 'IMFN_C', 'IMFN_D'],
        },
      },
      spatialBitmaskLayer: {
        obsType: {
          cell: 'A',
          nucleus: 'C',
        },
        spatialLayerVisible: { cell: 'cell', nucleus: 'nucleus' },
        spatialLayerOpacity: { cell: 'cell', nucleus: 'nucleus' },
      },
      spatialPointLayer: {
        obsType: {
          molecule: 'B',
        },
        spatialPointRadius: { molecule: 'molecule' },
        spatialLayerVisible: { molecule: 'molecule' },
        spatialLayerOpacity: { molecule: 'molecule' },
      },
      spatialRasterChannel: {
        spatialTargetC: {
          PAS_A: 'PAS_A', PAS_B: 'PAS_B', PAS_C: 'PAS_C', PAS_D: 'PAS_D',
          AF_A: 'AF_A', AF_B: 'AF_B', ...
        },
        spatialTargetZ: {
          PAS_A: 'PAS', PAS_B: 'PAS', PAS_C: 'PAS', PAS_D: 'PAS',
          AF_A: 'AF', AF_B: 'AF', ...
        },
        spatialTargetT: {
          PAS_A: 'PAS', PAS_B: 'PAS', PAS_C: 'PAS', PAS_D: 'PAS',
          AF_A: 'AF', AF_B: 'AF', ...
        },
        spatialChannelVisible: {
          PAS_A: 'PAS_A', PAS_B: 'PAS_B', PAS_C: 'PAS_C', PAS_D: 'PAS_D',
          AF_A: 'AF_A', AF_B: 'AF_B', ...
        },
      },
    },
  }
]
```