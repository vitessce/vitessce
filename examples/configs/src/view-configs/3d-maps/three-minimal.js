import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';

const idToUrl = {
  'lsp-1': 'https://data-2.vitessce.io/data/sorger/f8ii/',
  'lsp-2': 'https://data-2.vitessce.io/data/sorger/lightsheet_colon/',
  'lsp-3': 'https://data-2.vitessce.io/data/sorger/melanoma_zarr_32/',
  'kingsnake': 'https://data-2.vitessce.io/data/zarr_test/kingsnake_1c_32_z.zarr/',
  'gloria': 'https://data-2.vitessce.io/data/zarr_test/gloria/',
}

function generateThreeMinimalConfiguration(imageId) {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Spatial Accelerated',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: idToUrl[imageId],
    // url: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-melanoma-in-situ/0',
    // url: 'http://127.0.0.1:8080/kingsnake_1024x1024x795_uint8_z_manual.zarr',
    // url: 'http://127.0.0.1:8080/kingsnake/kingsnake_1c_32_z.zarr',

    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/kingsnake_1c_32_z.zarr/',
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/gloria/',
    // url: 'http://127.0.0.1:8080/gloria/',
    // url: 'http://127.0.0.1:8080/gloria_conversion/v1',

    // Example 1 clarence -- 0-7
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/f8ii/',
    // Example 2 clarence -- 0-8
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/lightsheet_colon/',
    // Example 350 GB
    // url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/melanoma_zarr_32/',

    // url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.3/idr0079A/9836998.zarr',
    // url: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.ome.tiff',
    // options: {
    //   offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.offsets.json',
    // },
  });

  const spatialAcceleratedView = config.addView(dataset, 'spatialBeta', { x: 0, y: 0, w: 9, h: 8 }).setProps({ three: true, accelerated: true });
  const spatialThreeView = config.addView(dataset, 'spatialBeta').setProps({ three: true, accelerated: false });
  const lcView = config.addView(dataset, 'layerControllerBeta', { x: 9, y: 0, w: 3, h: 8 });
  config.linkViewsByObject([spatialAcceleratedView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
    imageLayer: CL([
      {
        spatialLayerOpacity: 1,
        // spatialTargetResolution: 5,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            // spatialChannelWindow: [0, 4095],
          },
        ]),
      },
    ]),
  });

  //config.layout(hconcat(spatialAcceleratedView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const saLsp1 = generateThreeMinimalConfiguration('lsp-1');
export const saLsp2 = generateThreeMinimalConfiguration('lsp-2');
export const saLsp3 = generateThreeMinimalConfiguration('lsp-3');
export const saKingsnake = generateThreeMinimalConfiguration('kingsnake');
export const saGloria = generateThreeMinimalConfiguration('gloria');
