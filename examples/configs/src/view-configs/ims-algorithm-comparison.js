/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import { VitessceConfig, CoordinationLevel as CL, hconcat, vconcat } from '@vitessce/config';


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
      image: 'SIMPLE',
    },
  }).addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/B/0/d1edb67a-52da-4bf2-8f20-0bbf82991f4a',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/B/0/e55efb60-0c85-4fd5-b50c-ddd185820453',
    },
    coordinationValues: {
      image: 'GAUSSIAN',
    },
  }).addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/C/0/fdf3dd15-d9ee-489a-abd3-0770f21ab2b6',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/C/0/10a8c76a-84fb-4963-a97e-be8eae0648e7',
    },
    coordinationValues: {
      image: 'AREA',
    },
  }).addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/D/0/c2bece1d-1027-4076-a7dc-e661870c3749',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/2ced91fd6d543e79af90313e52ada57d/data/ims/D/0/aea71c16-a9ab-4c79-98ce-a412b4aa9223',
    },
    coordinationValues: {
      image: 'LINEAR',
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
  channelColor2Scope.setValue([255, 0, 0]);
  channelVisible1Scope.setValue(true);
  channelVisible2Scope.setValue(true);
  channelOpacity1Scope.setValue(1);
  channelOpacity2Scope.setValue(1);
  channelWindow1Scope.setValue([0, 1000]);
  channelWindow2Scope.setValue([0, 1000]);

  const simpleScopes = config.addComplexCoordination({
    imageLayer: CL([
      {
        image: 'SIMPLE',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
      },
    ]),
  });
  const gaussianScopes = config.addComplexCoordination({
    imageLayer: CL([
      {
        image: 'GAUSSIAN',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
      },
    ]),
  });
  const sharedScopes = config.addComplexCoordination({
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
  });

  const metaCoordinationScope1 = config.addMetaCoordination();
  metaCoordinationScope1.useComplexCoordination(simpleScopes);

  const metaCoordinationScope2 = config.addMetaCoordination();
  metaCoordinationScope2.useComplexCoordination(gaussianScopes);

  const metaCoordinationScopeShared = config.addMetaCoordination();
  metaCoordinationScopeShared.useComplexCoordination(sharedScopes);

  const spatialView1 = config.addView(dataset, 'spatialBeta');
  const spatialView2 = config.addView(dataset, 'spatialBeta');
  const lcView1 = config.addView(dataset, 'layerControllerBeta');
  const lcView2 = config.addView(dataset, 'layerControllerBeta');
  spatialView1.useMetaCoordination(metaCoordinationScope1);
  spatialView2.useMetaCoordination(metaCoordinationScope2);
  spatialView1.useMetaCoordination(metaCoordinationScopeShared);
  spatialView2.useMetaCoordination(metaCoordinationScopeShared);
  lcView1.useMetaCoordination(metaCoordinationScope1);
  lcView2.useMetaCoordination(metaCoordinationScope2);
  lcView1.useMetaCoordination(metaCoordinationScopeShared);
  lcView2.useMetaCoordination(metaCoordinationScopeShared);

  config.layout(
    vconcat(
      hconcat(spatialView1, spatialView2),
      hconcat(lcView1, lcView2),
    )
  );

  const configJSON = config.toJSON();
  return configJSON;
}

export const imsAlgorithmComparison = generateImsConfig();
