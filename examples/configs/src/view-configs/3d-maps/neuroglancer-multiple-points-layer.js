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
    coordinationValues: { fileUid: 'mis-meshes' },
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
        // Bounds-fit: proteins (voxel indices) -> cells space (µm values, labeled nm).
        matrix: [
          [0.141721, 0, 0, -8.493161],
          [0, 0.141733, 0, -0.580656],
          [0, 0, 0.301723, -7.041469],
        ],
        outputDimensions: {
          x: [1e-9, 'm'],
          y: [1e-9, 'm'],
          z: [1e-9, 'm'],
        },
      },
    },
    coordinationValues: {
      fileUid: 'mis-proteins',
      obsType: 'point',
      featureType: 'gene',
    },
  });

  // Layer 2: cell centroids, static/obsSet color, no feature axis
  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/MIS_combined_annotations_corrected_precomputed/cells',
    options: {
      projectionAnnotationSpacing: 0.5,
    },
    coordinationValues: {
      fileUid: 'mis-centroids',
      obsType: 'cell',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [381.9, 193.3, 26.0],
      projectionScale: 1000,
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
    segmentationLayer: CL([{
      fileUid: 'mis-meshes',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      segmentationChannel: CL([{ obsType: 'cell', spatialChannelVisible: true }]),
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
        spatialPointStrokeWidth: 0.2,
        obsColorEncoding: 'geneSelection',
        featureValueColormap: 'plasma',
        featureSelection: ['MX1_SPOTS'],
        featureValueColormapRange: [0.0, 1.0],
        featureFilterMode: 'featureSelection',
      },
      {
        fileUid: 'mis-centroids',
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
