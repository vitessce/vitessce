/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';
import { makeIdsCsvDataUrl, makeColorsCsvDataUrl } from '../../utils.js';

function generateNeuroglancerTissueClasses() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Pancreas (Kiemen et al.)',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/kiemenetal/5xLabelled.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xLabelled.offsets.json',
    },
    coordinationValues: {
      fileUid: 'tissue-classes',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/kiemenetal/3dtm-outputs-sep-2026/5xLabelled_precomputed/',
    coordinationValues: {
      fileUid: 'tissue-classes-mesh',
    },
  });

  dataset.addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: makeIdsCsvDataUrl([1, 2, 3, 4, 5, 6, 8, 9, 10]),
    coordinationValues: {
      obsType: 'cell',
      featureType: 'feature',
      featureValueType: 'value',
    },
  });

  dataset.addFile({
    fileType: 'obsColors.csv',
    url: makeColorsCsvDataUrl({
      1: '#cc6677',
      2: '#332288',
      3: '#ddcc77',
      4: '#117733',
      5: '#88ccee',
      6: '#882255',
      // 7: '#44aa99', //This is the tissue background
      8: '#999933',
      9: '#aa4499',
      10: '#dddddd',
    }),
    options: {
      obsIndex: 'id',
      obsColors: 'color',
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

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
          name: 'Tissue Classes',
          column: 'id',
        },
      ],
    },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');


  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [15921000, 12177000, 2448000],
      projectionScale: 40000000,
      projectionOrientation: [0, 0, 0, 1],
    },
  });

  config.linkViewsByObject([spatialView, lcView, neuroglancerView], {
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

  config.linkViewsByObject([spatialView, lcView], {
    imageLayer: CL([
      {
        fileUid: 'tissue-classes',
        spatialLayerOpacity: 1,
        spatialTargetResolution: 5,
        photometricInterpretation: 'BlackIsZero',
        volumetricRenderingAlgorithm: 'additive',
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0, 10],
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  config.linkViewsByObject([neuroglancerView, lcView], {
    segmentationLayer: CL([
      {
        fileUid: 'tissue-classes-mesh',
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


  config.layout(hconcat(neuroglancerView, spatialView, vconcat(lcView, obsSets)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerKiemenTissueClasses = generateNeuroglancerTissueClasses();
