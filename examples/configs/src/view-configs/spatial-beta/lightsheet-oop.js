import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/b6eba6afe660a8a85c2648e368b0cf9f

function generateLightsheetConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'My config',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/1f99c0bc4fd3a60bb569410878e4a817/ometiff-pyramids/Level0/Channel1/UFL0006-LY09-1-1.ome.tif?token=',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/1f99c0bc4fd3a60bb569410878e4a817/output_offsets/Level0/Channel1/UFL0006-LY09-1-1.offsets.json?token=',
    },
    coordinationValues: {
      fileUid: 'UFL0006-LY09-1-1',
    },
  });

  const imageScopes = config.addCoordinationByObject({
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'UFL0006-LY09-1-1',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        photometricInterpretation: 'BlackIsZero',
        volumetricRenderingAlgorithm: 'maximumIntensityProjection',
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

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useCoordinationByObject(imageScopes);


  const spatialViewSimple = config.addView(dataset, 'spatialBeta');
  const lcViewSimple = config.addView(dataset, 'layerControllerBeta');

  spatialViewSimple.useMetaCoordination(metaCoordinationScope);
  lcViewSimple.useMetaCoordination(metaCoordinationScope);

  config.layout(hconcat(spatialViewSimple, lcViewSimple));

  const configJSON = config.toJSON();
  return configJSON;
}


export const lightsheetOop2023 = generateLightsheetConfig();
