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
      options: {
        projectionAnnotationSpacing: 1,
        // transform: {
        //   matrix: [
        //     [7148099.60682, 0, 0, 0],
        //     [0, 7148099.60682, 0, 0],
        //     [0, 0, 3803921.56863, 0],
        //   ],
        //   outputDimensions: {
        //     x: [1, 'nm'],
        //     y: [1, 'nm'],
        //     z: [1, 'nm'],
        //   },
        matrix: [
          [7148.09960682, 0, 0, 0], // µm-scaled to match viewer dimensions
          [0, 7148.09960682, 0, 0],
          [0, 0, 3803.92156863, 0],
        ],
        outputDimensions: {
          x: [0.000001, 'm'], // must match viewer dimensions
          y: [0.000001, 'm'],
          z: [0.000001, 'm'],
        },
      },
      coordinationValues: {
        fileUid: 'sorger-cells',
        obsType: 'cell',
        featureType: 'gene',
      },
    },
  });

  // // Cell centroids (2D — x and y only, z ignored by loader)
  // dataset.addFile({
  //   fileType: 'obsLocations.csv',
  //   url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/sorger_centroids.csv',
  //   // url: 'https://data-2.vitessce.io/data/sorger/sorger_centroids.csv',
  //   options: {
  //     obsIndex: 'cell_id',
  //     obsLocations: ['x', 'y'],
  //   },
  //   coordinationValues: {
  //     obsType: 'cell',
  //   },
  // });

  // ObsSets — provides cell IDs and groupings for the obsSets view
  // dataset.addFile({
  //   fileType: 'obsSets.csv',
  //   url: 'https://data-2.vitessce.io/data/sorger/sorger_obs_sets.csv',
  //   options: {
  //     obsIndex: 'cell_id',
  //     obsSets: [
  //       {
  //         name: 'Cell Type',
  //         column: 'cell_type',
  //       },
  //     ],
  //   },
  //   coordinationValues: {
  //     obsType: 'cell',
  //   },
  // });
// 
  // const [cellSetSelectionScope, cellSetColorScope] = config.addCoordination(
  //   'obsSetSelection',
  //   'obsSetColor',
  // );

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      // This config uses um instead of nm, so converting to nm by x 1000
      // position: [
      //   2634276.123046875,
      //   1507473.2666015625,
      //   117254.2724609375,
      // ],
      // projectionScale: 2228862.938458342,
      position: [2870.94, 929.11, 117.25],
      projectionScale: 1331.4,
      projectionOrientation: [
        -0.6668370366096497,
        0.5911841988563538,
        -0.1955600529909134,
        0.4093725383281708,
      ],
    },
  });

  const layerController = config.addView(dataset, 'layerControllerBeta');
  // const obsSets = config.addView(dataset, 'obsSets');

  // config.linkViewsByObject([obsSets], {
  //   obsType: 'cell',
  //   obsSetSelection: cellSetSelectionScope,
  //   obsSetColor: cellSetColorScope,
  // }, { meta: false });

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
            // obsSetSelection: cellSetSelectionScope,
            // obsSetColor: cellSetColorScope,
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
        spatialPointStrokeWidth: 0.2,
      },
      
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });

  config.layout(hconcat(neuroglancerView, vconcat(layerController)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerProgressiveLoading = generateNeuroglancerProgressiveLoadingConfig();
