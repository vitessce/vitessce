/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerTwoLayerConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Melanoma',
  });

  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sanjay/20x/gloms/',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/washu-kidney/ng-meshes/20_10_new',
    coordinationValues: {
      fileUid: 'gloms',
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sanjay/20x/nerves/',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/washu-kidney/ng-meshes/20_10',
    coordinationValues: {
      fileUid: 'nerves',
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'http://localhost:8000/segments.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Layers',
          column: 'cluster',
        },

      ],
    },
  });


  const obsSets = config.addView(dataset, 'obsSets');

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [
        666.0850830078125,
        542.7763671875,
        469.30426025390625,
      ],
      projectionScale: 256,
      projectionOrientation: [
        -0.0765402764081955,
        0.8923467993736267,
        0.3026740550994873,
        -0.3259558379650116,
      ],
    },
  });


  config.linkViewsByObject([neuroglancerView], {
    spatialRenderingMode: '3D',
    spatialZoom: 0,
    spatialTargetT: 0,
    spatialTargetX: 0,
    spatialTargetY: 0,
    spatialTargetZ: 0,
    spatialRotationX: 0,
    spatialRotationY: 0,
    spatialRotationZ: 0,
    spatialRotationOrbit: 0,
  }, { meta: false });

  config.linkViewsByObject([neuroglancerView], {
    segmentationLayer: CL([
      {
        fileUid: 'gloms',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelVisible: true,
            obsColorEncoding: 'cellSetSelection',
          },
        ]),
      },
      {
        fileUid: 'nerves',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'nerve',
            spatialChannelVisible: true,
            obsColorEncoding: 'cellSetSelection',
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });


  config.layout(hconcat(neuroglancerView, vconcat(obsSets)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerTwoLayers = generateNeuroglancerTwoLayerConfig();
