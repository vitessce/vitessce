/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateMaynardConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Maynard et al., Nature Neuroscience 2021',
    description: 'Human dorsolateral prefrontal cortex profiled by 10x Genomics Visium',
  });
  const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/maynard-2021/151673.sdata.zarr';
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/visium_151673_full_image',
    },
  }).addFile({
    fileType: 'labels.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'images/visium_151673_annotations',
    },
  }).addFile({
    fileType: 'obsFeatureMatrix.spatialdata.zarr',
    url: baseUrl,
    options: {
      path: 'table/table/layers/logcounts',
      initialFeatureFilterPath: 'table/table/var/is_top_hvg',
    },
    coordinationValues: {
      obsType: 'spot',
    },
  })
    .addFile({
      fileType: 'featureLabels.spatialdata.zarr',
      url: baseUrl,
      options: {
        path: 'table/table/var/gene_name',
      },
    })
    .addFile({
      fileType: 'obsSpots.spatialdata.zarr',
      url: baseUrl,
      options: {
        path: 'shapes/visium_151673',
        tablePath: 'table/table',
      },
      coordinationValues: {
        obsType: 'spot',
      },
    })
    .addFile({
      fileType: 'obsSets.spatialdata.zarr',
      url: baseUrl,
      options: {
        obsSets: [
          {
            name: 'Layer',
            path: 'table/table/obs/layer_manual',
          },
        ],
      },
      coordinationValues: {
        obsType: 'spot',
      },
    });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const lcView = config.addView(dataset, 'layerControllerBeta');
  const heatmap = config.addView(dataset, 'heatmap');
  const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['33334']);

  const [obsColorEncodingScope] = config.addCoordination('obsColorEncoding');
  obsColorEncodingScope.setValue('geneSelection');

  const [channelVisibleScope, channelOpacityScope] = config.addCoordination('spatialChannelVisible', 'spatialChannelOpacity');
  channelVisibleScope.setValue(true);
  channelOpacityScope.setValue(0.5);

  config.linkViewsByObject([spatialView, lcView], {
    spotLayer: CL({
      // featureValueColormapRange: [0, 0.5],
      obsColorEncoding: obsColorEncodingScope,
      featureSelection: featureSelectionScope,
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSpots') });

  config.linkViewsByObject([spatialView, lcView], {
    imageLayer: CL({
      // featureValueColormapRange: [0, 0.5],
      photometricInterpretation: 'RGB',
      // featureSelection: featureSelectionScope,
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });
  config.linkViewsByObject([spatialView, lcView], {
    segmentationLayer: CL([{
      segmentationChannel: CL([
        {
          obsType: 'Layer 1',
          spatialTargetC: 0,
          spatialChannelVisible: channelVisibleScope,
          spatialChannelOpacity: channelOpacityScope,
          spatialChannelColor: [70, 119, 167],
        },
        {
          obsType: 'Layer 2',
          spatialTargetC: 1,
          spatialChannelVisible: channelVisibleScope,
          spatialChannelOpacity: channelOpacityScope,
          spatialChannelColor: [139, 203, 235],
        },
        {
          obsType: 'Layer 3',
          spatialTargetC: 2,
          spatialChannelVisible: channelVisibleScope,
          spatialChannelOpacity: channelOpacityScope,
          spatialChannelColor: [74, 169, 154],
        },
        {
          obsType: 'Layer 4',
          spatialTargetC: 3,
          spatialChannelVisible: channelVisibleScope,
          spatialChannelOpacity: channelOpacityScope,
          spatialChannelColor: [28, 118, 58],
        },
        {
          obsType: 'Layer 5',
          spatialTargetC: 4,
          spatialChannelVisible: channelVisibleScope,
          spatialChannelOpacity: channelOpacityScope,
          spatialChannelColor: [153, 153, 65],
        },
        {
          obsType: 'Layer 6',
          spatialTargetC: 5,
          spatialChannelVisible: channelVisibleScope,
          spatialChannelOpacity: channelOpacityScope,
          spatialChannelColor: [221, 204, 128],
        },
        {
          obsType: 'White Matter',
          spatialTargetC: 6,
          spatialChannelVisible: channelVisibleScope,
          spatialChannelOpacity: channelOpacityScope,
          spatialChannelColor: [202, 104, 119],
        },
      ].reverse()),
    }]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViews([featureList, heatmap, obsSets, spatialView, lcView], ['obsType'], ['spot']);

  featureList.useCoordination(featureSelectionScope);
  heatmap.useCoordination(featureSelectionScope);

  featureList.useCoordination(obsColorEncodingScope);
  heatmap.useCoordination(obsColorEncodingScope);
  obsSets.useCoordination(obsColorEncodingScope);

  config.layout(hconcat(vconcat(spatialView, heatmap), vconcat(lcView, hconcat(featureList, obsSets))));

  const configJSON = config.toJSON();
  return configJSON;
}


export const maynard2021 = generateMaynardConfig();
