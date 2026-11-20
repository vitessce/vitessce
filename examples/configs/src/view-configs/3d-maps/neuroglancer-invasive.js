import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';


const cellTypeColors = [
  { path: ['Cell Types', 'Tumor'], color: [213, 94, 0] }, // Vermilion
  { path: ['Cell Types', 'keratinocytes'], color: [0, 158, 115] }, // Bluish green
  { path: ['Cell Types', 'endothelial'], color: [204, 121, 167] }, // Reddish purple
  { path: ['Cell Types', 'Tissue T'], color: [0, 114, 178] }, // Blue
  { path: ['Cell Types', 'CD4 T'], color: [86, 180, 233] }, // Sky blue
  { path: ['Cell Types', 'CD8 T'], color: [86, 180, 233] }, // Sky blue
  { path: ['Cell Types', 'T reg'], color: [86, 180, 233] }, // Sky blue
  { path: ['Cell Types', 'B cells'], color: [230, 159, 0] }, // Orange
  { path: ['Cell Types', 'Other Immune'], color: [230, 159, 0] }, // Orange
  { path: ['Cell Types', 'Myeloid'], color: [240, 228, 66] }, // Yellow
  { path: ['Cell Types', 'Macrophage'], color: [240, 228, 66] }, // Yellow
  { path: ['Cell Types', 'Dendritic cells'], color: [240, 228, 66] }, // Yellow
  { path: ['Cell Types', 'Unknown'], color: [51, 51, 51] }, // Dark gray
];


function generateNeuroglancerSorgerOnDemandLoadingConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Sorger MIS',
  });

  const dataset = config.addDataset('My dataset');

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/invasive_precomputed',
    coordinationValues: {
      fileUid: 'sorger-meshes',
      obsType: 'cell',
    },
    options: {
      dimensions: {
        x: [0.000001, 'm'],
        y: [0.000001, 'm'],
        z: [0.000001, 'm'],
      },
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/sorger/INV_centroids_corrected.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'CellID',
      obsSets: [
        {
          name: 'Cell Types',
          column: 'phenotype',
        },
      ],
    },
  });


  dataset.addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: 'https://data-2.vitessce.io/data/sorger/INV_centroids_corrected.csv',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
    },
  });


  // Cell centroids: rendered implicitly with the segmentation layer of the same obsType.
  dataset.addFile({
    fileType: 'obsLocations.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/INV_cells/points',
    options: {
      projectionAnnotationSpacing: 1,
      segmentIdProp: 'mesh_id',
      transform: {
        matrix: [
          [7.14809960682, 0, 0, 0],
          [0, 7.14809960682, 0, 0],
          [0, 0, 3.80392156863, 0],
        ],
        outputDimensions: {
          x: [0.000001, 'm'],
          y: [0.000001, 'm'],
          z: [0.000001, 'm'],
        },
      },
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2722.3, 2398.6, 104.1],
      projectionScale: 5000,
    },
    showAxisLines: true,
    // Maximum projectionScale at which meshes start loading.
    // Higher = meshes load at lower zoom levels. Lower = requires more zoom before meshes appear.
    meshLoadProjectionScaleThreshold: 1200,
  });

  const layerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');

  config.linkViewsByObject([obsSets], {
    obsType: 'cell',
    obsSetColor: cellTypeColors,
  }, { meta: false });

  config.linkViewsByObject([neuroglancerView, layerController], {
    spatialRenderingMode: '3D',
    segmentationLayer: CL([
      {
        fileUid: 'sorger-meshes',
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
            obsColorEncoding: 'cellSetSelection',
            obsSetColor: cellTypeColors,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerInvasive = generateNeuroglancerSorgerOnDemandLoadingConfig();
