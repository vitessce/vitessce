import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
} from '@vitessce/config';


function generateCellNeighborhoodConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Figure6n_cell_community',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/sorger/cell_community_new.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/sorger/cell_community_new.offsets.json',
    },
    coordinationValues: {
      fileUid: 'melanoma',
    },
  }).addFile({
    fileType: 'obsSegmentations.glb',
    url: 'https://data-2.vitessce.io/data/sorger/cells_from_wrl_named.glb',
    options: {
      targetX: -1467,
      targetY: -89,
      targetZ: -24,
      scaleX: 4.0, // 4
      scaleY: 8.0, // 4
      scaleZ: -3.75 / 4.0, // 3
      rotationX: Math.PI / 2.0 + Math.PI / 2.0,
      // rotationX: 3*Math.PI/4,
      // rotationZ: Math.PI,
      // rotationY: Math.PI,
      // rotationX: Math.PI,

      sceneScaleX: 1.0,
      sceneScaleY: 4.0,
      sceneScaleZ: 0.5,
      sceneRotationX: -Math.PI / 2.0,
      sceneRotationZ: Math.PI,
      materialSide: 'back',
    },
    coordinationValues: {
      fileUid: 'Cells',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta')
    .setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');

  const [
    colorEncodingScope,
    glomsObsTypeScope,
    glomsFeatureTypeScope,
    glomsFeatureValueTypeScope,
    glomsFeatureSelectionScope,
  ] = config.addCoordination(
    'obsColorEncoding',
    'obsType',
    'featureType',
    'featureValueType',
    'featureSelection',
  );

  colorEncodingScope.setValue('spatialChannelColor');

  glomsObsTypeScope.setValue('Cells');
  glomsFeatureTypeScope.setValue('feature');
  glomsFeatureValueTypeScope.setValue('value');
  glomsFeatureSelectionScope.setValue(['Volume']);

  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'melanoma',
        spatialLayerOpacity: 0.0,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [245, 2542],
          },
        ]),
      },
    ]),
    segmentationLayer: CL([
      {
        fileUid: 'Cells',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: 'MART1',
            spatialTargetC: 'MART1',
            spatialChannelColor: [0, 217, 3],
            spatialChannelOpacity: 1.0,
            obsColorEncoding: colorEncodingScope,
            spatialChannelVisible: true,
          },
          {
            obsType: 'PD1',
            spatialTargetC: 'PD1',
            spatialChannelColor: [220, 128, 0],
            obsColorEncoding: colorEncodingScope,
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
          },
          {
            obsType: 'FOXP3',
            spatialTargetC: 'FOXP3',
            spatialChannelColor: [187, 0, 0],
            obsColorEncoding: colorEncodingScope,
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
          },
          {
            obsType: 'CD8',
            spatialTargetC: 'CD8',
            spatialChannelColor: [226, 0, 226],
            obsColorEncoding: colorEncodingScope,
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
          },
          {
            obsType: 'CD11c',
            spatialTargetC: 'CD11c',
            spatialChannelColor: [180, 193, 0],
            obsColorEncoding: colorEncodingScope,
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
          },
          {
            obsType: 'CD103',
            spatialTargetC: 'CD103',
            spatialChannelColor: [106, 155, 255],
            obsColorEncoding: colorEncodingScope,
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
          },
          {
            obsType: 'CD4',
            spatialTargetC: 'CD4',
            spatialChannelColor: [0, 144, 144],
            obsColorEncoding: colorEncodingScope,
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
          },
        ]),
      },
    ]),
  });

  /*
    config.layout(hconcat(
      vconcat(spatialThreeView,spatialVolumeView),
      vconcat(lcView,obsSetsView, barPlot)
    ));
  */
  config.layout(hconcat(spatialThreeView, vconcat(lcView)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const cellNeighborhood = generateCellNeighborhoodConfig();
