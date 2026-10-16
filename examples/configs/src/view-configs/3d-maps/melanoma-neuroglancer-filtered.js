/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerFilteredMelanomaConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Melanoma',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/sorger/melanoma_mask.ome.tiff',
    coordinationValues: {
      fileUid: 'melanoma',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/sorger_mis',
    coordinationValues: {
      fileUid: 'melanom-meshes',
    },
  });

  dataset.addFile({
    fileType: 'obsEmbedding.csv',
    url: 'https://storage.googleapis.com/vitessce-demo-data/neuroglancer-march-2025/melanoma_with_embedding_filtered_ids.csv',

    options: {
      obsIndex: 'id',
      obsEmbedding: ['tSNE1', 'tSNE2'],
    },
    coordinationValues: {
      obsType: 'cell',
      embeddingType: 'TSNE',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://storage.googleapis.com/vitessce-demo-data/neuroglancer-march-2025/melanoma_with_embedding_filtered_ids.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'id',
      obsSets: [
        {
          name: 'Clusters',
          column: 'cluster',
        },
      ],
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const scatterView = config.addView(dataset, 'scatterplot', { mapping: 'TSNE' });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2727000, 1377000, 97000], // image center in nm (5454 × 2754 × 194 µm / 2)
      projectionScale: 3500000,
    },
  });


  config.linkViews([scatterView], ['embeddingObsRadiusMode', 'embeddingObsRadius'], ['manual', 4]);

  config.linkViewsByObject([spatialThreeView, lcView, neuroglancerView], {
    spatialRenderingMode: '3D' }, { meta: false });


  config.linkViewsByObject([spatialThreeView, lcView], {
    imageLayer: CL([
      {
        fileUid: 'melanoma',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

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
            spatialChannelVisible: true,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });


  config.layout(hconcat(neuroglancerView, spatialThreeView, vconcat(lcView, obsSets, scatterView)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const melanomaNeuroglancerFiltered = generateNeuroglancerFilteredMelanomaConfiguration();
