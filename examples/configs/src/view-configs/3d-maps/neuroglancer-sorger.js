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

  const dataset = config.addDataset('Melanoma dataset from Sorger lab');

  dataset.addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/sorger/melanoma_mask.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/sorger/melanoma_mask.offsets.json',
    },
    coordinationValues: {
      fileUid: 'melanoma-mask',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/sorger_mis',
    coordinationValues: {
      fileUid: 'sorger-meshes',
      obsType: 'cell',
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


  // Cell centroids: rendered implicitly with the segmentation layer of the same obsType.
  dataset.addFile({
    fileType: 'obsLocations.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/3dtm/MIS_cells_corrected/cells',
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
      /*
      This has a single quantitative feature hard-coded in the config,
      and a hard-coded maximum feature value for normalization.
      What happens when there are multiple genes?
      - Can we assume that the annotation value will always be prop_{geneId}();
      in the shader? Then, we could remove qualitativeColorProp from the config
      - Can we assume the annotation values will always be normalized already?
      */
      quantitativeColorProp: 'mx1spots',
      // max value for mx1spots from binary chunks - used to normalize the colormap scale
      quantitativeColorMax: 58,
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2825, 1731, 117.25],
      projectionScale: 5200,
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
    meshLoadProjectionScaleThreshold: 1200,
  });

  const spatialView = config.addView(dataset, 'spatialBeta');
  const layerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const scatterView = config.addView(dataset, 'scatterplot', { mapping: 'TSNE' });
  config.linkViews([scatterView], ['embeddingObsRadiusMode', 'embeddingObsRadius'], ['manual', 4]);

  config.linkViewsByObject([spatialView, neuroglancerView, layerController], {
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

  config.linkViewsByObject([spatialView, layerController], {
    imageLayer: CL([
      {
        fileUid: 'melanoma-mask',
        spatialLayerOpacity: 1,
        spatialTargetResolution: null,
        imageChannel: CL([
          {
            spatialTargetC: 0,
            spatialChannelColor: [255, 0, 0],
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'image') });

  config.linkViewsByObject([neuroglancerView, layerController], {
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
            spatialChannelColor: [255, 165, 0],
            obsColorEncoding: 'geneSelection',
            featureSelection: ['MX1_SPOTS'],
            // TODO: viridis colormap is inconsistent between points and meshes.
            // NG GLSL viridis ends at yellow (#fde725), but Vitessce's applyColormap('viridis')
            // ends at cyan (#69fcea). Use 'plasma' colormap for consistent colors.
            featureValueColormap: 'plasma',
            featureValueColormapRange: [0.0, 1.0],
            spatialSegmentationStrokeWidth: 1.0,
            spatialSegmentationFilled: false,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.layout(hconcat(vconcat(neuroglancerView, spatialView),
    vconcat(layerController, obsSets, scatterView)));
  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerSorger = generateNeuroglancerSorgerOnDemandLoadingConfig();
