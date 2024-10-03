export const visium = {
  version: '1.0.15',
  name: 'Visium data',
  description: '',
  datasets: [
    {
      uid: 'A',
      name: 'Human lymph node',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/human_lymph_node_10x_visium_with_cell_types.h5ad.zarr',
          options: {
            obsLocations: {
              path: 'obsm/spatial',
            },
            obsSegmentations: {
              path: 'obsm/segmentations',
            },
            obsEmbedding: [
              {
                path: 'obsm/X_umap',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 'UMAP',
              },
              {
                path: 'obsm/X_pca',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 'PCA',
              },
            ],
            obsSets: [
              {
                name: 'Leiden Cluster',
                path: 'obs/clusters',
              },
              {
                name: 'Predicted Cell Type',
                path: [
                  'obs/high_majority_voting',
                  'obs/low_majority_voting',
                ],
              },
            ],
            obsFeatureMatrix: {
              path: 'X',
              initialFeatureFilterPath: 'var/highly_variable',
            },
          },
          coordinationValues: {
            obsType: 'spot',
          },
        },
        {
          fileType: 'image.ome-zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/human_lymph_node_10x_visium.ome.zarr',
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    obsType: {
      A: 'spot',
    },
    spatialSegmentationLayer: {
      A: {
        radius: 65,
        stroked: true,
        visible: true,
        opacity: 1,
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
              selection: {
                c: 0,
              },
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
              selection: {
                c: 1,
              },
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
              selection: {
                c: 2,
              },
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
    spatialZoom: {
      A: -2.598,
    },
    spatialTargetX: {
      A: 1008.88,
    },
    spatialTargetY: {
      A: 1004.69,
    },
    obsColorEncoding: {
      A: 'geneSelection',
      B: 'geneSelection',
      C: 'cellSetSelection',
    },
    featureSelection: {
      A: [
        'CR2',
      ],
      B: [
        'FCER2',
      ],
    },
    featureValueColormapRange: {
      A: [
        0.5,
        0.75,
      ],
    },
    obsSetSelection: {
      A: [
        [
          'Predicted Cell Type',
          'B cells',
          'Germinal center B cells',
        ],
      ],
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        spatialSegmentationLayer: 'A',
        spatialImageLayer: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        obsColorEncoding: 'C',
        obsSetSelection: 'A',
      },
      x: 0.0,
      y: 0.0,
      w: 4.0,
      h: 6.0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        spatialSegmentationLayer: 'A',
        spatialImageLayer: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        obsColorEncoding: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
      },
      x: 4.0,
      y: 0.0,
      w: 4.0,
      h: 6.0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        spatialSegmentationLayer: 'A',
        spatialImageLayer: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        obsColorEncoding: 'B',
        featureSelection: 'B',
        featureValueColormapRange: 'A',
      },
      x: 8.0,
      y: 0.0,
      w: 4.0,
      h: 6.0,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        spatialSegmentationLayer: 'A',
        spatialImageLayer: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 0.0,
      y: 6.0,
      w: 4.0,
      h: 6.0,
      props: {
        disableChannelsIfRgbDetected: true,
      },
    },
    {
      component: 'obsSets',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        obsColorEncoding: 'C',
        obsSetSelection: 'A',
      },
      x: 4.0,
      y: 6.0,
      w: 4.0,
      h: 6.0,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        obsColorEncoding: 'B',
        featureSelection: 'B',
      },
      x: 8.0,
      y: 6.0,
      w: 4.0,
      h: 6.0,
    },
  ],
  initStrategy: 'auto',
};
