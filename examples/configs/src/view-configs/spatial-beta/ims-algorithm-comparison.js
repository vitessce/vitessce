import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';


function generateImsConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'My config',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/A/0/a237639c-a956-414e-8b09-f5f83353a685',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/A/0/fd45d077-b163-488d-b5b7-cd5a44b5f66f',
    },
    coordinationValues: {
      fileUid: 'SIMPLE',
    },
  }).addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/B/0/d1edb67a-52da-4bf2-8f20-0bbf82991f4a',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/B/0/e55efb60-0c85-4fd5-b50c-ddd185820453',
    },
    coordinationValues: {
      fileUid: 'GAUSSIAN',
    },
  }).addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/C/0/fdf3dd15-d9ee-489a-abd3-0770f21ab2b6',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/C/0/10a8c76a-84fb-4963-a97e-be8eae0648e7',
    },
    coordinationValues: {
      fileUid: 'AREA',
    },
  })
    .addFile({
      fileType: 'image.ome-tiff',
      url: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/D/0/c2bece1d-1027-4076-a7dc-e661870c3749',
      options: {
        offsetsUrl: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/D/0/aea71c16-a9ab-4c79-98ce-a412b4aa9223',
      },
      coordinationValues: {
        fileUid: 'LINEAR',
      },
    });


  const [
    targetC1Scope,
    targetC2Scope,
    channelColor1Scope,
    channelColor2Scope,
    channelVisible1Scope,
    channelVisible2Scope,
    channelOpacity1Scope,
    channelOpacity2Scope,
    channelWindow1Scope,
    channelWindow2Scope,
  ] = config.addCoordination(
    'spatialTargetC',
    'spatialTargetC',
    'spatialChannelColor',
    'spatialChannelColor',
    'spatialChannelVisible',
    'spatialChannelVisible',
    'spatialChannelOpacity',
    'spatialChannelOpacity',
    'spatialChannelWindow',
    'spatialChannelWindow',
  );
  targetC1Scope.setValue(0);
  targetC2Scope.setValue(1);
  channelColor1Scope.setValue([255, 255, 255]);
  channelColor2Scope.setValue([0, 0, 255]);
  channelVisible1Scope.setValue(true);
  channelVisible2Scope.setValue(true);
  channelOpacity1Scope.setValue(1);
  channelOpacity2Scope.setValue(1);
  channelWindow1Scope.setValue([0, 1341]);
  channelWindow2Scope.setValue([0, 1000]);

  const simpleScopes = config.addCoordinationByObject({
    fileUid: 'SIMPLE',
  });
  const gaussianScopes = config.addCoordinationByObject({
    fileUid: 'GAUSSIAN',
  });
  const areaScopes = config.addCoordinationByObject({
    fileUid: 'AREA',
  });
  const linearScopes = config.addCoordinationByObject({
    fileUid: 'LINEAR',
  });
  const sharedScopes = config.addCoordinationByObject({
    imageLayer: CL([
      {
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        photometricInterpretation: 'BlackIsZero',
        imageChannel: CL([
          {
            spatialTargetC: targetC1Scope,
            spatialChannelColor: channelColor1Scope,
            spatialChannelVisible: channelVisible1Scope,
            spatialChannelOpacity: channelOpacity1Scope,
            spatialChannelWindow: channelWindow1Scope,
          },
          {
            spatialTargetC: targetC2Scope,
            spatialChannelColor: channelColor2Scope,
            spatialChannelVisible: channelVisible2Scope,
            spatialChannelOpacity: channelOpacity2Scope,
            spatialChannelWindow: channelWindow2Scope,
          },
        ]),
      },
    ]),
  });

  const metaCoordinationScopeSimple = config.addMetaCoordination();
  metaCoordinationScopeSimple.useCoordinationByObject(simpleScopes);

  const metaCoordinationScopeGaussian = config.addMetaCoordination();
  metaCoordinationScopeGaussian.useCoordinationByObject(gaussianScopes);

  const metaCoordinationScopeArea = config.addMetaCoordination();
  metaCoordinationScopeArea.useCoordinationByObject(areaScopes);

  const metaCoordinationScopeLinear = config.addMetaCoordination();
  metaCoordinationScopeLinear.useCoordinationByObject(linearScopes);

  const metaCoordinationScopeShared = config.addMetaCoordination();
  metaCoordinationScopeShared.useCoordinationByObject(sharedScopes);

  const spatialViewSimple = config.addView(dataset, 'spatialBeta');
  const spatialViewGaussian = config.addView(dataset, 'spatialBeta');
  const spatialViewArea = config.addView(dataset, 'spatialBeta');
  const spatialViewLinear = config.addView(dataset, 'spatialBeta');
  const lcViewSimple = config.addView(dataset, 'layerControllerBeta');
  const lcViewGaussian = config.addView(dataset, 'layerControllerBeta');
  const lcViewArea = config.addView(dataset, 'layerControllerBeta');
  const lcViewLinear = config.addView(dataset, 'layerControllerBeta');

  spatialViewSimple.useMetaCoordination(metaCoordinationScopeSimple);
  spatialViewGaussian.useMetaCoordination(metaCoordinationScopeGaussian);
  spatialViewArea.useMetaCoordination(metaCoordinationScopeArea);
  spatialViewLinear.useMetaCoordination(metaCoordinationScopeLinear);

  lcViewSimple.useMetaCoordination(metaCoordinationScopeSimple);
  lcViewGaussian.useMetaCoordination(metaCoordinationScopeGaussian);
  lcViewArea.useMetaCoordination(metaCoordinationScopeArea);
  lcViewLinear.useMetaCoordination(metaCoordinationScopeLinear);

  spatialViewSimple.useMetaCoordination(metaCoordinationScopeShared);
  spatialViewGaussian.useMetaCoordination(metaCoordinationScopeShared);
  spatialViewArea.useMetaCoordination(metaCoordinationScopeShared);
  spatialViewLinear.useMetaCoordination(metaCoordinationScopeShared);

  lcViewSimple.useMetaCoordination(metaCoordinationScopeShared);
  lcViewGaussian.useMetaCoordination(metaCoordinationScopeShared);
  lcViewArea.useMetaCoordination(metaCoordinationScopeShared);
  lcViewLinear.useMetaCoordination(metaCoordinationScopeShared);

  config.layout(
    vconcat(
      hconcat(spatialViewSimple, spatialViewGaussian, spatialViewArea, spatialViewLinear),
      hconcat(lcViewSimple, lcViewGaussian, lcViewArea, lcViewLinear),
    ),
  );

  const configJSON = config.toJSON();
  return configJSON;
}

export const imsAlgorithmComparison = generateImsConfig();
