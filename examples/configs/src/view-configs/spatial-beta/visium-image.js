/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e

function generateVisiumImageOnlyConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Visium - image only',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'https://vitessce-data.storage.googleapis.com/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.ome.zarr',
    coordinationValues: {
      fileUid: 'histology-image',
    },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL({
      fileUid: 'histology-image',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      photometricInterpretation: 'RGB',
    }),
  });

  config.layout(hconcat(spatialView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumImageOop2023 = generateVisiumImageOnlyConfig();
