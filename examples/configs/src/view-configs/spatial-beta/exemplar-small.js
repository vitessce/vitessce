/* eslint-disable max-len */
import {
  VitessceConfig,
  hconcat,
  vconcat,
  CoordinationLevel as CL,
  getInitialCoordinationScopePrefix,
  getInitialCoordinationScopeName,
} from '@vitessce/config';

// References:
// - https://mcmicro.org/datasets/
// - https://www.synapse.org/#!Synapse:syn22345748/wiki/609239

// Auto-initialization without user-defined values.
function generateExemplarSmallConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Schapiro et al., Nature Methods 2022',
    description: 'Small lung adenocarcinoma specimen from a tissue microarray (TMA), imaged using CyCIF.',
  });
  // const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-september-2023/mcmicro_io.zarr';
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'exemplar-001.crop.image.ome.zarr',
  }).addFile({
    fileType: 'obsSegmentations.ome-zarr',
    url: 'exemplar-001.crop.segmentations.ome.zarr',
    options: {
      obsTypesFromChannelNames: true,
    },
  }).addFile({
    fileType: 'anndata.zarr',
    url: 'exemplar-001.crop.cells.adata.zarr',
    options: {
      obsFeatureMatrix: {
        path: 'X',
      },
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });
  /* .addFile({
    fileType: 'anndata.zarr',
    url: `${baseUrl}/exemplar-001.crop.circles.adata.zarr`,
    options: {
      obsFeatureMatrix: {
        path: 'X'
      },
    },
    coordinationValues: {
      obsType: 'circle',
    },
  }); */
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

// Combine auto-initialization with user-defined coordination values.
function generateExemplarSmallPartialInit() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Schapiro et al., Nature Methods 2022',
    description: 'Small lung adenocarcinoma specimen from a tissue microarray (TMA), imaged using CyCIF.',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'exemplar-001.crop.image.ome.zarr',
  }).addFile({
    fileType: 'obsSegmentations.ome-zarr',
    url: 'exemplar-001.crop.segmentations.ome.zarr',
    options: {
      obsTypesFromChannelNames: true,
    },
  }).addFile({
    fileType: 'anndata.zarr',
    url: 'exemplar-001.crop.cells.adata.zarr',
    options: {
      obsFeatureMatrix: {
        path: 'X',
      },
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const heatmap = config.addView(dataset, 'heatmap');
  // const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  config.linkViewsByObject([spatialView, lcView], {
    segmentationLayer: CL({
      segmentationChannel: CL([
        {
          obsColorEncoding: 'geneSelection',
          featureSelection: ['DNA'],
        },
        {
          // Need empty object, otherwise this channel will not be initialized.
        },
      ]),
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.setCoordinationValue('spatialChannelColor', getInitialCoordinationScopeName('A', 'image', 0), [0, 255, 0]);
  config.setCoordinationValue('spatialChannelOpacity', getInitialCoordinationScopeName('A', 'obsSegmentations', 1), 0.5);

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, /* obsSets, */ featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const exemplarSmall2024 = generateExemplarSmallConfig();
export const exemplarSmallPartialInit = generateExemplarSmallPartialInit();
