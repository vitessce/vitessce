import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/preview/multimodal-mass-spectrometry-imaging-data

function generateThreeMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Human Liver',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    // url: "https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif?token=",
    // url: "https://data-2.vitessce.io/data/kiemenetal/5xHE.ome.tiff",
    // url: "http://127.0.0.1:8080/cell_community.ome.tif",
    // url: "https://data-2.vitessce.io/data/redBloodCell.ome.tiff",
    // url: "https://data-2.vitessce.io/data/sorger/f8ii.ome.tiff",
    url: 'https://storage.googleapis.com/vitessce-data/0.0.31/master_release/tian/human_3d.raster.pyramid.ome.tiff',
    // options: {
    //        offsetsUrl: "https://data-2.vitessce.io/data/kiemenetal/5xHE.offsets.json",
    // },
    coordinationValues: {
      fileUid: 'kidney',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta').setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [0, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.314, 1.570],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.44, 1.57],
          },
          {
            spatialTargetC: 2,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.5, 1.57],
          },
          {
            spatialTargetC: 3,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [0.86, 1.57],
          },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const humanLiver = generateThreeMinimalConfiguration();
