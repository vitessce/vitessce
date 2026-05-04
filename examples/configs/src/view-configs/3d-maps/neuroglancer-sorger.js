import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerSorgerOnDemandLoadingConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Sorger MIS',
  });

  const dataset = config.addDataset('My dataset');

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/sorger_mis',
    coordinationValues: {
      fileUid: 'sorger-meshes',
      obsType: 'cell',
    },
    options: {
      neuroglancerOptions: {
        dimensions: {
          x: [0.000001, 'm'],
          y: [0.000001, 'm'],
          z: [0.000001, 'm'],
        },
      },
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/sorger/MIS_TSNE.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'CellID',
      obsSets: [
        {
          name: 'Clusters',
          column: 'spatial_kmeans',
        },
      ],
    },
  });

  dataset.addFile({
    fileType: 'obsEmbedding.csv',
    url: 'https://data-2.vitessce.io/data/sorger/MIS_TSNE.csv',
    options: {
      obsIndex: 'CellID',
      obsEmbedding: ['tSNE_1', 'tSNE_2'],
    },
    coordinationValues: {
      obsType: 'cell',
      embeddingType: 'TSNE',
    },
  });

  dataset.addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: 'https://data-2.vitessce.io/data/sorger/MIS_phenotype_numeric.csv',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
    },
  });


  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/sorger_mis/cells',
    options: {
      projectionAnnotationSpacing: 1,
      // useForSegmentationCulling: true,
      featureIndexProp: 'phenotype',
      pointIndexProp: 'id',
      quantitativeColorProp: 'phenotype',
      matrix: [
        [7148.09960682, 0, 0, 0],
        [0, 7148.09960682, 0, 0],
        [0, 0, 3803.92156863, 0],
      ],
      outputDimensions: {
        x: [0.000001, 'm'],
        y: [0.000001, 'm'],
        z: [0.000001, 'm'],
      },
    },
    coordinationValues: {
      fileUid: 'sorger-cells',
      obsType: 'cell',
      featureType: 'gene',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2870.94, 929.11, 117.25],
      projectionScale: 1331.4,
      projectionOrientation: [
        -0.6668370366096497,
        0.5911841988563538,
        -0.1955600529909134,
        0.4093725383281708,
      ],
    },
    // maximum number of annotation spatial chunks fetched per viewport update
    meshMaxChunks: 64,
    // projectionScale threshold (in µm/pixel) below which meshes load
    meshLoadThresholdUm: 100, // Lower = require more zoom before meshes appear.
  });

  const layerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const scatterView = config.addView(dataset, 'scatterplot', { mapping: 'TSNE' });
  config.linkViews([scatterView], ['embeddingObsRadiusMode', 'embeddingObsRadius'], ['manual', 4]);
  config.linkViewsByObject([neuroglancerView, layerController], {
    spatialRenderingMode: '3D',
    spatialZoom: 0,
    spatialTargetT: 0,
    spatialTargetX: 0,
    spatialTargetY: 0,
    spatialTargetZ: 0,
    spatialRotationX: 0,
    spatialRotationY: 0,
    spatialRotationZ: 0,
    spatialRotationOrbit: 0,

  }, { meta: false });

  config.linkViewsByObject([neuroglancerView, layerController], {
    segmentationLayer: CL([
      {
        fileUid: 'sorger-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
            spatialChannelVisible: true,
            obsHighlight: null,
            spatialChannelColor: [255, 165, 0],
            obsColorEncoding: 'geneSelection',
            featureSelection: ['phenotype_numeric'],
            featureValueColormap: 'viridis',
            featureValueColormapRange: [0.0, 1.0],
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViewsByObject([neuroglancerView, layerController], {
    pointLayer: CL([
      {
        fileUid: 'sorger-cells',
        obsType: 'cell',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerColor: [0, 255, 0],
        spatialPointStrokeWidth: 0.2,
        obsColorEncoding: 'quantitativeColormap',
        featureValueColormap: 'viridis',
        featureValueColormapRange: [0.0, 12.0], // phenotypes range
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });

  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets, scatterView)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerSorger = generateNeuroglancerSorgerOnDemandLoadingConfig();
