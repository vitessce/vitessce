/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e

function generateVisiumConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Visium OOP',
  });
  const dataset1 = config.addDataset('D1').addFile({
    fileType: 'image.spatialdata.zarr',
    url: 'http://localhost:8000/visium.zarr',
    options: {
      path: 'images/ST8059049_image',
    },
    coordinationValues: {
      fileUid: 'ST8059049',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: 'http://localhost:8000/visium.zarr',
    options: {
      path: 'table/table/X',
      region: 'ST8059049_shapes',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  }).addFile({
    fileType: 'obsSpots.spatialdata.zarr',
    url: 'http://localhost:8000/visium.zarr',
    options: {
      // TODO: should '/coords' suffix be appended internally?
      path: 'shapes/ST8059049_shapes/coords',
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

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['Slc25a4']);

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    obsType: 'spot', // TODO: remove this after auto-initialization is supported per-layer/per-layer-channel.
    // For now, cheating by allowing the spotLayer to fall back to the auto-initialized values for the view.
    imageLayer: CL({
      fileUid: 'ST8059049',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      photometricInterpretation: 'RGB',
    }),
    spotLayer: CL({
      obsType: 'spot',
      spatialLayerVisible: true,
      spatialLayerOpacity: 0.5,
      spatialSpotRadius: 100.0,
      featureValueColormapRange: [0, 0.5],
      obsColorEncoding: 'geneSelection',
      featureSelection: featureSelectionScope,
    }),
  });

  config.linkViews([featureList, heatmap], ['obsType'], ['spot']);

  featureList.useCoordination(featureSelectionScope);
  heatmap.useCoordination(featureSelectionScope);

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumSpatialdata2023 = generateVisiumConfig();
