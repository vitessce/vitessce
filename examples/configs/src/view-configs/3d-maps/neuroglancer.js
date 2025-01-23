import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/preview/multimodal-mass-spectrometry-imaging-data

function generateThreeMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Human Liver',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    // url: 'https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif?token=',
    // url: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.ome.tiff',
    // url: 'http://127.0.0.1:8080/cell_community.ome.tif',
    // url: 'https://data-2.vitessce.io/data/redBloodCell.ome.tiff',
    // url: 'https://data-2.vitessce.io/data/sorger/f8ii.ome.tiff',
    url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_3d.raster.pyramid.ome.tiff',
    // options: {
    //        offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.offsets.json',
    // },
    // coordinationValues: {
    //   fileUid: 'kidney',
    // },
  });

  const spatialThreeView = config.addView(dataset, 'neuroglancer').setProps({ viewerState: {
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
  const lcView = config.addView(dataset, 'layerControllerBeta');
  // config.linkViewsByObject([spatialThreeView, lcView], {
  //   spatialTargetZ: 0,
  //   spatialTargetT: 0,
  //   spatialRenderingMode: '3D',
  //   imageLayer: CL([
  //     {
  //       fileUid: 'kidney',
  //       spatialLayerOpacity: 1,
  //       spatialTargetResolution: null,
  //       imageChannel: CL([
  //         {
  //           spatialTargetC: 0,
  //           spatialChannelColor: [0, 0, 255],
  //           spatialChannelVisible: true,
  //           spatialChannelOpacity: 1.0,
  //           spatialChannelWindow: [0.314, 1.570],
  //         },
  //         {
  //           spatialTargetC: 1,
  //           spatialChannelColor: [0, 255, 0],
  //           spatialChannelVisible: true,
  //           spatialChannelOpacity: 1.0,
  //           spatialChannelWindow: [0.44, 1.57],
  //         },
  //         {
  //           spatialTargetC: 2,
  //           spatialChannelColor: [255, 0, 255],
  //           spatialChannelVisible: true,
  //           spatialChannelOpacity: 1.0,
  //           spatialChannelWindow: [0.5, 1.57],
  //         },
  //         {
  //           spatialTargetC: 3,
  //           spatialChannelColor: [255, 255, 0],
  //           spatialChannelVisible: true,
  //           spatialChannelOpacity: 1.0,
  //           spatialChannelWindow: [0.86, 1.57],
  //         },
  //       ]),
  //     },
  //   ]),
  // });

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const humanLiverNeuroglancer = generateThreeMinimalConfiguration();
