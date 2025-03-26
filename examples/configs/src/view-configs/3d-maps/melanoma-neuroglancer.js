import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,

} from '@vitessce/config';

function generateNeuroglancerMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Melanoma',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-invasive-margin.ome.tiff',
    options: {
      offsetsUrl: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-invasive-margin.offsets.json',
    },
    coordinationValues: {
      fileUid: 'melanoma',
    },
  });
  // const dataset = config.addDataset('My dataset').addFile({
  //   fileType: 'image.ome-tiff',
  //   url: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-melanoma-in-situ.ome.tiff',
  //   options: {
  //       offsetsUrl: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-melanoma-in-situ.offsets.json',
  //   },
  //   coordinationValues: {
  //     fileUid: 'melanoma',
  //   },
  // });


  dataset.addFile({
    fileType: 'obsEmbedding.csv',
    url: 'http://localhost:8000/melanoma_with_embedding_filtered_ids.csv',
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/melanoma_with_embedding_red.csv',
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
    url: 'http://localhost:8000/melanoma_with_embedding_filtered_ids.csv',
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/melanoma_with_embedding_red.csv',
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

  const spatialThreeView = config.addView(dataset, 'spatial').setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const scatterView = config.addView(dataset, 'scatterplot', { mapping: 'TSNE' });

  const neuroglancerView = config.addView(dataset, 'neuroglancer', { mapping: 'TSNE' }).setProps({ viewerState: {
    dimensions: {
      x: [
        1e-9,
        'm',
      ],
      y: [
        1e-9,
        'm',
      ],
      z: [
        1e-9,
        'm',
      ],
    },
    position: [
      49.5,
      1000.5,
      5209.5,
    ],
    crossSectionScale: 1,
    projectionOrientation: [
      -0.636204183101654,
      -0.5028395652770996,
      0.5443811416625977,
      0.2145828753709793,
    ],
    projectionScale: 1024,
    layers: [
      {
        type: 'segmentation',
        source: 'precomputed://https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/invasive_meshes',
        // source: 'precomputed://https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/melanoma_meshes',
        segments: ['5'],
        segmentColors: {
          5: 'red',
        },
        name: 'segmentation',
      },

    ],
    showSlices: false,
    layout: '3d',
  } });


  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
    imageLayer: CL([
      {
        fileUid: 'melanoma',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 1,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
          },
        ]),
      },
    ]),
  });


  config.layout(hconcat(neuroglancerView, spatialThreeView, vconcat(lcView, obsSets, scatterView)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const melanomaNeuroglancer = generateNeuroglancerMinimalConfiguration();
