/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e

function generateVisiumIoConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Visium OOP',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.spatialdata.zarr',
    url: 'http://localhost:8000/visium_io.zarr',
    options: {
      path: 'images/Visium_Mouse_Olfactory_Bulb_full_image',
    },
    coordinationValues: {
      fileUid: 'histology-image',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: 'http://localhost:8000/visium_io.zarr',
    options: {
      path: 'table/table/X',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  }).addFile({
    fileType: 'obsSpots.spatialdata.zarr',
    url: 'http://localhost:8000/visium_io.zarr',
    options: {
      // TODO: should '/coords' suffix be appended internally?
      path: 'shapes/Visium_Mouse_Olfactory_Bulb/coords',
      tablePath: 'table/table',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const heatmap = config.addView(dataset, 'heatmap');
  // const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['Atp1b1']);

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    obsType: 'spot', // TODO: remove this after auto-initialization is supported per-layer/per-layer-channel.
    // For now, cheating by allowing the spotLayer to fall back to the auto-initialized values for the view.
    imageLayer: CL({
      fileUid: 'histology-image',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      photometricInterpretation: 'RGB',
    }),
    spotLayer: CL({
      obsType: 'spot',
      spatialLayerVisible: true,
      spatialLayerOpacity: 0.5,
      spatialSpotRadius: 50.0,
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


export const visiumIoSpatialdata2023 = generateVisiumIoConfig();
