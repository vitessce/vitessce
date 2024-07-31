export const humanLymphNode10xVisium = {
  version: '1.0.15',
  name: 'Human lymph node, 10X Genomics',
  description: 'Visium Spatial Gene Expression data from 10x Genomics',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'visium',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://data-1.vitessce.io/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr',
          coordinationValues: {
            obsType: 'spot',
            featureType: 'gene',
            featureValueType: 'expression',
          },
          options: {
            obsFeatureMatrix: {
              path: 'obsm/X_hvg',
              featureFilterPath: 'var/highly_variable',
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
          },
        },
        {
          fileType: 'image.ome-zarr',
          url: 'https://vitessce-data.storage.googleapis.com/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.ome.zarr',
        },
      ],
    },
  ],
  coordinationSpace: {
    obsType: {
      A: 'spot',
    },
    spatialSegmentationLayer: {
      A: {
        radius: 65, stroked: true, visible: true, opacity: 1,
      },
    },
    spatialImageLayer: {
      A: [
        {
          type: 'raster',
          index: 0,
          colormap: null,
          transparentColor: null,
          opacity: 1,
          domainType: 'Min/Max',
          channels: [
            {
              selection: { c: 0 },
              color: [
                255,
                0,
                0,
              ],
              visible: true,
              slider: [
                0,
                255,
              ],
            },
            {
              selection: { c: 1 },
              color: [
                0,
                255,
                0,
              ],
              visible: true,
              slider: [
                0,
                255,
              ],
            },
            {
              selection: { c: 2 },
              color: [
                0,
                0,
                255,
              ],
              visible: true,
              slider: [
                0,
                255,
              ],
            },
          ],
        },
      ],
    },
    obsColorEncoding: {
      A: 'cellSetSelection',
      B: 'geneSelection',
    },
    spatialZoom: {
      A: -2.598,
    },
    spatialTargetX: {
      A: 1008.88,
    },
    spatialTargetY: {
      A: 1004.69,
    },
    featureSelection: {
      A: ['CR2'],
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        obsType: 'A',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        obsColorEncoding: 'A',
      },
      x: 0,
      y: 0,
      w: 6,
      h: 6,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        obsType: 'A',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        obsColorEncoding: 'B',
        featureSelection: 'A',
      },
      x: 6,
      y: 0,
      w: 6,
      h: 6,
    },
    {
      component: 'heatmap',
      coordinationScopes: {
        obsType: 'A',
        obsColorEncoding: 'A',
      },
      props: {
        transpose: true,
      },
      x: 6,
      y: 6,
      w: 6,
      h: 6,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        obsType: 'A',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
      },
      props: {
        disableChannelsIfRgbDetected: true,
      },
      x: 0,
      y: 6,
      w: 2,
      h: 6,
    },
    {
      component: 'obsSets',
      coordinationScopes: {
        obsType: 'A',
        obsColorEncoding: 'A',
      },
      x: 2,
      y: 6,
      w: 2,
      h: 6,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        obsType: 'A',
        obsColorEncoding: 'B',
        featureSelection: 'A',
      },
      x: 4,
      y: 6,
      w: 2,
      h: 6,
    },
  ],
};
