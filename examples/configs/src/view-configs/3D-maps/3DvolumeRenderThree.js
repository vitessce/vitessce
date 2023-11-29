import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateBlinConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Blin et al., PLoS Biol 2019',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr',
    coordinationValues: {
      fileUid: 'idr0062-blin-nuclearsegmentation',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialThree');
  const lcView = config.addView(dataset, 'layerControllerBeta');

  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'idr0062-blin-nuclearsegmentation',
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

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}
export const blinOop2019Three = generateBlinConfig();
