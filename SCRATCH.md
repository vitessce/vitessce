Proposal:

Break up 

```js
datasets: [
  {
    uid: "xyz",
    files: [
      {
        dataType: "raster",
        fileType: "raster.ome-tiff",
        options: {
          // TODO: switch from the current value in spatialRasterLayer[].transparentColor:
          // the image file contents OR the options array for an image should define this if it does not use the default.
          transparentColor: [0, 0, 0],
          // TODO: switch from the current value in spatialRasterLayer[].index:
          // for instance, maybe the mapping between spatialRasterLayer identifier and the image data is an index in OME-TIFFs.
          rasterLayerIndex: {
            PAS: 0,
            AF: 1,
          },
        }
      },
      {
        dataType: "raster",
        fileType: "raster.ome-ngff",
        options: {
          // TODO: switch from the current value in spatialRasterLayer[].transparentColor:
          // the image file contents OR the options array for an image should define this if it does not use the default.
          transparentColor: [0, 0, 0],
          // TODO: switch from the current value in spatialRasterLayer[].index:
          // for instance, maybe the mapping between spatialRasterLayer identifier and the image data is a path in OME-NGFFs.
          rasterLayerPath: {
            IMSPosMode: ["ims", "0"],
            IMSNegMode: ["ims", "1"],
          },
          bitmaskLayerPath: {
            cell: ["ims", "cell_segmentations"],
            nucleus: ["ims", "nuclear_segmentations"],
          },
        }
      }
    ]
  }
],
coordinationSpace: {
  obsType: {
    A: 'cell',
    B: 'molecule',
    C: 'nucleus',
  },
  spatialRasterLayer: {
    // TODO: switch from the current object to just a string identifier for each layer:
    // In automatic conversion, take those layer objects with type: "raster"
    PAS: 'PAS', // the image file contents OR the options array for an image should define the mapping between this string value and a particular image in the file (since some image files can contain multiple images).
    AF: 'AF',
    IMSPosMode: 'IMSPosMode',
    IMSNegMode: 'IMSNegMode',
  },
  spatialPointLayer: {
    // TODO: switch from the current object in spatialMoleculesLayer to just a string identifier for each layer:
    molecule: 'molecule',
  },
  spatialSegmentationLayer: {
    // TODO: switch from the current object in spatialRasterLayer to just a string identifier for each layer:
    // In automatic conversion, take those layer objects with type: "bitmask"
    cell: 'cell',
    nucleus: 'nucleus',
  },
  spatialRasterChannel: {
    // TODO: switch from the current object in spatialRasterLayer with "channels" array to just a string identifier for each channel:
    // In automatic conversion, take those layer objects with type: "raster"
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
    // TODO: switch from the current value in spatialRasterLayer[].channels[].selection.c:
    // the image file contents OR the options array for an image should define the mapping if it does not use the default axis key (e.g., "c" for OME-NGFF)
    PAS_A: 0,
    PAS_B: 1,
    ...,
    IMSN_D: 3,
  },
  spatialTargetZ: {
    // TODO: switch from the current value in spatialRasterLayer[].channels[].selection.z:
    // the image file contents OR the options array for an image should define the mapping if it does not use the default axis key (e.g., "z" for OME-NGFF)
    A: 0,
  },
  spatialTargetT: {
    // TODO: switch from the current value in spatialRasterLayer[].channels[].selection.t:
    // the image file contents OR the options array for an image should define the mapping if it does not use the default axis key (e.g., "t" for OME-NGFF)
    A: 0,
  },
  spatialPointRadius: {
    // TODO: switch from the current value in spatialMoleculesLayer[].radius:
    molecule: 5,
  },
  spatialLayerVisible: {
    // TODO: switch from the current values in spatial_____Layer[].visible:
    PAS: true,
    AF: true,
    IMSPosMode: true,
    IMSNegMode: true,
    cell: true,
    nucleus: true,
    molecule: true
  },
  spatialRasterChannelVisible: {
    // TODO: switch from the current value in spatialRasterLayer[].channels[].visible:
    PAS_A: true,
    PAS_B: true,
    ...,
    IMSN_D: true,
  },
  spatialRasterColor: {
    // TODO: switch from the current value in spatialRasterLayer[].channels[].color:
    PAS_A: [255, 0, 0],
    PAS_B: [0, 255, 0],
    ...,
    IMSN_D: [0, 255, 255],
  },
  spatialRasterColormap: {
    // TODO: switch from the current value in spatialRasterLayer[].colormap:
    PAS: null,
    AF: null,
    IMSPosMode: null,
    IMSNegMode: null,
  },
  spatialRasterColormapRangeType: {
    // TODO: switch from the current value in spatialRasterLayer[].domainType:
    PAS: "Min/Max",
    AF: "Min/Max",
    IMSPosMode: "Min/Max",
    IMSNegMode: "Min/Max",
  },
  spatialRasterColormapRange: {
    // TODO: switch from the current value in spatialRasterLayer[].channels[].slider:
    PAS_A: [0, 255],
    PAS_B: [0, 255],
    ...,
    IMSN_D: [1024, 23753],
  },
  spatialRenderingMode: {
    // TODO: switch from the current value in spatialRasterLayer[].use3d:
    A: '2D',
  },
  spatialRasterVolumeRenderingMethod: {
    // TODO: switch from the current value in spatialRasterLayer[].renderingMode:
    A: 'Additive',
  },
  spatialLayerOpacity: {
    // TODO: switch from the current value in spatial_____Layer[].opacity:
    PAS: 1,
    AF: 1,
    IMSPosMode: 1,
    IMSNegMode: 1,
    cell: 1,
    nucleus: 1,
    molecule: 1,
  },
  spatialModelMatrix: {
    IMS: [20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  },
},
layout: [
  {
    component: 'spatial',
    coordinationScopes: {
      // TODO: ensure that any coordinationScope value here that is an arrays has a key that is valid for coordinationScopesBy:
      // - dataset
      // - spatialRasterLayer
      // - spatialBitmaskLayer
      // - spatialPointLayer
      // - spatialRasterChannel
      dataset: 'A',
      spatialTargetX: 'A',
      spatialTargetY: 'A',
      spatialTargetT: 'A', // TODO: implement global T slider (move out of per-layer)
      spatialTargetZ: 'A', // TODO: implement global Z slider (move out of per-layer)
      spatialRenderingMode: 'A',  // if 3D, then will _currently_ render the first raster layer that has spatialLayerVisible: true.
      spatialRasterVolumeRenderingMethod: 'A',
      // TODO: ensure that the ordering of the spatialRasterLayer array
      spatialRasterLayer: ['PAS', 'AF', 'IMSPosMode', 'IMSNegMode'], // the ordering here will also dictate the render ordering
      spatialSegmentationLayer: ['cell', 'nucleus'], // the ordering here will also dictate the render ordering
      spatialPointLayer: ['molecule'],
    },
    coordinationScopesBy: {
      // TODO: need to check that all keys are coordination types that are valid for coordinationScopesBy OR a plugin coordination type:
      // one of:
      // - dataset
      // - spatialRasterLayer
      // - spatialBitmaskLayer
      // - spatialPointLayer
      // - spatialRasterChannel
      dataset: { },
      spatialRasterLayer: {
        // TODO: need to check that all keys of the value objects are valid spatialRasterLayer coordination values.
        // TODO: need to check that all keys are coordination types that are valid for per-spatialRasterLayer coordination OR a plugin coordination type:
        // one of:
        // - spatialLayerVisible
        // - spatialRasterColormap
        // - spatialRasterColormapRangeType
        // - spatialLayerOpacity
        // - spatialRasterChannel
        spatialLayerVisible: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialRasterColormap: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialRasterColormapRangeType: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialLayerOpacity: { PAS: 'PAS', AF: 'AF', IMSPosMode: 'IMSPosMode', IMSNegMode: 'IMSNegMode' },
        spatialRasterChannel: {
          PAS: ['PAS_A', 'PAS_B', 'PAS_C', 'PAS_D'],
          AF: ['AF_A', 'AF_B', 'AF_C', 'AF_D'],
          IMSPosMode: ['IMFP_A', 'IMFP_B', 'IMFP_C', 'IMFP_D'],
          IMSNegMode: ['IMFN_A', 'IMFN_B', 'IMFN_C', 'IMFN_D'],
        },
        spatialModelMatrix: {
          IMSPosMode: 'IMS',
          IMSNegMode: 'IMS',
        }
      },
      spatialSegmentationLayer: {
        // TODO: need to check that all keys of the objects are valid spatialBitmaskLayer coordination values.
        // TODO: need to check that all coordination types are valid for per-spatialBitmaskLayer coordination:
        // one of:
        // - obsType
        // - spatialLayerVisible
        // - spatialLayerOpacity
        // - spatialRasterColormapRangeType
        // - spatialLayerOpacity
        // - spatialRasterChannel
        obsType: {
          cell: 'A',
          nucleus: 'C',
        },
        spatialLayerVisible: { cell: 'cell', nucleus: 'nucleus' },
        spatialLayerOpacity: { cell: 'cell', nucleus: 'nucleus' },
      },
      spatialPointLayer: {
        // TODO: need to check that all keys of the objects are valid spatialPointLayer coordination values.
        // TODO: need to check that all coordination types are valid for per-spatialPointLayer coordination:
        // one of:
        // - obsType
        // - spatialPointRadius
        // - spatialLayerVisible
        // - spatialLayerOpacity
        obsType: {
          molecule: 'B',
        },
        spatialPointRadius: { molecule: 'molecule' },
        spatialLayerVisible: { molecule: 'molecule' },
        spatialLayerOpacity: { molecule: 'molecule' },
      },
      spatialRasterChannel: {
        // TODO: need to check that all keys of the objects are valid spatialRasterChannel coordination values.
        // TODO: need to check that all coordination types are valid for per-spatialRasterChannel coordination:
        // one of:
        // - spatialTargetC
        // - spatialRasterChannelVisible
        // - spatialRasterColor
        // - spatialRasterColormapRange
        spatialTargetC: {
          PAS_A: 'PAS_A', PAS_B: 'PAS_B', PAS_C: 'PAS_C', PAS_D: 'PAS_D',
          AF_A: 'AF_A', AF_B: 'AF_B', ...
        },
        spatialRasterChannelVisible: {
          PAS_A: 'PAS_A', PAS_B: 'PAS_B', PAS_C: 'PAS_C', PAS_D: 'PAS_D',
          AF_A: 'AF_A', AF_B: 'AF_B', ...
        },
        spatialRasterColor: {
          PAS_A: 'PAS_A', PAS_B: 'PAS_B', PAS_C: 'PAS_C', PAS_D: 'PAS_D',
          AF_A: 'AF_A', AF_B: 'AF_B', ...
        },
        spatialRasterColormapRange: {
          PAS_A: 'PAS_A', PAS_B: 'PAS_B', PAS_C: 'PAS_C', PAS_D: 'PAS_D',
          AF_A: 'AF_A', AF_B: 'AF_B', ...
        },
      },
    },
  }
]
```