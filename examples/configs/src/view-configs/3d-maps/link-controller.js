import {
  VitessceConfig,
  CoordinationLevel as CL,
} from '@vitessce/config';


function generateLinkControllerConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Link controller demo',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/redBloodCell.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/redBloodCell.offsets.json',
    },
    coordinationValues: {
      fileUid: 'melanoma',
    },
  }).addFile({
    fileType: 'obsSegmentations.glb',
    url: 'https://data-2.vitessce.io/data/bloodVesselNamed.glb',
    options: {
      targetX: 403,
      targetY: -582,
      targetZ: 33,
      scaleX: 1.75,
      scaleY: 1.75,
      scaleZ: -1.75 / 3.0,
      // rotationX: 1.57079632679,
      rotationZ: 3.14159265359,
      sceneScaleX: 1.0,
      sceneScaleY: 1.0,
      sceneScaleZ: 3.0,
      // sceneRotationX: 1.57079632679,
      materialSide: 'back',
    },
    coordinationValues: {
      fileUid: 'skeleton',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta', {x: 0, y: 0, w: 8, h: 8})
    .setProps({three: true});
  const lcView = config.addView(dataset, 'layerControllerBeta', {x: 8, y: 0, w: 4, h: 6});
  const linkController = config.addView(dataset, 'linkController', {
    x: 8,
    y: 1,
    w: 4,
    h: 2,
  }).setProps({linkID: 1234, send:true, receive:true});
  const [
    glomsObsTypeScope,
    glomsFeatureTypeScope,
    glomsFeatureValueTypeScope,
    glomsFeatureSelectionScope,
  ] = config.addCoordination(
    'obsType',
    'featureType',
    'featureValueType',
    'featureSelection',
  );


  glomsObsTypeScope.setValue('Cells');
  glomsFeatureTypeScope.setValue('feature');
  glomsFeatureValueTypeScope.setValue('value');
  glomsFeatureSelectionScope.setValue(['Volume']);


  config.linkViewsByObject([spatialThreeView, lcView, linkController], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'melanoma',
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 11,
            spatialChannelColor: [255, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [5, 51],
          },
        ]),
      },
    ]),
    segmentationLayer: CL([
      {
        fileUid: 'skeleton',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            // obsType: glomsObsTypeScope,
            obsType: 'B-Cell',
            spatialTargetC: 'B-Cell',
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialChannelColor: [240, 252, 3],
            spatialChannelOpacity: 1.0,
            obsColorEncoding: 'spatialChannelColor',
            spatialChannelVisible: true,
            obsSetSelection: [],
          },
          {
            obsType: 'Red Blood Cell',
            spatialTargetC: 'Red',
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialChannelColor: [252, 15, 3],
            obsColorEncoding: 'spatialChannelColor',
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
            obsSetSelection: [],
          },
          {
            obsType: 'CD11B+ Cell',
            spatialTargetC: 'CD11B+',
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialChannelColor: [252, 3, 252],
            obsColorEncoding: 'spatialChannelColor',
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
            obsSetSelection: [],
          },
          {
            obsType: 'Vessel',
            spatialTargetC: 'Vessel',
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialChannelColor: [3, 252, 82],
            obsColorEncoding: 'spatialChannelColor',
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
            obsSetSelection: [],
          },
          {
            obsType: 'beta-Catenin',
            spatialTargetC: 'β-Catenin',
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialChannelColor: [3, 7, 252],
            obsColorEncoding: 'spatialChannelColor',
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
            obsSetSelection: [],
          },
          {
            obsType: 'Vimentin',
            spatialTargetC: 'Vimentin',
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialChannelColor: [232, 232, 232],
            obsColorEncoding: 'spatialChannelColor',
            spatialChannelOpacity: 1.0,
            spatialChannelVisible: true,
            obsSetSelection: [],
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
  // config.layout(hconcat(spatialThreeView, vconcat(lcView, description)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const linkControllerDemo = generateLinkControllerConfig();
