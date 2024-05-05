import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
} from '@vitessce/config';

function generateXRDevExample() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Jain Kidney 2024',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/30bc1823e0c19be58557fb979499bac2/ometiff-pyramids/data/3D_image_stack.ome.tif?token=',
    coordinationValues: {
      fileUid: 'kidney',
    },
  }).addFile({
    fileType: 'obsSegmentations.glb',
    url: 'https://192.168.0.24:8081/decimated_gloms_compressed.glb',
    coordinationValues: {
      fileUid: 'gloms',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: 'https://192.168.0.24:8081/statistics.csv',
    coordinationValues: {
      obsType: 'gloms',
      featureType: 'feature',
      featureValueType: 'value',
    },
  });

  const spatialThreeView = config.addView(dataset, 'spatialBeta')
    .setProps({ threeFor3d: true });
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

  // config.linkViewsByObject([spatialThreeView,spatialVolumeView, lcView], {
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
            spatialTargetC: 0,
            spatialChannelColor: [202, 122, 166],
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
  }, false);

  /*
    config.layout(hconcat(
      vconcat(spatialThreeView,spatialVolumeView),
      vconcat(lcView,obsSetsView, barPlot)
    ));
  */
  config.layout(hconcat(spatialThreeView, vconcat(lcView, obsSetsView, barPlot)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const xrDevExample = generateXRDevExample();
