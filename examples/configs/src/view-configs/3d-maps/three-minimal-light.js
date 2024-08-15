import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/b6eba6afe660a8a85c2648e368b0cf9f

function generateThreeMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Minimal Three Lightsheet',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/1f99c0bc4fd3a60bb569410878e4a817/ometiff-pyramids/Level0/Channel1/UFL0006-LY09-1-1.ome.tif?token=',
    coordinationValues: {
      fileUid: 'kidney',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta')
    .setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 255, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: null,
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const threeMinimalLight = generateThreeMinimalConfiguration();
