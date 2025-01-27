import {
  VitessceConfig,
  hconcat,
} from '@vitessce/config';


function generateNeuroglancerMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Melanoma',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-invasive-margin.ome.tiff',
    coordinationValues: {
      fileUid: 'melanoma',
    },
  });
  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({ viewerState: {
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
        tab: 'segments',
        segments: [
          '2',
          '3',
          '4',
          '5',
        ],
        name: 'invasive_meshes',
      },
    ],
    showSlices: false,
    selectedLayer: {
      visible: true,
      layer: 'invasive_meshes',
    },
    layout: '3d',

  } });

  config.layout(hconcat(neuroglancerView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const melanomaNeuroglancer = generateNeuroglancerMinimalConfiguration();
