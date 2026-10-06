/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';
import { makeIdsCsvDataUrl, makeColorsCsvDataUrl } from '../../utils.js';

function generateNeuroglancerHnE() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'PanIn',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/kiemenetal/5xLabelled.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xLabelled.offsets.json',
    },
    coordinationValues: {
      fileUid: 'PanIn',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/kiemenetal/3dtm-outputs-sep-2026/5xLabelled_precomputed/',
    coordinationValues: {
      fileUid: 'melanom-meshes',
    },
  });

//   dataset.addFile({
//     fileType: 'obsFeatureMatrix.csv',
//     url: makeIdsCsvDataUrl([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
//     coordinationValues: {
//       obsType: 'cell',
//       featureType: 'feature',
//       featureValueType: 'value',
//     },
//   });

//   dataset.addFile({
//     fileType: 'obsColors.csv',
//     url: makeColorsCsvDataUrl({
//       1: '#d74242',
//       2: '#b9d742',
//       3: '#42d77d',
//       4: '#427dd7',
//       5: '#b942d7',
//     //   6:
//     }),
//     options: {
//       obsIndex: 'id',
//       obsColors: 'color',
//     },
//     coordinationValues: {
//       obsType: 'cell',
//     },
//   });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/kiemenetal/3dtm-outputs-sep-2026/5xLabelled.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'id',
          column: 'id',
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
      projectionScale: 40000000,   // ~ largest extent; lower to zoom in
      projectionOrientation: [0, 0, 0, 1],
    }
  });

  // Sync the zoom/rotation/pan states
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
    // Should there be a Z-target/rotation specified here?
  }, { meta: false });

  // Initialize the image properties
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
        fileUid: 'melanom-meshes',
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

export const neuroglancerHnE = generateNeuroglancerHnE();
