/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerPancreasConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'PanIn',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/kiemenetal/5xPanIn.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xPanIn.offsets.json',
    },
    coordinationValues: {
      fileUid: 'PanIn',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/kiemenetal/3dtm-outputs-sep-2026/5xPanin_precomputed/',
    coordinationValues: {
      fileUid: 'panIn-meshes',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/kiemenetal/3dtm-outputs-sep-2026/5xPanin.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Layer',
          column: 'layer',
        },
      ],
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');


  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [15921000, 12177000, 2448000],
      projectionScale: 40000000,
      projectionOrientation: [0, 0, 0, 1],
    },
  });


  config.linkViewsByObject([spatialThreeView, lcView, neuroglancerView], {
    spatialRenderingMode: '3D',
    spatialZoom: 0,
    spatialTargetT: 0,
    spatialTargetX: 0,
    spatialTargetY: 0,
    spatialTargetZ: 0,
    spatialRotationX: 0,
    spatialRotationY: 0,
    spatialRotationOrbit: 0,

  }, { meta: false });

  config.linkViewsByObject([spatialThreeView, lcView], {
    imageLayer: CL([
      {
        fileUid: 'PanIn',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  config.linkViewsByObject([neuroglancerView, lcView], {
    segmentationLayer: CL([
      {
        fileUid: 'panIn-meshes',
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


  config.layout(hconcat(neuroglancerView, spatialThreeView, vconcat(lcView, obsSets)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const pancreasNeuroglancer = generateNeuroglancerPancreasConfiguration();
