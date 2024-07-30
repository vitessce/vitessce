import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateBloodVesselConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Peter Sorger Blood Vessel',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/redBloodCell.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/redBloodCell.offsets.json',
    },
    coordinationValues: {
      fileUid: 'kidney',
    },
  }).addFile({
    fileType: 'obsSegmentations.glb',
    url: 'https://data-2.vitessce.io/data/bloodVessel.glb',
    // url: 'http://127.0.0.1:8080/untitled.glb',
    // url: 'http://127.0.0.1:8081/bloodVEssel.glb',
    options: {
      targetX: -403,
      targetY: -32,
      targetZ: 582,
      scaleX: -1.75,
      scaleY: 0.875,
      scaleZ: 1.75,
      rotationX: 1.57079632679,
      rotationZ: 3.14159265359,
      sceneScaleX: -1.0,
      sceneScaleY: -2.0,
      sceneScaleZ: 1.0,
      sceneRotationX: 1.57079632679,
      materialSide: 'back',
    },
    coordinationValues: {
      fileUid: 'Cells',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta')
    .setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  // const linkController = config.addView(dataset, 'linkController').setProps({code:'1234'})

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

  // const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');

  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    spatialRenderingMode: '3D',
    // spatialRenderingMode:'3D',
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [0, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [1048, 5060],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [0, 255, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [325, 721],
          },
          {
            spatialTargetC: 2,
            spatialChannelColor: [255, 0, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [463, 680],
          },
          {
            spatialTargetC: 9,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [643, 810],
          },
          {
            spatialTargetC: 4,
            spatialChannelColor: [255, 255, 255],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [419, 2175],
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
            // obsType: glomsObsTypeScope,
            obsType: 'Cells',
            // featureType: glomsFeatureTypeScope,
            // featureValueType: glomsFeatureValueTypeScope,
            // featureSelection: glomsFeatureSelectionScope,
            spatialTargetC: 0,
            spatialChannelColor: [202, 122, 166],
            spatialChannelOpacity: 0.5,
            spatialChannelVisible: true,
            obsColorEncoding: colorEncodingScope,
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
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
  // config.layout(hconcat(spatialThreeView, vconcat(lcView, linkController)));
  config.layout(hconcat(spatialThreeView, lcView));

  const configJSON = config.toJSON();
  return configJSON;
}

export const bloodVessel = generateBloodVesselConfig();
