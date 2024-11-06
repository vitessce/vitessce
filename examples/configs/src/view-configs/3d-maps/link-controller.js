import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';


function generateLinkControllerConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'VitessceLink Demo',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/redBloodCell.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/redBloodCell.offsets.json',
    },
    coordinationValues: {
      fileUid: 'file',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta', { x: 0, y: 0, w: 8, h: 8 })
    .setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta', { x: 8, y: 0, w: 4, h: 6 });
  const linkController = config.addView(dataset, 'linkController', {
    x: 8,
    y: 1,
    w: 4,
    h: 2,
  }).setProps({ linkID: 5454 });

  config.linkViewsByObject([spatialThreeView, lcView, linkController], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'file',
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 11,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [5, 51],
          },
        ]),
      },
    ]),
  });

  const configJSON = config.toJSON();
  return configJSON;
}

export const linkControllerDemo = generateLinkControllerConfig();
