import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
} from '@vitessce/config';


function generateCodexConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'My config',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/ometiff-pyramids/pipeline_output/expr/reg001_expr.ome.tif?token=',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/output_offsets/pipeline_output/expr/reg001_expr.offsets.json?token=',
    },
    coordinationValues: {
      fileUid: 'reg001_expr',
    },
  }).addFile({
    fileType: 'obsSegmentations.ome-tiff',
    url: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/ometiff-pyramids/pipeline_output/mask/reg001_mask.ome.tif?token=',
    options: {
      offsetsUrl: 'https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/output_offsets/pipeline_output/mask/reg001_mask.offsets.json?token=',
    },
    coordinationValues: {
      fileUid: 'reg001_mask',
    },
  });

  const imageScopes = config.addCoordinationByObject({
    spatialTargetZ: 0,
    spatialTargetT: 0,
    imageLayer: CL([
      {
        fileUid: 'reg001_expr',
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
    segmentationLayer: CL([
      {
        fileUid: 'reg001_mask',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialTargetC: 0,
            spatialChannelColor: [255, 255, 255],
            spatialChannelOpacity: 1.0,
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
          },
          {
            obsType: 'nucleus',
            spatialTargetC: 1,
            spatialChannelColor: [91, 181, 231],
            spatialChannelOpacity: 1.0,
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: false,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: true,
            spatialSegmentationStrokeWidth: 1,
          },
        ]),
      },
    ]),
  });

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useCoordinationByObject(imageScopes);


  const spatialViewSimple = config.addView(dataset, 'spatialBeta');
  const lcViewSimple = config.addView(dataset, 'layerControllerBeta');

  spatialViewSimple.useMetaCoordination(metaCoordinationScope);
  lcViewSimple.useMetaCoordination(metaCoordinationScope);

  config.layout(hconcat(spatialViewSimple, lcViewSimple));

  const configJSON = config.toJSON();
  return configJSON;
}


export const codexOop2023 = generateCodexConfig();
