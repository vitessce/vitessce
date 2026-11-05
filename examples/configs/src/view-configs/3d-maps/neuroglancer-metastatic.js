/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

// max of MX1SPOTS in quantification_metastatic.csv: print(df.MX1SPOTS.max())
const MX1SPOTS_MAX = 78; // TODO: replace with the real value for this dataset

function generateNeuroglancerMetastatic() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'LSP22409 metastatic dataset',
  });

  const dataset = config.addDataset('LSP22409 metastatic melanoma');

  dataset.addFile({
    fileType: 'labels.spatialdata.zarr',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/cell_mask_metastatic_full.zarr',
    options: { path: 'labels/labels' },
    coordinationValues: { fileUid: 'metastatic-mask', obsType: 'cell' },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/cell_mask_metastatic_precomputed_full',
    coordinationValues: {
      fileUid: 'metastatic-meshes',
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/phenotype_metastatic.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'CELLID',
      obsSets: [
        { name: 'Phenotype (broad)', column: 'phenotype_broad' },
        { name: 'Phenotype (fine)', column: 'phenotype_fine' },
        { name: 'Phenotype (finer)', column: 'phenotype_finer' },
        { name: 'Spatial k-means', column: 'spatial_kmeans' },
      ],
    },
  });

  dataset.addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/quantification_metastatic.csv',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
    },
  });

  // Cell centroids: rendered with the segmentation layer of the same obsType.
  dataset.addFile({
    fileType: 'obsLocations.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/cell_centroids_precomputed/points_50000',
    options: {
      projectionAnnotationSpacing: 1,
      segmentIdProp: 'cell_id',
      quantitativeColorProp: 'mx1spots',
      quantitativeColorMax: MX1SPOTS_MAX,
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [955360, 765100, 14280], // volume center in nm (1000 nm/vx)
      projectionScale: 2240000,
    },
    showAxisLines: false,
    // Max projectionScale at which meshes start loading (same units as projectionScale).
    meshLoadProjectionScaleThreshold: 33600,
  });
  const ngLayerController = config.addView(dataset, 'layerControllerBeta');
  const spatialLayerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');
  const violin = config.addView(dataset, 'obsSetFeatureValueDistribution');
  const spatialView = config.addView(dataset, 'spatialBeta');

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['MX1SPOTS']);

  const [obsColorEncodingScope] = config.addCoordination('obsColorEncoding');
  obsColorEncodingScope.setValue('geneSelection');

  const [obsSetSelectionScope, obsSetColorScope] = config.addCoordination(
    'obsSetSelection',
    'obsSetColor',
  );

  config.linkViewsByObject([neuroglancerView, ngLayerController], {
    spatialRenderingMode: '3D',
  }, { meta: false });

  config.linkViewsByObject([neuroglancerView, ngLayerController], {
    segmentationLayer: CL([
      {
        fileUid: 'metastatic-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerLabel: 'Meshes',
        segmentationChannel: CL([
          {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            spatialChannelOpacity: 0.6,
            obsHighlight: null,
            spatialChannelColor: [255, 165, 0],
            obsColorEncoding: obsColorEncodingScope,
            featureSelection: featureSelectionScope,
            obsSetSelection: obsSetSelectionScope,
            obsSetColor: obsSetColorScope,
            featureValueColormap: 'plasma',
            featureValueColormapRange: [0.0, 0.32],
            spatialSegmentationStrokeWidth: 1.0,
            spatialSegmentationFilled: false,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViewsByObject([spatialView, spatialLayerController], {
    segmentationLayer: CL([
      {
        fileUid: 'metastatic-mask',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerLabel: 'Mask',
        segmentationChannel: CL([
          {
            spatialTargetC: 0,
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            obsHighlight: null,
            spatialChannelColor: [255, 165, 0],
            obsColorEncoding: obsColorEncodingScope,
            featureSelection: featureSelectionScope,
            obsSetSelection: obsSetSelectionScope,
            obsSetColor: obsSetColorScope,
            featureValueColormap: 'plasma',
            featureValueColormapRange: [0.0, 0.32],
            spatialSegmentationStrokeWidth: 1.0,
            spatialSegmentationFilled: true,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('B', 'obsSegmentations') });

  config.linkViews([featureList, violin, obsSets], ['obsType', 'featureType', 'featureValueType'], ['cell', 'gene', 'expression']);

  featureList.useCoordination(featureSelectionScope, obsColorEncodingScope);
  violin.useCoordination(featureSelectionScope, obsSetSelectionScope, obsSetColorScope);
  obsSets.useCoordination(obsColorEncodingScope, obsSetSelectionScope, obsSetColorScope);

  config.layout(hconcat(
    neuroglancerView, spatialView,
    vconcat(ngLayerController, spatialLayerController, obsSets),
    vconcat(featureList, violin),
  ));

  return config.toJSON();
}

export const neuroglancerMetastatic = generateNeuroglancerMetastatic();
