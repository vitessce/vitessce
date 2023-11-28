import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


// We do not want to commit any presigned URLs to the repository, so we will set them as environment variables in the terminal.

// Get the presigned URLs for these files on S3:
// s3://hdv-spatial-data/washu-kidney/Lighsheet_test_data/sample_16/20x/stitched-ome_tiff/Sample_16_20x_2-Stitched.pyramid.offsets.json
// s3://hdv-spatial-data/washu-kidney/Lighsheet_test_data/sample_16/20x/stitched-ome_tiff/Sample_16_20x_2-Stitched.pyramid.ome.tif

// Set these presigned URLs as environment variables in the terminal by running:

// export VITE_TIFF_URL='{your presigned URL for the OME-TIFF file}'
// export VITE_JSON_URL='{your presigned URL for the offsets JSON file}'

// Note: You may need to disable 'Terminal may enable paste bracketing' in iTerm2 Settings > Profiles > Terminal.
// Reference: https://stackoverflow.com/a/75748117

const omeTiffPresignedUrl = import.meta.env.VITE_TIFF_URL;
const offsetsPresignedUrl = import.meta.env.VITE_JSON_URL;

function generateWashUConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'WashU Volume Demo',
  });
  const dataset = config.addDataset('WashU data').addFile({
    fileType: 'image.ome-tiff',
    url: omeTiffPresignedUrl,
    options: {
        offsetsUrl: offsetsPresignedUrl
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
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: null,
          },
          {
            spatialTargetC: 2,
            spatialChannelColor: [0, 255, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: null,
          },
          {
            spatialTargetC: 3,
            spatialChannelColor: [255, 255, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 0.5,
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
