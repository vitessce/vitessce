/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat, vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerMinimalConfiguration() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Melanoma',
  });

  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/invasive_new_meshes',
    coordinationValues: {
      fileUid: 'invasive-meshes',
      obsType: 'cell',
    },
    options: {
      subsources: { default: true, mesh: true },
      enableDefaultSubsources: false,
      outputDimensions: {
        x: [0.000001, 'm'],
        y: [0.000001, 'm'],
        z: [0.000001, 'm'],
      },
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/INV_centroids_corrected.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'CellID',
      obsSets: [
        {
          name: 'Clusters',
          column: 'phenotype',
        },
      ],
    },
  });

  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/invasive_cells',
    options: {
      projectionAnnotationSpacing: 1,
      useForSegmentationCulling: true,
      // matrix: [
      //   // [7.14809960682, 0, 0, 0],
      //   // [0, 7.14809960682, 0, 0],
      //   // [0, 0, 3.80392156863, 0],
      //   [7148.09960682, 0, 0, 0],
      //   [0, 7148.09960682, 0, 0],
      //   [0, 0, 3803.92156863, 0],
      // ],
      // outputDimensions: {
      //   x: [0.000001, 'm'],
      //   y: [0.000001, 'm'],
      //   z: [0.000001, 'm'],
      // },
    },
    coordinationValues: {
      fileUid: 'sorger-cells',
      obsType: 'cell',
      featureType: 'gene',
    },
  });

  const obsSets = config.addView(dataset, 'obsSets');

  const lcView = config.addView(dataset, 'layerControllerBeta').setProps({
    cameraPresets: [
      {
        spatialZoom: -3.6,
        spatialTargetX: 666,
        spatialTargetY: 542,
        spatialRotationX: 0,
        spatialRotationOrbit: 0,
      },
      {
        spatialZoom: -2,
        spatialTargetX: 400,
        spatialTargetY: 300,
        spatialRotationX: 45,
        spatialRotationOrbit: 90,
      },
    ],
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2722067, 2396828, 97000], // in nm
      projectionScale: 10000000, // 10M nm = 10mm field of view
    },
    meshLoadProjectionScaleThreshold: 5000000,
    csvUrl: 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/INV_centroids_corrected.csv',
  });

  config.linkViewsByObject([neuroglancerView, lcView], {
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

  config.linkViewsByObject([neuroglancerView, lcView], {
    segmentationLayer: CL([
      {
        fileUid: 'invasive-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelVisible: true,
            obsHighlight: null,
            spatialChannelColor: [255, 165, 0],
            obsColorEncoding: 'spatialChannelColor',
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViewsByObject([neuroglancerView, lcView], {
    pointLayer: CL([
      {
        fileUid: 'sorger-cells',
        obsType: 'cell',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerColor: [0, 255, 0],
        spatialPointStrokeWidth: 0.2,
        obsColorEncoding: 'cellSetSelection',
        featureValueColormap: 'plasma',
        featureValueColormapRange: [0.0, 1.0],
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });

  config.layout(hconcat(neuroglancerView, vconcat(lcView, obsSets)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const invasiveNeuroglancer = generateNeuroglancerMinimalConfiguration();
