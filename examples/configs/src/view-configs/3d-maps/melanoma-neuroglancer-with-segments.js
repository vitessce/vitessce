/* eslint-disable max-len */

//  This config is an example of providing a list of segment IDs to Neuroglancer instead of obsSets.
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';
import { makeIdsCsvDataUrl, makeColorsCsvDataUrl } from '../../utils.js';

function generateNeuroglanceSegmentsConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Melanoma',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/sorger_mis',
    coordinationValues: {
      fileUid: 'melanom-meshes',
    },
  });

  dataset.addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: makeIdsCsvDataUrl([612, 3351, 4328, 6531, 8446]),
    coordinationValues: {
      obsType: 'cell',
      featureType: 'feature',
      featureValueType: 'value',
    },
  });

  dataset.addFile({
    fileType: 'obsColors.csv',
    url: makeColorsCsvDataUrl({
      612: '#d74242',
      3351: '#b9d742',
      4328: '#42d77d',
      6531: '#427dd7',
      8446: '#b942d7',
    }),
    options: {
      obsIndex: 'id',
      obsColors: 'color',
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  const lcView = config.addView(dataset, 'layerControllerBeta');

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [5221126, 554548, 96770],
      projectionScale: 420000,
    },
  });

  config.linkViewsByObject([lcView, neuroglancerView], {
    spatialRenderingMode: '3D',
  }, { meta: false });

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
            featureType: 'feature',
            featureValueType: 'value',
            spatialChannelVisible: true,
            obsColorEncoding: 'obsColors',
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.layout(hconcat(neuroglancerView, vconcat(lcView)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const melanomaNeuroglancerSegments = generateNeuroglanceSegmentsConfiguration();
