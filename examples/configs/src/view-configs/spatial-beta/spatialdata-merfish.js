import {
    VitessceConfig,
    hconcat,
    CoordinationLevel as CL,
    getInitialCoordinationScopePrefix,
} from '@vitessce/config';

const sdataUrl = "https://data-2.vitessce.io/data/moffitt/merfish_mouse_ileum.sdata.zarr";

function generateMerfishConfig() {
  const vc = new VitessceConfig({
    schemaVersion: "1.0.18",
    name: 'SpatialData with MERFISH data',
  });

  const onlyPoints = false;

  let dataset = vc.addDataset('My dataset');
  if (!onlyPoints) {
    dataset = dataset.addFile({
        fileType: 'spatialdata.zarr',
        url: sdataUrl,
        options: {
          image: {
            path: 'images/stains',
          },
          coordinateSystem: 'global',
        },
        coordinationValues: {
          fileUid: "stains"
        },
    }).addFile({
      fileType: 'spatialdata.zarr',
      url: sdataUrl,
      options: {
        obsSegmentations: {
          path: 'labels/dapi_labels',
        },
        coordinateSystem: 'global',
      },
      coordinationValues: {
        obsType: "nucleus",
        fileUid: "dapi"
      }
    }).addFile({
      fileType: 'spatialdata.zarr',
      url: sdataUrl,
      options: {
        obsSegmentations: {
          path: 'labels/membrane_labels',
        },
        coordinateSystem: 'global',
      },
      coordinationValues: {
        obsType: "cell",
        fileUid: "membrane"
      },
    })
  }

  dataset = dataset.addFile({
    fileType: 'spatialdata.zarr',
    url: sdataUrl,
    options: {
      obsPoints: {
        path: 'points/molecules',
      },
      coordinateSystem: 'global',
    },
    coordinationValues: {
      obsType: "point",
    },
  });
  

  const spatialView = vc.addView(dataset, "spatialBeta");
  const lcView = vc.addView(dataset, "layerControllerBeta");

  if(!onlyPoints) {
    vc.linkViewsByObject([spatialView, lcView], {
      imageLayer: CL([
        {
          fileUid: "stains",
          photometricInterpretation: 'BlackIsZero',
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          imageChannel: CL([
            {
              spatialChannelVisible: true,
              spatialTargetC: 0, // DAPI, Nucleus
              spatialChannelColor: [0, 0, 255],
              spatialChannelOpacity: 1.0
            },
            {
              spatialChannelVisible: true,
              spatialTargetC: 1, // Membrane, Cell
              spatialChannelColor: [255, 255, 255],
              spatialChannelOpacity: 1.0
            }
          ])
        }
      ])
    }, { scopePrefix: getInitialCoordinationScopePrefix("A", "image") });

    vc.linkViewsByObject([spatialView, lcView], {
      segmentationLayer: CL([
        {
          fileUid: "membrane",
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          segmentationChannel: CL([
            {
              spatialChannelVisible: true,
              obsType: 'cell',
              spatialChannelColor: [200, 200, 200],
              obsColorEncoding: "spatialChannelColor"
            }
          ])
        },
        {
          fileUid: "dapi",
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          segmentationChannel: CL([
            {
              spatialChannelVisible: true,
              obsType: 'nucleus',
              spatialChannelColor: [255, 255, 255],
              obsColorEncoding: "spatialChannelColor"
            }
          ])
        }
      ])
    }, { scopePrefix: getInitialCoordinationScopePrefix("A", "obsSegmentations") });
  }


  vc.linkViewsByObject([spatialView, lcView], {
      pointLayer: CL([
        {
          obsType: 'point',
        }
      ])
    }, { scopePrefix: getInitialCoordinationScopePrefix("A", "obsPoints") });


  vc.layout(hconcat(spatialView, lcView));
  const configJSON = vc.toJSON();
  return configJSON;
}

export const sdataMerfishConfig = generateMerfishConfig();