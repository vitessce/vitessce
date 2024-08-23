import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';


function generateLinkControllerMinimalConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Link controller demo',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/redBloodCell.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/redBloodCell.offsets.json',
    },
    coordinationValues: {
      fileUid: 'melanoma',
    },
  })

  const linkController = config.addView(dataset, 'linkController', {
    x: 0,
    y: 0,
    w: 3,
    h: 8,
  }).setProps({linkID: 1234, send:true, receive:true});

  // config.addView(linkController);

  const configJSON = config.toJSON();
  return configJSON;
}

export const linkControllerMinimal = generateLinkControllerMinimalConfig();
