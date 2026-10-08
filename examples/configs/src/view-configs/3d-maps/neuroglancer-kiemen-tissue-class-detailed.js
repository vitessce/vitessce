/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';
import { makeIdsCsvDataUrl, makeColorsCsvDataUrl } from '../../utils.js';

function generateNeuroglancerTissueClassesDetailed() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Pancreas (Kiemen et al.)',
  });
  const dataset = config.addDataset('My dataset').addFile({
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


  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');


  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [15921000, 12177000, 2448000],
      projectionScale: 40000000,
      projectionOrientation: [0, 0, 0, 1],
    },
    title: 'Meshes Overview (Neuroglancer)',
  });

  const neuroglancerDetailView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [15921000, 12177000, 2448000],
      projectionScale: 40000000,
      projectionOrientation: [0, 0, 0, 1],
    },
    detailMode: true,
    title: 'Selected meshes',
    showAxisLines: false,
  });

  config.linkViewsByObject([lcView, neuroglancerView], {
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


  config.linkViewsByObject([neuroglancerView, neuroglancerDetailView, lcView], {
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
            obsColorEncoding: 'obsColors',
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });


  config.layout(hconcat(neuroglancerView, neuroglancerDetailView, vconcat(lcView, obsSets)));
  config.linkViews(
   [neuroglancerView, neuroglancerDetailView, obsSets],
  ['obsSetSelection', 'obsHighlight'],
    [[], null],
    );
     
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerKiemenTissueClassesDetailed = generateNeuroglancerTissueClassesDetailed();
