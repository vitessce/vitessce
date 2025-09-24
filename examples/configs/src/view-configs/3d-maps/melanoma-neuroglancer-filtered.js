import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Melanoma',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/sorger/Dataset1-LSP13626-melanoma-in-situ.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/sorger/Dataset1-LSP13626-melanoma-in-situ.offsets.json',
    },
    coordinationValues: {
      fileUid: 'melanoma',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/melanoma_meshes',
    options: {
      dimensionX: 1e-9,
      dimensionY: 1e-9,
      dimensionZ: 1e-9,
      dimensionUnit: 'm',
      position: [49.5, 1000.5, 5209.5],
      projectionScale: 1024,
      projectionOrientation: [
        -0.636204183101654,
        -0.5028395652770996,
        0.5443811416625977,
        0.2145828753709793,
      ],
      layout: '3d',
    },
    coordinationValues: {
      fileUid: 'melanom-meshes',
    },
  });

  dataset.addFile({
    fileType: 'obsEmbedding.csv',
    url: 'https://storage.googleapis.com/vitessce-demo-data/neuroglancer-march-2025/melanoma_with_embedding_filtered_ids.csv',
    // url: 'https://data-2.vitessce.io/data/sorger/melanoma_with_embedding_red.csv',
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
    // url: 'https://data-2.vitessce.io/data/sorger/melanoma_with_embedding_red.csv',
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

  const neuroglancerView = config.addView(dataset, 'neuroglancer', { mapping: 'TSNE' });


  config.linkViews([scatterView], ['embeddingObsRadiusMode', 'embeddingObsRadius'], ['manual', 4]);

  // Sync the zoom/rotation/pan states
  config.linkViewsByObject([spatialThreeView, lcView, neuroglancerView], {
    spatialRenderingMode: '3D',
    spatialZoom: 0,
    spatialTargetT: 0,
    spatialTargetX: 0,
    spatialTargetY: 0,
    spatialTargetZ: 0,
    spatialRotationX: 0,
    spatialRotationY: 0,
    spatialRotationOrbit: 0,
    // Should there be a Z-target/rotation specified here?
  }, { meta: false });

  // Initialize the image properties
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


  config.layout(hconcat(neuroglancerView, spatialThreeView, vconcat(lcView, obsSets, scatterView)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const melanomaNeuroglancerFiltered = generateNeuroglancerMinimalConfiguration();
