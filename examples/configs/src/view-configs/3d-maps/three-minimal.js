import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateThreeMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Minimal Three',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'https://lsp-public-data.s3.amazonaws.com/yapp-2023-3d-melanoma/Dataset1-LSP13626-melanoma-in-situ/0',
    // url: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.ome.tiff',
    // options: {
    //   offsetsUrl: 'https://data-2.vitessce.io/data/kiemenetal/5xHE.offsets.json',
    // },
    coordinationValues: {
      fileUid: 'kiemen',
    },
  });

  const spatialAcceleratedView = config.addView(dataset, 'spatialBeta').setProps({ three: true });
  const spatialThreeView = config.addView(dataset, 'spatialBeta').setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  config.linkViewsByObject([spatialThreeView, spatialAcceleratedView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'kiemen',
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

  config.layout(hconcat(spatialThreeView, spatialAcceleratedView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const threeMinimal = generateThreeMinimalConfiguration();
