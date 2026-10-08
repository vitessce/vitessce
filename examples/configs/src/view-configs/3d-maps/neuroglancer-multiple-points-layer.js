/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

function generateNeuroglancerMisTwoLayersConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Sorger MIS',
  });
  const dataset = config.addDataset('My dataset');

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/MIS_combined_metadata_V2.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'CellID',
      obsSets: [
        { name: 'Cell Types', column: 'phenotype' },
      ],
    },
  });

  // Layer 1: protein spots, feature-colorable (gene/protein selection)
  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/MIS_GZMB_spotmask2_matched_spot_coordinates_with_protein_annotations_precomputed/proteins',
    options: {
      projectionAnnotationSpacing: 2.4544585683772735,
      featureIndexProp: 'protein',
      transform: {
        matrix: [
          [0.499832, 0, 0, 0.577010],
          [0, 0.501191, 0, -0.561067],
          [0, 0, 0.538790, -7.041469],
        ],
        outputDimensions: {
          x: [1e-9, 'm'],
          y: [1e-9, 'm'],
          z: [1e-9, 'm'],
        },
      },
    },
    coordinationValues: {
      fileUid: 'mis-points',
      obsType: 'point',
      featureType: 'gene',
    },
  });

  // Layer 2: cell centroids, static/obsSet color, no feature axis
  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/MIS_combined_annotations_corrected_precomputed/cells',
    options: {
      projectionAnnotationSpacing: 1,
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
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2870.94, 929.11, 117.25],
      projectionScale: 1331.4,
      projectionOrientation: [
        -0.6668370366096497, 0.5911841988563538,
        -0.1955600529909134, 0.4093725383281708,
      ],
    },
    showAxisLines: false,
    meshLoadProjectionScaleThreshold: 1200,
  });
  const layerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  // const proteinList = config.addView(dataset, 'featureList').setProps({ enableMultiSelect: true });

  config.linkViewsByObject([neuroglancerView, layerController], {
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
    pointLayer: CL([
      {
        fileUid: 'mis-points',
        obsType: 'point',
        featureType: 'gene',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialPointStrokeWidth: 0.2,
        obsColorEncoding: 'geneSelection',
        featureValueColormap: 'plasma',
        featureSelection: ['MX1_SPOTS'],
        featureValueColormapRange: [0.0, 1.0],
        featureFilterMode: 'featureSelection',
      },
      {
        fileUid: 'sorger-cells',
        obsType: 'cell',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialPointStrokeWidth: 0.2,
        obsColorEncoding: 'spatialLayerColor',
        spatialLayerColor: [0, 255, 0],
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('B', 'obsPoints') });

  // featureList (proteinList) scoped ONLY to the mis-points layer's (obsType, featureType).
  config.linkViewsByObject([neuroglancerView, layerController], {
    obsType: 'point',
    featureType: 'gene',
  }, { scopePrefix: getInitialCoordinationScopePrefix('B', 'obsPoints') });

  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets)));
  const configJSON = config.toJSON();
  return configJSON;
}
export const neuroglancerTwoPointsLayers = generateNeuroglancerMisTwoLayersConfig();
