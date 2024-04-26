/* eslint-disable max-len */
import {
  VitessceConfig,
  // eslint-disable-next-line no-unused-vars
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

// Sample ST8059049 from E-MTAB-11114
// Reference: https://github.com/giovp/spatialdata-sandbox/blob/3da0af016d3ddd85f1d63a9c03a67b240b012bd0/visium/README.md

function generateVisiumConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Kleshchevnikov et al., Nature Biotechnology 2022',
    description: 'Mouse brain section profiled by 10x Visium and converted to SpatialData by Marconato et al., bioRxiv 2023.',
  });
  const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-september-2023/visium.zarr';
  const dataset1 = config.addDataset('D1').addFile({
    fileType: 'image.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/ST8059049_image',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'table/table/X',
      region: 'ST8059049_shapes',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  }).addFile({
    fileType: 'obsSpots.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'shapes/ST8059049_shapes',
      tablePath: 'table/table',
      region: 'ST8059049_shapes',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  });
  // TODO: add second image in second dataset.

  const spatialView = config.addView(dataset1, 'spatialBeta');
  const lcView = config.addView(dataset1, 'layerControllerBeta');
  const heatmap = config.addView(dataset1, 'heatmap');
  // const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset1, 'featureList');

  const [featureSelectionScope, obsColorEncodingScope] = config.addCoordination('featureSelection', 'obsColorEncoding');
  featureSelectionScope.setValue(['Slc25a4']);
  obsColorEncodingScope.setValue('geneSelection');


  config.linkViewsByObject([spatialView, lcView], {
    imageLayer: CL({
      photometricInterpretation: 'RGB',
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });
  config.linkViewsByObject([spatialView, lcView], {
    spotLayer: CL({
      featureSelection: featureSelectionScope,
      obsColorEncoding: obsColorEncodingScope,
      spatialSpotRadius: 100,
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  featureList.useCoordination(featureSelectionScope);
  featureList.useCoordination(obsColorEncodingScope);


  config.linkViews([featureList, heatmap, spatialView, lcView], ['obsType'], ['spot']);

  /* featureList.useCoordination(featureSelectionScope);
  heatmap.useCoordination(featureSelectionScope); */

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumSpatialdata2023 = generateVisiumConfig();
