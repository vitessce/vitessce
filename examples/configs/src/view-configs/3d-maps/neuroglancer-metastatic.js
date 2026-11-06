/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

const MX1SPOTS_MAX = 78; // computed for this data


// groups (broad/fine/finer/spatial k-means) without redefining the color.
const phenotypeColorByName = {
  Tumor: [213, 94, 0], // Vermilion
  Tmem: [0, 114, 178], // Blue
  'CD4 T': [86, 180, 233], // Sky blue
  Treg: [86, 180, 233], // Sky blue
  'activated CD8 T': [86, 180, 233], // Sky blue
  'naive CD8 T': [86, 180, 233], // Sky blue
  'non-proliferative Tex': [86, 180, 233], // Sky blue
  'proliferative Tex': [86, 180, 233], // Sky blue
  'Partial Tex': [86, 180, 233], // Sky blue
  'non-proliferative Tpx': [86, 180, 233], // Sky blue
  'proliferative Tpx': [86, 180, 233], // Sky blue
  'TCF1+ PD1+': [86, 180, 233], // Sky blue
  Immune: [230, 159, 0], // Orange
  'Myeloid cells': [240, 228, 66], // Yellow
  Unknown: [51, 51, 51], // Dark gray
};

function colorsForGroups(groupNames, colorByName = phenotypeColorByName) {
  return groupNames.flatMap(groupName => (
    Object.entries(colorByName).map(([name, color]) => ({ path: [groupName, name], color }))
  ));
}

const cellTypeColors = colorsForGroups(['Phenotype (broad)', 'Phenotype (fine)', 'Phenotype (finer)']);


function generateNeuroglancerMetastatic() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'LSP22409 metastatic dataset',
  });

  const dataset = config.addDataset('LSP22409 metastatic melanoma');

  dataset.addFile({
    fileType: 'image.ome-tiff',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/cell_mask_metastatic.ome.tiff',
    options: {
      offsetsUrl: 'https://data-2.vitessce.io/data/sorger/metastatic/cell_mask_metastatic.offsets.json',
    },
    coordinationValues: {
      fileUid: 'metastatic-mask',
    },
  });

  dataset.addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/cell_mask_metastatic_precomputed_full',
    coordinationValues: {
      fileUid: 'metastatic-meshes',
      obsType: 'cell',
    },
  });

  dataset.addFile({
    fileType: 'obsSets.csv',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/phenotype_metastatic.csv',
    coordinationValues: {
      obsType: 'cell',
    },
    options: {
      obsIndex: 'CELLID',
      obsSets: [
        { name: 'Phenotype (broad)', column: 'phenotype_broad' },
        { name: 'Phenotype (fine)', column: 'phenotype_fine' },
        { name: 'Phenotype (finer)', column: 'phenotype_finer' },
        { name: 'Spatial k-means', column: 'spatial_kmeans' },
      ],
    },
  });

  // Per-cell marker intensities + spot counts (first column CELLID = obs index)
  dataset.addFile({
    fileType: 'obsFeatureMatrix.csv',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/quantification_metastatic.csv',
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
    },
  });

  // Cell centroids: rendered with the segmentation layer of the same obsType.
  dataset.addFile({
    fileType: 'obsLocations.ng-annotations',
    url: 'https://data-2.vitessce.io/data/sorger/metastatic/cell_centroids_precomputed/points_50000',
    options: {
      projectionAnnotationSpacing: 1,
      segmentIdProp: 'cell_id',
      quantitativeColorProp: 'mx1spots',
      quantitativeColorMax: MX1SPOTS_MAX,
    },
    coordinationValues: {
      obsType: 'cell',
    },
  });

  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [955360, 765100, 14280], // volume center in nm (1000 nm/vx)
      projectionScale: 2240000,
    },
    showAxisLines: false,
    // Max projectionScale at which meshes start loading (same units as projectionScale).
    meshLoadProjectionScaleThreshold: 333600,
  });
  const spatialView = config.addView(dataset, 'spatialBeta');
  const layerController = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList').setProps({ title: 'Cell Types' });
  const violin = config.addView(dataset, 'obsSetFeatureValueDistribution');

  config.linkViewsByObject([obsSets], {
    obsType: 'cell',
    obsSetColor: cellTypeColors,
  }, { meta: false });

  const [featureSelectionScope] = config.addCoordination('featureSelection');
  featureSelectionScope.setValue(['MX1SPOTS']);

  const [obsColorEncodingScope] = config.addCoordination('obsColorEncoding');
  obsColorEncodingScope.setValue('geneSelection');

  const [obsSetSelectionScope, obsSetColorScope] = config.addCoordination(
    'obsSetSelection',
    'obsSetColor',
  );

  obsSetColorScope.setValue(cellTypeColors);
  obsSetSelectionScope.setValue(
    colorsForGroups(['Phenotype (broad)']).map(({ path }) => path),
  );

  // Shared 3D camera between Neuroglancer and spatialBeta (as in the Sorger config).
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

  // Mask as an image layer in spatialBeta (no collision with NG's segmentationLayer).
  config.linkViewsByObject([spatialView, layerController], {
    imageLayer: CL([
      {
        fileUid: 'metastatic-mask',
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
        fileUid: 'metastatic-meshes',
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
            obsColorEncoding: 'cellSetSelection',
            obsSetColor: cellTypeColors,
            featureSelection: featureSelectionScope,
            obsSetSelection: obsSetSelectionScope,
            featureValueColormap: 'plasma',
            featureValueColormapRange: [0.0, 0.32],
            spatialSegmentationStrokeWidth: 1.0,
            spatialSegmentationFilled: false,
          },
        ]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViews([featureList, violin, obsSets], ['obsType', 'featureType', 'featureValueType'], ['cell', 'gene', 'expression']);

  featureList.useCoordination(featureSelectionScope, obsColorEncodingScope);
  violin.useCoordination(featureSelectionScope, obsSetSelectionScope, obsSetColorScope);
  obsSets.useCoordination(obsColorEncodingScope, obsSetSelectionScope, obsSetColorScope);

  config.layout(hconcat(
    vconcat(neuroglancerView, spatialView),
    vconcat(layerController, obsSets),
    vconcat(featureList, violin),
  ));

  return config.toJSON();
}

export const neuroglancerMetastatic = generateNeuroglancerMetastatic();
