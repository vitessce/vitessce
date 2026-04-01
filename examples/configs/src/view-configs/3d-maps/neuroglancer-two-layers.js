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
    // sharded version -- use when support is added
    // url: 'https://data-2.vitessce.io/data/sanjay/20x/gloms/',
    url: 'https://data-2.vitessce.io/data/washu-kidney/ng-meshes/20_10_new',
    coordinationValues: {
      fileUid: 'gloms',
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    // sharded version -- use when support is added
    // url: 'https://data-2.vitessce.io/data/sanjay/20x/nerves/',
    url: 'https://data-2.vitessce.io/data/washu-kidney/ng-meshes/20_10',
    coordinationValues: {
      fileUid: 'nerves',
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/washu-kidney/ng-meshes/segments.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Layers',
          column: 'layer',
        },

      ],
    },
  });


  const obsSets = config.addView(dataset, 'obsSets');
  const layerController = config.addView(dataset, 'layerControllerBeta');

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


  config.linkViewsByObject([neuroglancerView, layerController], {
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

  config.linkViewsByObject([neuroglancerView, layerController], {
    segmentationLayer: CL([
      {
        fileUid: 'gloms',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelVisible: true,
            obsHighlight: null,
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
            obsType: 'cell',
            spatialChannelVisible: true,
            obsHighlight: null,
            obsColorEncoding: 'cellSetSelection',
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });


  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerTwoLayers = generateNeuroglancerTwoLayerConfig();
