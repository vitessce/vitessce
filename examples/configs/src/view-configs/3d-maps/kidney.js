import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
} from '@vitessce/config';

function generateJainKidney() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Jain Kidney Decimated 2024',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://vitessce-data-v2.s3.amazonaws.com/data/washu-kidney/LS_20x_5_Stitched.pyramid.ome.tiff',
    options: {
      offsetsUrl: 'https://vitessce-data-v2.s3.amazonaws.com/data/washu-kidney/LS_20x_5_Stitched.pyramid.offsets.json',
    },
    coordinationValues: {
      fileUid: 'kidney',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta').setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const organViewer = config.addView(dataset, 'organViewer').setProps({ description: "Test" });
  const blockViewer = config.addView(dataset, 'blockViewer').setProps({ description: "Test" });

  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [221, 52, 151],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [773, 7733],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [29, 145, 192],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [2290, 6724],
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialThreeView, vconcat(lcView, hconcat(organViewer, blockViewer))));

  const configJSON = config.toJSON();
  return configJSON;
}

export const jainKidney = generateJainKidney();
