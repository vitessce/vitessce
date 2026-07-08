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
      obsType: 'glom',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    // sharded version -- use when support is added
    // url: 'https://data-2.vitessce.io/data/sanjay/20x/nerves/',
    url: 'https://data-2.vitessce.io/data/washu-kidney/ng-meshes/20_10',
    coordinationValues: {
      fileUid: 'nerves',
      obsType: 'nerve',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/washu-kidney/ng-meshes/gloms_layer.csv',
    coordinationValues: {
      obsType: 'glom',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Glom',
          column: 'layer',
        },

      ],
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/washu-kidney/ng-meshes/nerves.csv',
    coordinationValues: {
      obsType: 'nerve',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Nerve',
          column: 'layer',
        },

      ],
    },
  });


  const nerveSets = config.addView(dataset, 'obsSets');
  const glomSets = config.addView(dataset, 'obsSets');
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

  const [
    nerveSetSelectionScope,
    glomSetSelectionScope,
    nerveSetColor,
    glomSetColor,
  ] = config.addCoordination(
    'obsSetSelection',
    'obsSetSelection',
    'obsSetColor',
    'obsSetColor',
  );

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
            obsType: 'glom',
            spatialChannelVisible: true,
            obsHighlight: null,
            spatialChannelColor: [136, 204, 238],
            obsColorEncoding: 'spatialChannelColor',
            obsSetSelection: glomSetSelectionScope,
            obsSetColor: glomSetColor,
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
            obsHighlight: null,
            spatialChannelColor: [255, 255, 238],
            obsColorEncoding: 'spatialChannelColor',
            obsSetSelection: nerveSetSelectionScope,
            obsSetColor: nerveSetColor,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViewsByObject([glomSets], {
    obsType: 'glom',
    obsSetSelection: glomSetSelectionScope,
    obsSetColor: glomSetColor,
  }, { meta: false });

  config.linkViewsByObject([nerveSets], {
    obsType: 'nerve',
    obsSetSelection: nerveSetSelectionScope,
    obsSetColor: nerveSetColor,
  }, { meta: false });


  config.layout(hconcat(neuroglancerView, vconcat(layerController, glomSets, nerveSets)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerTwoLayers = generateNeuroglancerTwoLayerConfig();
