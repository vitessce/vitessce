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
    url: 'https://data-2.vitessce.io/data/sorger/3dtm/MIS_cells_corrected/MIS_corrected_with_tsne.csv',
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
    fileType: 'obsEmbedding.csv',
    url: 'https://data-2.vitessce.io/data/sorger/3dtm/MIS_cells_corrected/MIS_corrected_with_tsne.csv',
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
    url: 'https://data-2.vitessce.io/data/sorger/3dtm/MIS_cells_corrected/MIS_corrected_with_tsne.csv',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
    },
  });


  dataset.addFile({
    fileType: 'obsPoints.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/3dtm/MIS_cells_corrected/cells',
    options: {
      projectionAnnotationSpacing: 1,
      useForSegmentationCulling: true,
      featureIndexProp: 'mx1spots',
      quantitativeColorProp: 'mx1spots',
      // max value for mx1spots from binary chunks - used to normalize the colormap scale
      quantitativeColorMax: 58,
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
    showAxisLines: false,
    // Maximum projectionScale at which meshes start loading.
    // Higher = meshes load at lower zoom levels. Lower = requires more zoom before meshes appear.
    meshLoadProjectionScaleThreshold: 500,
    csvUrl: 'https://data-2.vitessce.io/data/sorger/3dtm/MIS_cells_corrected/MIS_corrected_with_tsne.csv',
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
            featureSelection: ['MX1_SPOTS'],
            // TODO: viridis colormap is inconsistent between points and meshes.
            // NG GLSL viridis ends at yellow (#fde725), but Vitessce's applyColormap('viridis')
            // ends at cyan (#69fcea). Use 'plasma' colormap for consistent colors.
            featureValueColormap: 'plasma',
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
        featureValueColormap: 'plasma',
        featureSelection: ['MX1_SPOTS'],
        featureValueColormapRange: [0.0, 1.0],
        featureFilterMode: 'featureSelection',
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsPoints') });

  config.layout(hconcat(neuroglancerView, vconcat(layerController, obsSets, scatterView)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerSorger = generateNeuroglancerSorgerOnDemandLoadingConfig();
