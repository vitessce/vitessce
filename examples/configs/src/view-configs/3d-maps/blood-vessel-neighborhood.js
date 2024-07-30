import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';


function generateBloodVesselNeighborhood() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Blood Vessel Neighborhood',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/sorger/bloodVessel_bigger.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/sorger/bloodVessel_bigger.offsets.json',
    },
    coordinationValues: {
      fileUid: 'melanoma',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta', { x: 0, y: 0, w: 8, h: 8 })
    .setProps({ three: true });
  const description = config.addView(dataset, 'description', { x: 8, y: 1, w: 4, h: 2 })
    .setProps({ description: "To connect your mixed reality headset to this instance, navigate the web browser of your headset to: http://vitessce.link. Enter this 4 digit code: 8976. Next, move any slider in the channel controller. This will link the two sessions. As soon as the data is loaded (loading indicator disappears) in the headset, toggle the 3D button (top right of the channel controller, if it's not on yet). As soon as the dataset has loaded in the spatial view, you can select the \"Enter AR\" button." });
  const lcView = config.addView(dataset, 'layerControllerBeta', { x: 8, y: 0, w: 4, h: 6 });
  config.linkViewsByObject([spatialThreeView, lcView, description], {
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
            spatialTargetC: 13,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [2, 53],
          },
          {
            spatialTargetC: 4,
            spatialChannelColor: [0, 255, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [525, 5863],
          },
          {
            spatialTargetC: 8,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [134, 24050],
          },
          {
            spatialTargetC: 5,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [457, 20591],
          },
        ]),
      },
    ]),
  });
  // config.layout(hconcat(spatialThreeView, vconcat(lcView,description)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const bloodVesselNeighborhood = generateBloodVesselNeighborhood();
