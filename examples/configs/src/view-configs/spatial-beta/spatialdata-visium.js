/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

// Sample ST8059049 from E-MTAB-11114
// Reference: https://github.com/giovp/spatialdata-sandbox/blob/3da0af016d3ddd85f1d63a9c03a67b240b012bd0/visium/README.md

function generateVisiumConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Kleshchevnikov et al., Nature Biotechnology 2022',
    description: 'Mouse brain section profiled by 10x Visium and converted to SpatialData by Marconato et al., bioRxiv 2023.',
  });
  const baseUrl = 'http://localhost:8000/from-tong/lowerlimb.zarr';
  const dataset1 = config.addDataset('D1').addFile({
    fileType: 'image.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/region_raw_image',
    },
    coordinationValues: {
      fileUid: 'ST8059049',
    },
  });
  // TODO: add second image in second dataset.

  const spatialView = config.addView(dataset1, 'spatialBeta');
  const lcView = config.addView(dataset1, 'layerControllerBeta');
  const heatmap = config.addView(dataset1, 'heatmap');
  // const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset1, 'featureList');

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['Slc25a4']);

  config.linkViewsByObject([spatialView, lcView], {
    spatialTargetZ: 0,
    spatialTargetT: 0,
    obsType: 'spot', // TODO: remove this after auto-initialization is supported per-layer/per-layer-channel.
    // For now, cheating by allowing the spotLayer to fall back to the auto-initialized values for the view.
    imageLayer: CL({
      fileUid: 'ST8059049',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      photometricInterpretation: 'BlackIsZero',
      imageChannel: CL([
        {
          spatialTargetC: 0,
          spatialChannelColor: [255, 255, 255],
          spatialChannelWindow: [0, 2000],
          spatialChannelVisible: true,
          spatialChannelOpacity: 1,
        },
      ]),
    }),
  });

  config.linkViews([featureList, heatmap], ['obsType'], ['spot']);

  featureList.useCoordination(featureSelectionScope);
  heatmap.useCoordination(featureSelectionScope);

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumSpatialdata2023 = generateVisiumConfig();
