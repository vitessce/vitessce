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
    url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr',
    options: {
      obsFeatureMatrix: {
        path: 'obsm/X_hvg',
        featureFilterPath: 'var/highly_variable',
      },
      obsSpots: {
        path: 'obsm/spatial',
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
    },
    coordinationValues: {
      obsType: 'spot',
    },
  });

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
    spotLayer: CL({
      obsType: 'spot',
      spatialLayerVisible: true,
      spatialLayerOpacity: 0.5,
      spatialSpotRadius: 10.0,
      featureValueColormapRange: [0, 1],
    }),
  });

  const metaCoordinationScope = config.addMetaCoordination();
  metaCoordinationScope.useCoordinationByObject(scopes);


  const spatialViewSimple = config.addView(dataset, 'spatialBeta');
  const lcViewSimple = config.addView(dataset, 'layerControllerBeta');
  const obsSets = config.addView(dataset, 'obsSets');
  const featureList = config.addView(dataset, 'featureList');

  spatialViewSimple.useMetaCoordination(metaCoordinationScope);
  lcViewSimple.useMetaCoordination(metaCoordinationScope);

  config.linkViews([obsSets, featureList], ['obsType'], ['spot']);

  config.layout(hconcat(spatialViewSimple, vconcat(lcViewSimple, obsSets, featureList)));

  const configJSON = config.toJSON();
  return configJSON;
}


export const visiumSpotsOop2023 = generateVisiumConfig();
