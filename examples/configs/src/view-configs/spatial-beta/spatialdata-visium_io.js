/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

// Reference: https://github.com/giovp/spatialdata-sandbox/blob/3da0af016d3ddd85f1d63a9c03a67b240b012bd0/visium_io/download.py#L15


function generateVisiumIoConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Adult mouse olfactory bulb, 10x Genomics',
    description: 'Visium Spatial Gene Expression data from 10x Genomics',
  });
  const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-september-2023/visium_io.zarr';
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/Visium_Mouse_Olfactory_Bulb_full_image',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'table/table/X',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  }).addFile({
    fileType: 'obsSpots.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'shapes/Visium_Mouse_Olfactory_Bulb',
      tablePath: 'table/table',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  })
    .addFile({
      fileType: 'obsSets.spatialdata.zarr',
      url: baseUrl,
      options: {
        obsSets: [
          {
            name: 'Region',
            path: 'table/table/obs/region',
          },
        ],
      },
      coordinationValues: {
        obsType: 'spot',
      },
    });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const heatmap = config.addView(dataset, 'heatmap');
  const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['Atp1b1']);

  const [obsColorEncodingScope] = config.addCoordination('obsColorEncoding');
  obsColorEncodingScope.setValue('geneSelection');

  config.linkViewsByObject([spatialView, lcView], {
    spotLayer: CL({
      // featureValueColormapRange: [0, 0.5],
      obsColorEncoding: obsColorEncodingScope,
      featureSelection: featureSelectionScope,
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSpots') });

  config.linkViewsByObject([spatialView, lcView], {
    imageLayer: CL({
      // featureValueColormapRange: [0, 0.5],
      photometricInterpretation: 'RGB',
      // featureSelection: featureSelectionScope,
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  config.linkViews([featureList, heatmap, obsSets, spatialView, lcView], ['obsType'], ['spot']);

  featureList.useCoordination(featureSelectionScope);
  heatmap.useCoordination(featureSelectionScope);

  featureList.useCoordination(obsColorEncodingScope);
  heatmap.useCoordination(obsColorEncodingScope);
  obsSets.useCoordination(obsColorEncodingScope);

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, hconcat(featureList, obsSets))));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumIoSpatialdata2023 = generateVisiumIoConfig();
