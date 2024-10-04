/* eslint-disable max-len */
import {
  VitessceConfig,
  // eslint-disable-next-line no-unused-vars
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';


function generateVisiumXeniumConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.17',
    name: 'Janesick et al., bioRxiv 2022',
    description: 'High resolution mapping of the breast cancer tumor microenvironment using integrated single cell, spatial and in situ analysis of FFPE tissue',
  });
  const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-october-2024/visium_associated_xenium_io_aligned.zarr';
  const dataset1 = config.addDataset('D1').addFile({
    fileType: 'image.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/CytAssist_FFPE_Human_Breast_Cancer_full_image',
      coordinateSystem: 'aligned',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'tables/table/X',
      region: 'CytAssist_FFPE_Human_Breast_Cancer',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  }).addFile({
    fileType: 'obsSpots.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'shapes/CytAssist_FFPE_Human_Breast_Cancer',
      tablePath: 'tables/table',
      region: 'CytAssist_FFPE_Human_Breast_Cancer',
      coordinateSystem: 'aligned',
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
  featureSelectionScope.setValue(['A2M']);
  obsColorEncodingScope.setValue('geneSelection');

  /*
  config.linkViewsByObject([spatialView, lcView], {
    imageLayer: CL({
      photometricInterpretation: 'RGB',
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });
  */

  config.linkViewsByObject([spatialView, lcView], {
    spotLayer: CL({
      featureSelection: featureSelectionScope,
      obsColorEncoding: obsColorEncodingScope,
      //spatialSpotRadius: 100,
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSpots') });

  featureList.useCoordination(featureSelectionScope);
  featureList.useCoordination(obsColorEncodingScope);


  config.linkViews([featureList, heatmap, spatialView, lcView], ['obsType'], ['spot']);

  /* featureList.useCoordination(featureSelectionScope);
  heatmap.useCoordination(featureSelectionScope); */

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const alignedVisiumXeniumSpatialdata = generateVisiumXeniumConfig();
