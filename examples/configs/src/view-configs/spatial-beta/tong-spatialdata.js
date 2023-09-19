/* eslint-disable max-len */
import {
    VitessceConfig,
    CoordinationLevel as CL,
    hconcat,
    vconcat,
  } from '@vitessce/config';
  
  // Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e
  
  function generateLowerLimbConfig() {
    const config = new VitessceConfig({
      schemaVersion: '1.0.16',
      name: 'Visium OOP',
    });
    const dataset = config.addDataset('My dataset').addFile({
      fileType: 'image.spatialdata.zarr',
      url: 'http://localhost:8000/from-tong/lowerlimb.zarr',
      options: {
        path: 'images/region_raw_image',
      },
      coordinationValues: {
        fileUid: 'histology-image',
      },
    }).addFile({
      fileType: 'obsFeatureMatrix.spatialdata.zarr',
      url: 'http://localhost:8000/from-tong/lowerlimb.zarr',
      options: {
        path: 'table/table/X',
      },
      coordinationValues: {
        obsType: 'spot',
      },
    }).addFile({
      fileType: 'labels.spatialdata.zarr',
      url: 'http://localhost:8000/from-tong/lowerlimb.zarr',
      options: {
        path: 'labels/region_label_image',
        tablePath: 'table/table',
      },
      coordinationValues: {
        fileUid: 'bitmask-image',
        obsType: 'spot',
      },
    });
  
    const spatialView = config.addView(dataset, 'spatialBeta');
    const lcView = config.addView(dataset, 'layerControllerBeta');
    const heatmap = config.addView(dataset, 'heatmap');
    // const obsSets = config.addView(dataset, 'obsSets');
    const featureList = config.addView(dataset, 'featureList');
  
    config.linkViewsByObject([spatialView, lcView], {
      spatialTargetZ: 0,
      spatialTargetT: 0,
      obsType: 'spot', // TODO: remove this after auto-initialization is supported per-layer/per-layer-channel.
      // For now, cheating by allowing the spotLayer to fall back to the auto-initialized values for the view.
      imageLayer: CL({
        fileUid: 'histology-image',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        photometricInterpretation: 'BlackIsZero',
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1,
            spatialChannelWindow: [0, 255],
          },
        ]),
      }),
      segmentationLayer: CL([
        {
          fileUid: 'bitmask-image',
          spatialLayerVisible: true,
          spatialLayerOpacity: 1,
          segmentationChannel: CL([
            {
              obsType: 'spot',
              spatialTargetC: 0,
              spatialChannelColor: [255, 255, 255],
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
      ]),
    });
  
    config.linkViews([/* obsSets, */featureList, heatmap], ['obsType'], ['spot']);
  
    config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, /* obsSets, */ featureList)));
  
    const configJSON = config.toJSON();
    return configJSON;
  }
  
  
  export const fromTong2023 = generateLowerLimbConfig();
  