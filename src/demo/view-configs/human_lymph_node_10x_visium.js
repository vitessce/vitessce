export const humanLymphNode10xVisium = {
  version: '1.0.15',
  name: '10x visium human lymph node',
  description: '10x visium human lymph node',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'visium',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/human_lymph_node_10x_visium/human_lymph_node_10x_visium.h5ad.zarr',
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
          fileType: 'image.raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'H and E Image',
                url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/human_lymph_node_10x_visium/human_lymph_node_10x_visium.h5ad.zarr/uns/spatial/V1_Human_Lymph_Node/images/hires',
                type: 'zarr',
                metadata: {
                  isPyramid: false,
                  transform: {
                    scale: 5.87,
                    translate: { x: 0, y: 0 },
                  },
                  dimensions: [
                    {
                      field: 'channel',
                      type: 'nominal',
                      values: [
                        'R',
                        'G',
                        'B',
                      ],
                    },
                    {
                      field: 'y',
                      type: 'quantitative',
                      values: null,
                    },
                    {
                      field: 'x',
                      type: 'quantitative',
                      values: null,
                    },
                  ],
                },
              },
            ],
          },
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
              selection: { channel: 0 },
              color: [
                255,
                0,
                0,
              ],
              visible: true,
              slider: [
                0,
                1,
              ],
            },
            {
              selection: { channel: 1 },
              color: [
                0,
                255,
                0,
              ],
              visible: true,
              slider: [
                0,
                1,
              ],
            },
            {
              selection: { channel: 2 },
              color: [
                0,
                0,
                255,
              ],
              visible: true,
              slider: [
                0,
                1,
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
      A: -4.455728265917529,
    },
    spatialTargetX: {
      A: 4975.310550270499,
    },
    spatialTargetY: {
      A: 5678.288421953778,
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
