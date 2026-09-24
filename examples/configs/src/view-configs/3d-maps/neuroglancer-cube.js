/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateCubeCameraSyncConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Cube camera sync',
  });

  const dataset = config.addDataset('Test cube').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/sorger/test-dataset-cube/test_cube.ome.tiff',
    coordinationValues: { fileUid: 'cube' },
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/sorger/test-dataset-cube/test_cube.offsets.json',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/test-dataset-cube/precomputed',
    coordinationValues: { fileUid: 'cube-meshes' },
  });

  dataset.addFile({
    fileType: 'obsSets.json',
    url: 'https://data-2.vitessce.io/data/sorger/test-dataset-cube/ids.json',
    coordinationValues: { obsType: 'cell' },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const neuroglancerView = config.addView(dataset, 'neuroglancer');
  neuroglancerView.setProps({
    initialNgCameraState: {
      position: [58, 83, 108],
    },
  });
  const obsSetsView = config.addView(dataset, 'obsSets');


  config.linkViewsByObject([spatialView, lcView], {
    spatialRenderingMode: '3D',
    imageLayer: CL([
      {
        fileUid: 'cube',
        spatialLayerOpacity: 1,
        spatialTargetResolution: 0,
        imageChannel: CL([
          { spatialTargetC: 0, spatialChannelColor: [90, 90, 90], spatialChannelVisible: true, spatialChannelOpacity: 0.3 },
          { spatialTargetC: 1, spatialChannelColor: [255, 0, 0], spatialChannelVisible: true, spatialChannelOpacity: 1.0 },
          { spatialTargetC: 2, spatialChannelColor: [0, 255, 0], spatialChannelVisible: true, spatialChannelOpacity: 1.0 },
          { spatialTargetC: 3, spatialChannelColor: [0, 128, 255], spatialChannelVisible: true, spatialChannelOpacity: 1.0 },
          { spatialTargetC: 4, spatialChannelColor: [255, 255, 0], spatialChannelVisible: true, spatialChannelOpacity: 1.0 },
          { spatialTargetC: 5, spatialChannelColor: [255, 0, 255], spatialChannelVisible: true, spatialChannelOpacity: 1.0 },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  config.linkViewsByObject([neuroglancerView, lcView], {
    segmentationLayer: CL([
      {
        fileUid: 'cube-meshes',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelVisible: true,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.layout(hconcat(neuroglancerView, spatialView, vconcat(lcView, obsSetsView)));

  return config.toJSON();
}

export const testCubeNeuroglancer = generateCubeCameraSyncConfiguration();
