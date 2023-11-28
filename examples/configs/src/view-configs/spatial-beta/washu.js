import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

function generateWashUConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'WashU Volume Demo',
  });
  const dataset = config.addDataset('WashU data').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_16/20x/stitched-ome_tiff/Sample_16_20x_2-Stitched.pyramid.ome.tif',
    options: {
        offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/washu-kidney/Lighsheet_test_data/sample_16/20x/stitched-ome_tiff/Sample_16_20x_2-Stitched.pyramid.offsets.json'
    },
    coordinationValues: {
      fileUid: 'Sample_16_20x_2-Stitched',
    },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'Sample_16_20x_2-Stitched',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: null,
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: null,
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const washuVolume2023 = generateWashUConfig();
