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
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/MIS_combined_precomputed',
    coordinationValues: { fileUid: 'mis-meshes', obsType: 'cell' },
  });

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
          [1000, 0, 0, 0],
          [0, 1000, 0, 0],
          [0, 0, 1000, 0],
        ],
        outputDimensions: { x: [1e-9, 'm'], y: [1e-9, 'm'], z: [1e-9, 'm'] },
      },
    },
    coordinationValues: { fileUid: 'mis-proteins', obsType: 'point', featureType: 'gene' },
  });

  // Cell centroids: rendered implicitly with the segmentation layer of the same obsType,
  // using its visual properties (visibility, opacity, color encoding, etc.).
  dataset.addFile({
    fileType: 'obsLocations.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/MIS_combined_annotations_corrected_precomputed/cells',
    options: {
      projectionAnnotationSpacing: 0.5,
      transform: {
        matrix: [
          [7148.09960682, 0, 0, 0],
          [0, 7148.09960682, 0, 0],
          [0, 0, 3803.92156863, 0],
        ],
        outputDimensions: { x: [1e-9, 'm'], y: [1e-9, 'm'], z: [1e-9, 'm'] },
      },
    },
    coordinationValues: { obsType: 'cell' },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2727000, 1377000, 97000], // centre of the segmentation volume
      projectionScale: 2700000,
    },
    meshLoadProjectionScaleThreshold: 300000,
    showAxisLines: false,
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
    segmentationLayer: CL([{
      fileUid: 'mis-meshes',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      segmentationChannel: CL([{
        obsType: 'cell',
        spatialChannelVisible: true,
        obsColorEncoding: 'cellSetSelection',
      }]),
    }]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViewsByObject([neuroglancerView, layerController], {
    pointLayer: CL([
      {
        fileUid: 'mis-proteins',
        obsType: 'point',
        featureType: 'gene',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerLabel: 'Protein',
        spatialPointStrokeWidth: 0.2,
        obsColorEncoding: 'spatialLayerColor',
        // featureValueColormap: 'plasma',
        // featureSelection: ['MX1_SPOTS'],
        // featureValueColormapRange: [0.0, 1.0],
        // featureFilterMode: 'featureSelection',
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
