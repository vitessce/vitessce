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
    url: 'https://data-2.vitessce.io/data/sorger/sorger_mis',
    coordinationValues: {
      fileUid: 'sorger-meshes',
      obsType: 'cell',
    },
  });

  // Cell centroids (2D — x and y only, z ignored by loader)
  dataset.addFile({
    fileType: 'obsLocations.csv',
    url: 'https://data-2.vitessce.io/data/sorger/sorger_centroids.csv',
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

  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerProgressiveLoading = generateNeuroglancerProgressiveLoadingConfig();
