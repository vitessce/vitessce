/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
  getInitialCoordinationScopePrefix,
} from '@vitessce/config';

const BASE = 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/gzmb-spot-counts';

function generateNeuroglancerInvPairTypesConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Sorger INV - Pair types',
  });

  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'obsSegmentations.ng-precomputed',
    url: 'https://data-2.vitessce.io/data/sorger/tissue-map-tools-output-tab/INV_combined_precomputed',
    coordinationValues: { fileUid: 'inv-meshes', obsType: 'cell' },
  });

  dataset.addFile({
    fileType: 'obsSets.json',
    url: `${BASE}/inv_pair_types_obsSets.json`,
    coordinationValues: { obsType: 'cell' },
  });


  const gradientPairTypes = [
    { obsType: 'cellPairTumorTissueT', prefix: 'inv_tumor_tissuet_gradient' },
    { obsType: 'cellPairTissueTTissueT', prefix: 'inv_tissuet_tissuet_gradient' },
    { obsType: 'cellPairTissueTDendritic', prefix: 'inv_tissuet_dendritic_gradient' },
  ];
  gradientPairTypes.forEach(({ obsType, prefix }) => {
    dataset.addFile({
      fileType: 'obsFeatureMatrix.csv',
      url: `${BASE}/${prefix}_ids.csv`,
      coordinationValues: { obsType, featureType: 'gzmbGradient', featureValueType: 'expression' },
    });
    dataset.addFile({
      fileType: 'obsColors.csv',
      url: `${BASE}/${prefix}_colors.csv`,
      options: { obsIndex: 'id', obsColors: 'color' },
      coordinationValues: { obsType, featureType: 'gzmbGradient', featureValueType: 'expression' },
    });
  });

  const lcView = config.addView(dataset, 'layerControllerBeta').setProps({ forceEnable3d: true });
  const obsSetsView = config.addView(dataset, 'obsSets');
  const neuroglancerView = config.addView(dataset, 'neuroglancer').setProps({
    initialNgCameraState: {
      position: [2727000, 1377000, 97000],
      projectionScale: 2700000,
    },
  });

  // Flat-color layer: individual cells, scoped to only those participating
  // in a given pair type (not all Tumor/Tissue T/Dendritic cells overall).
  const [obsSetSelectionScope, obsSetColorScope] = config.addCoordination(
    'obsSetSelection',
    'obsSetColor',
  );
  obsSetSelectionScope.setValue([
    ['Pair Types', 'Tumor - Tissue T Pairs', 'Tumor'],
    ['Pair Types', 'Tumor - Tissue T Pairs', 'Tissue T'],
    ['Pair Types', 'Tissue T - Tissue T Pairs', 'Tissue T'],
    ['Pair Types', 'Tissue T - Dendritic Pairs', 'Tissue T'],
    ['Pair Types', 'Tissue T - Dendritic Pairs', 'Dendritic cells'],
  ]);
  obsSetColorScope.setValue([
    { path: ['Pair Types', 'Tumor - Tissue T Pairs', 'Tumor'], color: [213, 94, 0] },
    { path: ['Pair Types', 'Tumor - Tissue T Pairs', 'Tissue T'], color: [0, 114, 178] },
    { path: ['Pair Types', 'Tissue T - Tissue T Pairs', 'Tissue T'], color: [0, 114, 178] },
    { path: ['Pair Types', 'Tissue T - Dendritic Pairs', 'Tissue T'], color: [0, 114, 178] },
    { path: ['Pair Types', 'Tissue T - Dendritic Pairs', 'Dendritic cells'], color: [240, 228, 66] },
  ]);

  config.linkViewsByObject([neuroglancerView, lcView], {
    spatialRenderingMode: '3D',
    segmentationLayer: CL([
      {
        fileUid: 'inv-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerOpacityUnselected: 0,
        spatialLayerLabel: 'Individual cells (in pairs)',
        segmentationChannel: CL([{
          obsType: 'cell',
          spatialChannelVisible: true,
          spatialChannelOpacity: 0.6,
          obsColorEncoding: 'cellSetSelection',
          obsSetColor: obsSetColorScope,
          obsSetSelection: obsSetSelectionScope,
        }]),
      },
      {
        fileUid: 'inv-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerLabel: 'Tumor - Tissue T Pairs (GZMB gradient)',
        segmentationChannel: CL([{
          obsType: 'cellPairTumorTissueT',
          featureType: 'gzmbGradient',
          featureValueType: 'expression',
          spatialChannelVisible: true,
          spatialChannelOpacity: 0.6,
          obsColorEncoding: 'obsColors',
        }]),
      },
      {
        fileUid: 'inv-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerLabel: 'Tissue T - Tissue T Pairs (GZMB gradient)',
        segmentationChannel: CL([{
          obsType: 'cellPairTissueTTissueT',
          featureType: 'gzmbGradient',
          featureValueType: 'expression',
          spatialChannelVisible: true,
          spatialChannelOpacity: 0.6,
          obsColorEncoding: 'obsColors',
        }]),
      },
      {
        fileUid: 'inv-meshes',
        spatialLayerOpacity: 1,
        spatialLayerVisible: true,
        spatialLayerLabel: 'Tissue T - Dendritic Pairs (GZMB gradient)',
        segmentationChannel: CL([{
          obsType: 'cellPairTissueTDendritic',
          featureType: 'gzmbGradient',
          featureValueType: 'expression',
          spatialChannelVisible: true,
          spatialChannelOpacity: 0.6,
          obsColorEncoding: 'obsColors',
        }]),
      },
    ]),
  }, { scopePrefix: getInitialCoordinationScopePrefix('A', 'obsSegmentations') });

  config.linkViews([obsSetsView], ['obsType'], ['cell']);
  obsSetsView.useCoordination(obsSetSelectionScope, obsSetColorScope);

  config.layout(hconcat(neuroglancerView, vconcat(lcView, obsSetsView)));

  const configJSON = config.toJSON();
  return configJSON;
}

export const neuroglancerInvGzmb = generateNeuroglancerInvPairTypesConfig();
