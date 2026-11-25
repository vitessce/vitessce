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
  // Tissue class names (received via slack) from the pancreas FTU config (7 = nontissue_space omitted;
  // 11 = panin_segmented lives in 5xPanIn.ome.tiff, not this mask)
  const tissueClasses = {
    1: 'Islets of Langerhans',
    2: 'Ducts',
    3: 'Vasculature',
    4: 'Fat',
    5: 'Acinar lobules',
    6: 'Stroma',
    8: 'PanIN',
    9: 'Nerves',
    10: 'Immune cell aggregates',
  };
  const tissueClassIds = Object.keys(tissueClasses).map(Number);
  const tissueClassesCsvUrl = `data:text/csv,${encodeURIComponent(
    ['id,name', ...Object.entries(tissueClasses).map(([id, name]) => `${id},${name}`)].join('\n'),
  )}`;

  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Pancreas (Kiemen et al.)',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/kiemenetal/5xHE_HE_norm.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xHE_HE_norm.offsets.json',
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
    url: makeIdsCsvDataUrl(tissueClassIds),
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
      // 7: '#44aa99', //This is the non-tissue-space
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
    url: tissueClassesCsvUrl,
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Tissue Classes',
          column: 'name',
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
            // Hematoxylin (nuclei): blue-purple
            spatialTargetC: 0,
            spatialChannelColor: [90, 60, 220],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [30, 220],
          },
          {
            // Eosin (cytoplasm / stroma): pink
            spatialTargetC: 1,
            spatialChannelColor: [255, 80, 170],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [30, 255],
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
