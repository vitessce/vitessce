/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e

function generateCodeluppiConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Codeluppi et al., Nature Methods 2018',
  });
  const dataset = config.addDataset('Codeluppi').addFile({
    fileType: 'anndata.zarr',
    url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018-via-zarr/codeluppi_2018_nature_methods.cells.h5ad.zarr',
    options: {
      obsFeatureMatrix: {
        path: 'X',
      },
      obsSegmentations: {
        path: 'obsm/X_segmentations',
      },
      obsLocations: {
        path: 'obsm/X_spatial',
      },
      obsEmbedding: [
        {
          path: 'obsm/X_pca',
          embeddingType: 'PCA',
        },
        {
          path: 'obsm/X_tsne',
          embeddingType: 't-SNE',
        },
      ],
      obsSets: [
        {
          name: 'Cell Type',
          path: ['obs/Cluster', 'obs/Subcluster'],
        },
      ],
    },
    coordinationValues: {
      obsType: 'cell',
      featureType: 'gene',
      featureValueType: 'expression',
      fileUid: 'cell-segmentations',
    },
  }).addFile({
    fileType: 'anndata.zarr',
    url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018-via-zarr/codeluppi_2018_nature_methods.molecules.h5ad.zarr',
    options: {
      obsPoints: {
        path: 'obsm/X_spatial',
      },
      obsLabels: {
        path: 'obs/Gene',
      },
    },
    coordinationValues: {
      obsType: 'molecule',
      obsLabelsType: 'gene',
    },
  });


  const [
    obsSetColorScope,
    obsSetSelectionScope,
    additionalObsSetsScope,
  ] = config.addCoordination('obsSetColor', 'obsSetSelection', 'additionalObsSets');

  const scopes = config.addCoordinationByObject({
    spatialTargetZ: 0,
    spatialTargetT: 0,
    obsType: 'cell',
    pointLayer: CL({
      obsType: 'molecule',
      spatialLayerVisible: false,
      spatialLayerOpacity: 0.5,
      spatialLayerColor: [0, 255, 0],
      obsColorEncoding: 'obsLabels',
      obsHighlight: null,
      obsLabelsType: 'gene',
    }),
    segmentationLayer: CL([
      {
        fileUid: 'cell-segmentations',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1.0,
        segmentationChannel: CL([
          {
            obsType: 'cell',
            spatialChannelVisible: true,
            spatialChannelOpacity: 1.0,
            obsColorEncoding: 'cellSetSelection',
            obsHighlight: null,
            obsSetColor: obsSetColorScope,
            obsSetSelection: obsSetSelectionScope,
            additionalObsSets: additionalObsSetsScope,
          },
        ]),
      },
    ]),
  });

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useCoordinationByObject(scopes);


  const spatialViewSimple = config.addView(dataset, 'spatialBeta');
  const spatialView2 = config.addView(dataset, 'spatialBeta');
  const lcViewSimple = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  spatialViewSimple.useMetaCoordination(metaCoordinationScope);
  spatialView2.useMetaCoordination(metaCoordinationScope);
  lcViewSimple.useMetaCoordination(metaCoordinationScope);

  config.linkViews([obsSets, featureList], ['obsType'], ['cell']);

  obsSets.useCoordination(obsSetColorScope, obsSetSelectionScope, additionalObsSetsScope);

  config.layout(hconcat(spatialViewSimple, spatialView2, vconcat(lcViewSimple, obsSets, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const codeluppiOop2018 = generateCodeluppiConfig();
