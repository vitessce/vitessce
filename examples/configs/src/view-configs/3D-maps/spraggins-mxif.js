import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateSpragginsMxIF() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Spraggins Kidney MxIF',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.ome.tif?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIH2uJYEfV9arocG5Fkigwkpf5EA26axqeKBbiA30btWGAiEAxXqd1SPT%2B2Y3Xyc3bZ%2B%2BWAQ8Zf%2B533NH09LAMiGm8Cgq9QMI2P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDAbBkz4Qhcm%2FEpqPZSrJA2lwjP5J698tPtHsiZ8LcBTk%2F1oIRMzELd7C4qv3%2BO4KgK3o7VHznUJ%2F4RwT9MyRCci131DDDuj%2BqkvEfbIiWbKx2OzEPelrCgnSCfVVgX05%2BxT9NFGNPTwzcnVtQ2KjW7L%2B1q64WKxQ3UvaeyvJvxMQADtRjY6B2T5OVDhJeIhD5%2B4JkYxD%2F2zNqENddaeRPkRUIowWB6X3yuIpGqSxJr%2FIYjnIA4AbQEf7uhnHkZyhaOsPlawoqiO4Jwow2hzC2oG%2FNF0lWBsMoeQg3R%2BcIxWRyp13sb8jggQo1M0Xr42npX5XYReNHHJ%2BMtbtcZBPjxp8w03EAt5Jh%2FYP0xKii%2FjJokXENgdRkp7mlGUK%2Fdt3UFM%2B4iLMk2FJPSI2wX7OudX0vjIWWOpD9aQKNoOuLFAlyr%2BwO3VkvWyUEp3VsBNf7uBiCmV4B5GGTvnNZdSEMeOuWEwbskzqQax1U%2FG6mEQQpY1hr2dXttVAnIlp7MlGfXH2RLsEyAaA6Dd79j0c4jFxU9BVcJrCZ5dIVzexeC1yE%2FLyB3Zu75rC9MSOtbPTd3sfUtzxYk%2FhSQ85TYXVCYLPQmLaNN%2BqUqbvQHZViXZYrEiYCUfup7cwmYmWsAY6lAL74Y1H5jP4TvC7lem1mxyYvO0bLelAIWGqkyL%2BmYAnesJ2gv%2F87T4tUgJhtRgp9IBsZKTziTDV%2BJ4ydWwingCdVEeoEz2r11G8sMXcfgS3T1tBMYmCt7aiPIl8G1oMuZybPPUH9NQ3aTWJx9frhxN0CeNq%2BdZd%2BQTp3rNe1VGJ%2BHW32KS1x6YjYk%2B9NUGvdrYVaHHOKvGsVpLHhRAk6qsRsAjcM20dOWFQLHHa65QYqwqOsx%2F0TlYL3T3Z30F9FzoDbbUS79chjaH5%2BBFIIP%2FBaTSBxcyJZ3L2OGDyXPTXXd67krEpM53oOZ2ppt%2FYMp%2Bt0C5ruRbQzSkqKSdIusJEU%2F%2FKnd7bjWpUZu9P4jqtsdOdsC4%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T145520Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ALZVZRBWD%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=850dedd2834b3d251b7e5ed90fc09a622bf17ddb5369a5132f99a18887804b8f',
    options: {
      offsetsUrl: 'https://hdv-spatial-data.s3.us-east-1.amazonaws.com/spraggings/pyramid.offsets.json?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIH2uJYEfV9arocG5Fkigwkpf5EA26axqeKBbiA30btWGAiEAxXqd1SPT%2B2Y3Xyc3bZ%2B%2BWAQ8Zf%2B533NH09LAMiGm8Cgq9QMI2P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgwxMzY1NzY1MjIwNDgiDAbBkz4Qhcm%2FEpqPZSrJA2lwjP5J698tPtHsiZ8LcBTk%2F1oIRMzELd7C4qv3%2BO4KgK3o7VHznUJ%2F4RwT9MyRCci131DDDuj%2BqkvEfbIiWbKx2OzEPelrCgnSCfVVgX05%2BxT9NFGNPTwzcnVtQ2KjW7L%2B1q64WKxQ3UvaeyvJvxMQADtRjY6B2T5OVDhJeIhD5%2B4JkYxD%2F2zNqENddaeRPkRUIowWB6X3yuIpGqSxJr%2FIYjnIA4AbQEf7uhnHkZyhaOsPlawoqiO4Jwow2hzC2oG%2FNF0lWBsMoeQg3R%2BcIxWRyp13sb8jggQo1M0Xr42npX5XYReNHHJ%2BMtbtcZBPjxp8w03EAt5Jh%2FYP0xKii%2FjJokXENgdRkp7mlGUK%2Fdt3UFM%2B4iLMk2FJPSI2wX7OudX0vjIWWOpD9aQKNoOuLFAlyr%2BwO3VkvWyUEp3VsBNf7uBiCmV4B5GGTvnNZdSEMeOuWEwbskzqQax1U%2FG6mEQQpY1hr2dXttVAnIlp7MlGfXH2RLsEyAaA6Dd79j0c4jFxU9BVcJrCZ5dIVzexeC1yE%2FLyB3Zu75rC9MSOtbPTd3sfUtzxYk%2FhSQ85TYXVCYLPQmLaNN%2BqUqbvQHZViXZYrEiYCUfup7cwmYmWsAY6lAL74Y1H5jP4TvC7lem1mxyYvO0bLelAIWGqkyL%2BmYAnesJ2gv%2F87T4tUgJhtRgp9IBsZKTziTDV%2BJ4ydWwingCdVEeoEz2r11G8sMXcfgS3T1tBMYmCt7aiPIl8G1oMuZybPPUH9NQ3aTWJx9frhxN0CeNq%2BdZd%2BQTp3rNe1VGJ%2BHW32KS1x6YjYk%2B9NUGvdrYVaHHOKvGsVpLHhRAk6qsRsAjcM20dOWFQLHHa65QYqwqOsx%2F0TlYL3T3Z30F9FzoDbbUS79chjaH5%2BBFIIP%2FBaTSBxcyJZ3L2OGDyXPTXXd67krEpM53oOZ2ppt%2FYMp%2Bt0C5ruRbQzSkqKSdIusJEU%2F%2FKnd7bjWpUZu9P4jqtsdOdsC4%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240328T145555Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAR7TEYK5ALZVZRBWD%2F20240328%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c4e31a03251d8733acfe3a026006b18466fa45daccb5cd9a0f53cb501f7df709',
    },
    coordinationValues: {
      fileUid: 'kidney',
    },
  });


  const spatialThreeView = config.addView(dataset, 'spatialBeta')
    .setProps({ threeFor3d: true });
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
            spatialTargetC: 8,
            spatialChannelColor: [221, 52, 151],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [6, 134],
          },
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [4, 95],
          },
          // {
          //     spatialTargetC: 0,
          //     spatialChannelColor: [255, 0, 0],
          //     spatialChannelVisible: true,
          //     spatialChannelOpacity: 1.0,
          //     spatialChannelWindow: null,
          // },
        ]),
      },
    ]),
  });

  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const spragginsMxIF = generateSpragginsMxIF();
