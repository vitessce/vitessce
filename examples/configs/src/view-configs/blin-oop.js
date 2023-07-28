import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateBlinConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'My config',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr',
    coordinationValues: {
      fileUid: 'idr0062-blin-nuclearsegmentation',
    },
  });

  const imageScopes = config.addComplexCoordination({
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

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useComplexCoordination(imageScopes);


  const spatialViewSimple = config.addView(dataset, 'spatialBeta');

  const lcViewSimple = config.addView(dataset, 'layerControllerBeta');


  spatialViewSimple.useMetaCoordination(metaCoordinationScope);
  lcViewSimple.useMetaCoordination(metaCoordinationScope);


  config.layout(hconcat(spatialViewSimple, lcViewSimple));

  const configJSON = config.toJSON();
  return configJSON;
}

function generateSideBySideConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'My config',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr',
    coordinationValues: {
      fileUid: 'idr0062-blin-nuclearsegmentation',
    },
  });

  const additiveScopes = config.addComplexCoordination({
    volumetricRenderingAlgorithm: 'additive',
  });
  const mipScopes = config.addComplexCoordination({
    volumetricRenderingAlgorithm: 'maximumIntensityProjection',
  });

  const imageScopes = config.addComplexCoordination({
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

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useComplexCoordination(imageScopes);

  const metaCoordinationScopeAdditive = config.addMetaCoordination();
  metaCoordinationScopeAdditive.useComplexCoordination(additiveScopes);

  const metaCoordinationScopeMip = config.addMetaCoordination();
  metaCoordinationScopeMip.useComplexCoordination(mipScopes);


  const spatialLeft = config.addView(dataset, 'spatialBeta')
    .setProps({ title: 'Additive' });
  const spatialRight = config.addView(dataset, 'spatialBeta')
    .setProps({ title: 'MIP' });
  const lcView = config.addView(dataset, 'layerControllerBeta');


  spatialLeft.useMetaCoordination(metaCoordinationScope);
  spatialRight.useMetaCoordination(metaCoordinationScope);
  lcView.useMetaCoordination(metaCoordinationScope);

  spatialLeft.useMetaCoordination(metaCoordinationScopeAdditive);
  spatialRight.useMetaCoordination(metaCoordinationScopeMip);

  config.layout(hconcat(spatialLeft, spatialRight, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const blinOop2019 = generateBlinConfig();
export const blinSideBySide2019 = generateSideBySideConfig();