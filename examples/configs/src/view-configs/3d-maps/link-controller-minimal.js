import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';


function generateLinkControllerMinimalConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Link controller demo',
  });
  const dataset = config.addDataset('Template')
  // .addFile({
  //   fileType: 'image.ome-tiff',
  //  // url: 'https://data-2.vitessce.io/data/redBloodCell.ome.tiff',
  //   coordinationValues: {
  //     fileUid: 'file',
  //   },
  // })

  const linkController = config.addView(dataset, 'linkController', {
    x: 0,
    y: 0,
    w: 5,
    h: 8,
  }).setProps({linkID: 5454});

  // config.addView(linkController);

  const configJSON = config.toJSON();
  return configJSON;
}

export const linkControllerMinimal = generateLinkControllerMinimalConfig();
