import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateSorgerBiggerNeighborhood() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Figure3d_tumor_cytoskeleton',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    // url: "https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif?token=",
    // url: "https://data-2.vitessce.io/data/kiemenetal/5xHE.ome.tiff",
    // url: "http://127.0.0.1:8080/cell_community.ome.tif",
    // url: "https://data-2.vitessce.io/data/redBloodCell.ome.tiff",
    url: 'https://data-2.vitessce.io/data/sorger/f8ii.ome.tiff',
    // options: {
    //        offsetsUrl: "https://data-2.vitessce.io/data/kiemenetal/5xHE.offsets.json",
    // },
    coordinationValues: {
      fileUid: 'melanoma',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta')
    .setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
    imageLayer: CL([
      {
        fileUid: 'melanoma',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 2,
            spatialChannelColor: [0, 255, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [725, 10246],
          },
          {
            spatialTargetC: 10,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [725, 10246],
          },
          {
            spatialTargetC: 9,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [720, 8403],
          },
          {
            spatialTargetC: 8,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [525, 5863],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [2063, 10029],
          },
          {
            spatialTargetC: 11,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [2851, 16127],
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const sorgerBiggerNeighborhood = generateSorgerBiggerNeighborhood();
