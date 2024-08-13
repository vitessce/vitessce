import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
} from '@vitessce/config';

function generateJainKidneyDecimatedConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Jain Kidney Decimated 2024',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/washu-kidney/LS_20x_5_Stitched.pyramid.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/washu-kidney/LS_20x_5_Stitched.pyramid.offsets.json',
    },
    coordinationValues: {
      fileUid: 'kidney',
    },
  }).addFile({
    fileType: 'obsSegmentations.glb',
    url: 'https://data-2.vitessce.io/data/washu-kidney/decimated.glb',
    options: {
      targetX: 430,
      targetY: -520,
      targetZ: -420,
      scaleX: -0.275,
      scaleY: 0.034375,
      scaleZ: 0.275,
      rotationX: 1.57079632679,
      sceneScaleX: 1.0,
      sceneScaleY: 1.0,
      sceneScaleZ: 8.0,
      materialSide: 'back',
    },
    coordinationValues: {
      fileUid: 'gloms',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: 'https://data-2.vitessce.io/data/washu-kidney/statistics.csv',
    coordinationValues: {
      obsType: 'gloms',
      featureType: 'feature',
      featureValueType: 'value',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta').setProps({ three: true });
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const obsSetsView = config.addView(dataset, 'obsSets');
  const barPlot = config.addView(dataset, 'featureBarPlot').setProps({
    yUnits: 'microns cubed',
  });

  const [
    selectionScope,
    colorScope,
    highlightScope,
    colorEncodingScope,
    glomsObsTypeScope,
    glomsFeatureTypeScope,
    glomsFeatureValueTypeScope,
    glomsFeatureSelectionScope,
  ] = config.addCoordination(
    'obsSetSelection',
    'obsSetColor',
    'obsHighlight',
    'obsColorEncoding',
    'obsType',
    'featureType',
    'featureValueType',
    'featureSelection',
  );

  colorEncodingScope.setValue('spatialChannelColor');

  glomsObsTypeScope.setValue('gloms');
  glomsFeatureTypeScope.setValue('feature');
  glomsFeatureValueTypeScope.setValue('value');
  glomsFeatureSelectionScope.setValue(['Volume']);

  // const [selectionScope, colorScope] = config.addCoordination('obsSetSelection', 'obsSetColor');
  obsSetsView.useCoordination(selectionScope, colorScope);

  config.linkViewsByObject([spatialThreeView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'kidney',
        spatialLayerOpacity: 1,
        photometricInterpretation: 'BlackIsZero',
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [221, 52, 151],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [773, 7733],
          },
          {
            spatialTargetC: 1,
            spatialChannelColor: [29, 145, 192],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            spatialChannelWindow: [2290, 6724],
          },
        ]),
      },
    ]),
    segmentationLayer: CL([
      {
        fileUid: 'gloms',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: glomsObsTypeScope,
            featureType: glomsFeatureTypeScope,
            featureValueType: glomsFeatureValueTypeScope,
            featureSelection: glomsFeatureSelectionScope,
            spatialTargetC: 'gloms',
            spatialChannelColor: [253, 174, 107],
            spatialChannelOpacity: 0.5,
            spatialChannelVisible: true,
            obsColorEncoding: colorEncodingScope,
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
            obsHighlight: highlightScope,
            obsSetSelection: selectionScope,
            obsSetColor: colorScope,
          },
        ]),
      },
    ]),
  });
  config.linkViewsByObject([barPlot], {
    obsType: glomsObsTypeScope,
    featureType: glomsFeatureTypeScope,
    featureValueType: glomsFeatureValueTypeScope,
    featureSelection: glomsFeatureSelectionScope,
    obsHighlight: highlightScope,
    obsSetSelection: selectionScope,
    obsSetColor: colorScope,
    obsColorEncoding: colorEncodingScope,
  }, { meta: false });

  /*
    config.layout(hconcat(
      vconcat(spatialThreeView,spatialVolumeView),
      vconcat(lcView,obsSetsView, barPlot)
    ));
  */
  config.layout(hconcat(spatialThreeView, vconcat(lcView, vconcat(obsSetsView, barPlot))));

  const configJSON = config.toJSON();
  return configJSON;
}

export const jainkidneyDecimated = generateJainKidneyDecimatedConfig();
