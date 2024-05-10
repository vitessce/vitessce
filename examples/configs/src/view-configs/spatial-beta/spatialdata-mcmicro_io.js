/* eslint-disable max-len */
import {
  VitessceConfig,
  hconcat,
  vconcat,
} from '@vitessce/config';

// References:
// - https://mcmicro.org/datasets/
// - https://www.synapse.org/#!Synapse:syn22345748/wiki/609239

function generateMcmicroIoConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Schapiro et al., Nature Methods 2022',
    description: 'Small lung adenocarcinoma specimen from a tissue microarray (TMA), imaged using CyCIF.',
  });
  const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-september-2023/mcmicro_io.zarr';
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/exemplar-001_image',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'table/table/X',
    },
    coordinationValues: {
      obsType: 'cell',
    },
  }).addFile({
    fileType: 'labels.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'labels/exemplar-001_cells',
    },
  });
  /*
    .addFile({
      fileType: 'labels.spatialdata.zarr',
      url: baseUrl,
      options: {
        path: 'labels/exemplar-001_nuclei',
      },
      coordinationValues: {
        fileUid: 'nucleus-bitmask',
        obsType: 'nucleus',
      },
    });
    */

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const heatmap = config.addView(dataset, 'heatmap');
  // const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, /* obsSets, */ featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const mcmicroIoSpatialdata2023 = generateMcmicroIoConfig();
