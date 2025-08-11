/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateVisiumHdConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.18',
    name: 'Visium HD dataset',
    description: 'Visium HD Spatial Gene Expression Library, Mouse Small Intestine (FFPE)',
  });
  const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-august-2025/visium_hd_3.0.0.spatialdata.zarr';
  const dataset1 = config.addDataset('Visium HD').addFile({
    fileType: 'spatialdata.zarr',
    url: baseUrl,
    options: {
        image: {
            path: 'images/Visium_HD_Mouse_Small_Intestine_full_image',
        },
        obsFeatureMatrix: {
            path: 'tables/square_016um/X',
        },
        obsSegmentations: {
            path: 'labels/rasterized_016um',
        },
        obsEmbedding: [{
            path: 'tables/square_016um/obsm/X_umap',
            embeddingType: 'UMAP',
        }],
        coordinateSystem: 'Visium_HD_Mouse_Small_Intestine',
    },
    coordinationValues: {
        obsType: 'bin',
    }
  });

  const spatialView = config.addView(dataset1, 'spatialBeta');
  const lcView = config.addView(dataset1, 'layerControllerBeta');
  // const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset1, 'featureList');
  const scatterplot = config.addView(dataset1, 'scatterplot');

  const [featureValueColormapRangeScope] = config.addCoordination('featureValueColormapRange');
  featureValueColormapRangeScope.setValue([0, 0.33]);

  config.linkViewsByObject([spatialView, lcView], {
    imageLayer: CL({
      photometricInterpretation: 'RGB',
    }),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });
  config.linkViewsByObject([spatialView, lcView], {
    segmentationLayer: CL([{
        segmentationChannel: CL([{
            'spatialChannelOpacity': 0.7,
            'obsColorEncoding': 'geneSelection',
            'featureValueColormapRange': featureValueColormapRangeScope,
            'obsHighlight': null,
        }])
    }]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  scatterplot.useCoordination(featureValueColormapRangeScope);

  config.linkViews([scatterplot], ['embeddingType'], ['UMAP']);
  config.linkViews([featureList, spatialView, lcView, scatterplot], ['obsType', 'featureSelection'], ['bin', ['Pdzk1']]);

  config.layout(hconcat(vconcat(spatialView, scatterplot), vconcat(lcView, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumHdSpatialdata2025 = generateVisiumHdConfig();
