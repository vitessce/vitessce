import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerProgressiveLoadingConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Sorger MIS',
  });

  const dataset = config.addDataset('My dataset');

  // Segmentation meshes
  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/sorger_mis/',
    // url: 'https://data-2.vitessce.io/data/sorger/sorger_mis',
    coordinationValues: {
      fileUid: 'sorger-meshes',
      obsType: 'cell',
    },
  });


  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/sorger_mis/cells',
    options: {
      projectionAnnotationSpacing: 1.0,
      transform: {
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
    },
    coordinationValues: {
      fileUid: 'sorger-cells',
      obsType: 'cell',
      featureType: 'gene',
    },
  });

  // Cell centroids (2D — x and y only, z ignored by loader)
  dataset.addFile({
    fileType: 'obsLocations.csv',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/sorger_centroids.csv',
    // url: 'https://data-2.vitessce.io/data/sorger/sorger_centroids.csv',
    options: {
      obsIndex: 'cell_id',
      obsLocations: ['x', 'y'],
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  // ObsSets — provides cell IDs and groupings for the obsSets view
  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/sorger/sorger_obs_sets.csv',
    options: {
      obsIndex: 'cell_id',
      obsSets: [
        {
          name: 'Cell Type',
          column: 'cell_type',
        },
      ],
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  const [cellSetSelectionScope, cellSetColorScope] = config.addCoordination(
    'obsSetSelection',
    'obsSetColor',
  );

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [
        2634.276123046875,
        1507.4732666015625,
        117.2542724609375,
      ],
      projectionScale: 2228.862938458342,
      projectionOrientation: [
        -0.6668370366096497,
        0.5911841988563538,
        -0.1955600529909134,
        0.4093725383281708,
      ],
      dimensions: {
        x: [0.000001, 'm'],
        y: [0.000001, 'm'],
        z: [0.000001, 'm'],
      },
    },
  });

  const layerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');

  config.linkViewsByObject([obsSets], {
    obsType: 'cell',
    obsSetSelection: cellSetSelectionScope,
    obsSetColor: cellSetColorScope,
  }, { meta: false });

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
            spatialChannelVisible: true,
            obsHighlight: null,
            spatialChannelColor: [255, 165, 0],
            obsColorEncoding: 'spatialChannelColor',
            obsSetSelection: cellSetSelectionScope,
            obsSetColor: cellSetColorScope,
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
        obsColorEncoding: 'spatialLayerColor',
        spatialLayerColor: [0, 255, 0],
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });

  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerProgressiveLoading = generateNeuroglancerProgressiveLoadingConfig();
