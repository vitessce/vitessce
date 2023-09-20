/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e

function generateMcmicroIoConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'SpatialData example dataset: mcmicro_io.zarr',
  });
  const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-september-2023/mcmicro_io.zarr';
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/exemplar-001_image',
    },
    coordinationValues: {
      fileUid: 'exemplar-image',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'table/table/X',
    },
    coordinationValues: {
      obsType: 'cell',
    },
  }).addFile({
    fileType: 'labels.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'labels/exemplar-001_cells',
    },
    coordinationValues: {
      fileUid: 'cell-bitmask',
      obsType: 'cell',
    },
  })
    .addFile({
      fileType: 'labels.spatialdata.zarr',
      url: baseUrl,
      options: {
        path: 'labels/exemplar-001_nuclei',
      },
      coordinationValues: {
        fileUid: 'nucleus-bitmask',
        obsType: 'nucleus',
      },
    });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const heatmap = config.addView(dataset, 'heatmap');
  // const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['DNA_6']);

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    obsType: 'cell', // TODO: remove this after auto-initialization is supported per-layer/per-layer-channel.
    // For now, cheating by allowing the spotLayer to fall back to the auto-initialized values for the view.
    imageLayer: CL({
      fileUid: 'exemplar-image',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      photometricInterpretation: 'BlackIsZero',
      imageChannel: CL([
        {
          spatialTargetC: 0,
          spatialChannelColor: [255, 255, 255],
          spatialChannelWindow: null,
          spatialChannelVisible: true,
          spatialChannelOpacity: 1,
        },
        {
          spatialTargetC: 1,
          spatialChannelColor: [0, 255, 0],
          spatialChannelWindow: null,
          spatialChannelVisible: false,
          spatialChannelOpacity: 1,
        },
        {
          spatialTargetC: 2,
          spatialChannelColor: [255, 0, 255],
          spatialChannelWindow: null,
          spatialChannelVisible: false,
          spatialChannelOpacity: 1,
        },
      ]),
    }),
    segmentationLayer: CL([
      {
        fileUid: 'cell-bitmask',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelOpacity: 0.9,
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            obsColorEncoding: 'geneSelection',
            spatialSegmentationFilled: false,
            spatialSegmentationStrokeWidth: 0.01,
            obsHighlight: null,
            featureSelection: featureSelectionScope,
            featureValueColormapRange: [0, 0.5],
          },
        ]),
      },
      /*
      {
        fileUid: 'nucleus-bitmask',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1,
        segmentationChannel: CL([
          {
            obsType: 'nucleus',
            spatialTargetC: 0,
            spatialChannelColor: [0, 255, 0],
            spatialChannelOpacity: 0.1,
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            obsColorEncoding: 'spatialChannelColor',
            spatialSegmentationFilled: true,
            spatialSegmentationStrokeWidth: 1.0,
            obsHighlight: null,
          },
        ]),
      },
      */
    ]),
  });

  config.linkViews([/* obsSets, */featureList, heatmap], ['obsType'], ['cell']);

  featureList.useCoordination(featureSelectionScope);
  heatmap.useCoordination(featureSelectionScope);

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, /* obsSets, */ featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const mcmicroIoSpatialdata2023 = generateMcmicroIoConfig();
