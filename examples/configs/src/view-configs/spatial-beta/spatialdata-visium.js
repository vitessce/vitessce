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
      coordinateSystem: 'ST8059049',
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
      coordinateSystem: 'ST8059049',
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
  const featureList = config.addView(dataset1, 'featureList')
    .setProps({ enableMultiSelect: true });
  const histogram = config.addView(dataset1, 'featureValueHistogram');

  const [featureSelectionScope, obsColorEncodingScope, featureAggregationStrategyScope] = config.addCoordination('featureSelection', 'obsColorEncoding', 'featureAggregationStrategy');
  featureSelectionScope.setValue(['Slc25a4']);
  obsColorEncodingScope.setValue('geneSelection');
  featureAggregationStrategyScope.setValue('sum');

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
      featureAggregationStrategy: featureAggregationStrategyScope,
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  config.linkViewsByObject([featureList, heatmap, histogram], {
    featureSelection: featureSelectionScope,
    obsColorEncoding: obsColorEncodingScope,
    featureAggregationStrategy: featureAggregationStrategyScope,
  }, { meta: false });

  config.linkViews([featureList, heatmap, spatialView, lcView, histogram], ['obsType'], ['spot']);

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, hconcat(featureList, histogram))));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumSpatialdata2023 = generateVisiumConfig();
