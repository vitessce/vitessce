import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';

function generateBlinConfig(storeType) {
  let omeFileType = 'image.ome-zarr';
  let omeUrl = 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr';
  let omeFileUid = 'idr0062-blin-nuclearsegmentation';

  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Blin et al., PLoS Biol 2019',
  });

  if (storeType === 'zip') {
    omeFileType = 'image.ome-zarr.zip';
    omeUrl = 'https://drive.google.com/file/d/1-QwsYNxARvt2ThgUJ0YJ7MtJAHkn9W1h/view?usp=sharing';
    omeFileUid = 'placeholder';
  }

  const dataset = config.addDataset('My dataset').addFile({
    fileType: omeFileType,
    url: omeUrl,
    coordinationValues: {
      fileUid: omeFileUid,
    },
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');

  config.linkViewsByObject([spatialView, lcView], {
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

  config.layout(hconcat(spatialView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

function generateSideBySideConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Comparison of volumetric rendering algorithms. Blin et al., PLoS Biol 2019',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr',
    coordinationValues: {
      fileUid: 'idr0062-blin-nuclearsegmentation',
    },
  });

  const spatialLeft = config.addView(dataset, 'spatialBeta')
    .setProps({ title: 'Additive' });
  const spatialRight = config.addView(dataset, 'spatialBeta')
    .setProps({ title: 'MIP' });
  const lcView = config.addView(dataset, 'layerControllerBeta');

  config.linkViewsByObject([spatialLeft, spatialRight, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
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

  const additiveScopes = config.addCoordinationByObject({
    volumetricRenderingAlgorithm: 'additive',
  });
  const mipScopes = config.addCoordinationByObject({
    volumetricRenderingAlgorithm: 'maximumIntensityProjection',
  });

  const metaCoordinationScopeAdditive = config.addMetaCoordination();
  metaCoordinationScopeAdditive.useCoordinationByObject(additiveScopes);

  const metaCoordinationScopeMip = config.addMetaCoordination();
  metaCoordinationScopeMip.useCoordinationByObject(mipScopes);

  spatialLeft.useMetaCoordination(metaCoordinationScopeAdditive);
  spatialRight.useMetaCoordination(metaCoordinationScopeMip);

  config.layout(hconcat(spatialLeft, spatialRight, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const blinOop2019 = generateBlinConfig(null);
export const blinOop2019Zip = generateBlinConfig('zip');
export const blinSideBySide2019 = generateSideBySideConfig();
