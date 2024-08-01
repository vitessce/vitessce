/* eslint-disable max-len */
import {
  VitessceConfig,
  CoordinationLevel as CL,
  hconcat,
  vconcat,
} from '@vitessce/config';

// Reference: https://portal.hubmapconsortium.org/browse/dataset/8d86e6c899e80d0f5f95604eb4ad492e

function generateVisiumConfig() {
  const config = new VitessceConfig({
    schemaVersion: '1.0.16',
    name: 'Visium OOP',
  });
  const dataset = config.addDataset('My dataset').addFile({
    fileType: 'image.ome-zarr',
    url: 'https://vitessce-data.storage.googleapis.com/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.ome.zarr',
    coordinationValues: {
      fileUid: 'histology-image',
    },
  }).addFile({
    fileType: 'anndata.zarr',
    url: 'https://data-1.vitessce.io/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr',
    options: {
      obsFeatureMatrix: {
        path: 'obsm/X_hvg',
        featureFilterPath: 'var/highly_variable',
      },
      obsSpots: {
        path: 'obsm/spatial',
      },
      obsPoints: {
        path: 'obsm/spatial',
      },
      obsLocations: {
        path: 'obsm/spatial',
      },
      obsSegmentations: {
        path: 'obsm/segmentations',
      },
      obsEmbedding: [
        {
          path: 'obsm/X_umap',
          embeddingType: 'UMAP',
        },
        {
          path: 'obsm/X_pca',
          embeddingType: 'PCA',
        },
      ],
      obsSets: [
        {
          name: 'Leiden Cluster',
          path: 'obs/clusters',
        },
      ],
      obsLabels: {
        path: 'obs/clusters',
      },
    },
    coordinationValues: {
      fileUid: 'spot-segmentations',
      obsType: 'spot',
      obsLabelsType: 'cluster',
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
    obsType: 'spot', // TODO: remove this after auto-initialization is supported per-layer/per-layer-channel.
    // For now, cheating by allowing the spotLayer to fall back to the auto-initialized values for the view.
    imageLayer: CL({
      fileUid: 'histology-image',
      spatialLayerOpacity: 1,
      spatialLayerVisible: true,
      photometricInterpretation: 'RGB',
    }),
    pointLayer: CL({
      obsType: 'spot',
      spatialLayerVisible: true,
      spatialLayerOpacity: 0.5,
      spatialSpotRadius: 10.0,
      spatialLayerColor: [0, 255, 0],
      obsColorEncoding: 'spatialLayerColor',
      obsHighlight: null,
      obsLabelsType: 'cluster',
    }),
    spotLayer: CL({
      obsType: 'spot',
      spatialLayerVisible: false,
      spatialLayerOpacity: 0.5,
      spatialSpotRadius: 10.0,
      spatialLayerColor: [255, 0, 0],
      obsColorEncoding: 'spatialLayerColor',
      obsHighlight: null,
      obsSetColor: obsSetColorScope,
      obsSetSelection: obsSetSelectionScope,
      additionalObsSets: additionalObsSetsScope,
    }),
    segmentationLayer: CL([
      {
        fileUid: 'spot-segmentations',
        spatialLayerVisible: true,
        spatialLayerOpacity: 1.0,
        segmentationChannel: CL([
          {
            obsType: 'spot',
            spatialChannelVisible: false,
            spatialChannelOpacity: 1.0,
            obsColorEncoding: 'spatialChannelColor',
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

  config.linkViews([obsSets, featureList], ['obsType'], ['spot']);

  obsSets.useCoordination(obsSetColorScope, obsSetSelectionScope, additionalObsSetsScope);

  config.layout(hconcat(spatialViewSimple, spatialView2, vconcat(lcViewSimple, obsSets, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumPolygonsOop2023 = generateVisiumConfig();
