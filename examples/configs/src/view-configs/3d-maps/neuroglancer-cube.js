/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

// Synthetic asymmetric cube for debugging NG <-> spatialBeta camera sync.
// Asymmetry (108 x 158 x 208) is deliberate: a symmetric cube hides mirroring
// and axis-swap errors, which are exactly what we're testing for.
function generateCubeCameraSyncConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Cube camera sync',
  });

  const dataset = config.addDataset('Test cube').addFile({
    fileType: 'image.ome-tiff',
    url: 'http://localhost:7004/test_cube.ome.tiff',
    coordinationValues: { fileUid: 'cube' },
    options: {
      offsetsUrl: 'http://localhost:7004/test_cube.offsets.json',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'http://localhost:7004/precomputed',
    coordinationValues: { fileUid: 'cube-meshes' },
    // options: {
    //     dimensions: {
    //       x: [0.000001, 'm'],
    //       y: [0.000001, 'm'],
    //       z: [0.000001, 'm'],
    //     },/'
    //   },
  });

  dataset.addFile({
    fileType: 'obsSets.json',
    url: 'http://localhost:7004/ids.json',
    coordinationValues: { obsType: 'cell' },
    // options: {
    //   obsIndex: 'id',
    //   obsSets: [{ name: 'Objects', column: 'object' }],
    // },
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

  // The coordination scopes under test. Deliberately NO initialNgCameraState:
  // we want to observe what NG reports from a cold start, since the readiness
  // race shows up exactly in that window.
  config.linkViewsByObject([spatialView, lcView, neuroglancerView], {
    spatialRenderingMode: '3D',
    spatialZoom: 0,
    spatialTargetT: 0,
    // spatialTargetX: 58,
    // spatialTargetY: 83,
    // spatialTargetZ: 108,
    spatialTargetX: 0,
    spatialTargetY: 0,
    spatialTargetZ: 0,
    spatialRotationX: 0,
    spatialRotationY: 0,
    spatialRotationOrbit: 0,
  }, { meta: false });

  config.linkViewsByObject([spatialView, lcView], {
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
