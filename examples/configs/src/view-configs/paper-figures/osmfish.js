export const osmFish = {
  version: '1.0.15',
  name: 'Codeluppi et al.',
  description: 'osmFISH',
  datasets: [
    {
      uid: 'A',
      name: 'osmFISH',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/codeluppi_2018_nature_methods.cells.h5ad.zarr',
          options: {
            obsLocations: {
              path: 'obsm/X_spatial',
            },
            obsSegmentations: {
              path: 'obsm/X_segmentations',
            },
            obsEmbedding: [
              {
                path: 'obsm/X_pca',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 'PCA',
              },
              {
                path: 'obsm/X_tsne',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 't-SNE',
              },
            ],
            obsSets: [
              {
                name: 'Cell Type',
                path: [
                  'obs/Cluster',
                  'obs/Subcluster',
                ],
              },
            ],
            obsFeatureMatrix: {
              path: 'layers/X_uint8',
            },
          },
        },
        {
          fileType: 'image.ome-zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/codeluppi_2018_nature_methods.image.ome.zarr',
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    embeddingType: {
      A: 't-SNE',
    },
    spatialZoom: {
      A: -5.5,
      B: -6.20075,
    },
    spatialTargetX: {
      A: 16000,
      B: 13651.715,
    },
    spatialTargetY: {
      A: 20000,
      B: 15314.799,
    },
    spatialImageLayer: {
      A: [
        {
          type: 'raster',
          index: 0,
          visible: true,
          colormap: null,
          opacity: 1,
          domainType: 'Min/Max',
          transparentColor: null,
          renderingMode: 'Additive',
          use3d: false,
          channels: [
            {
              selection: {
                c: 1,
              },
              color: [
                255,
                255,
                255,
              ],
              visible: true,
              slider: [
                1,
                1473,
              ],
            },
            {
              selection: {
                c: 0,
              },
              color: [
                255,
                255,
                255,
              ],
              visible: true,
              slider: [
                1,
                447,
              ],
            },
          ],
        },
      ],
    },
    spatialSegmentationLayer: {
      A: {
        opacity: 1,
        radius: 0,
        visible: true,
        stroked: false,
      },
    },
    embeddingZoom: {
      A: 0.75,
    },
    obsSetSelection: {
      A: [
        [
          'Cell Type',
          'Excitatory neurons',
          'Pyramidal L2-3',
        ],
        [
          'Cell Type',
          'Excitatory neurons',
          'Pyramidal L2-3 L5',
        ],
        [
          'Cell Type',
          'Excitatory neurons',
          'Pyramidal L3-4',
        ],
        [
          'Cell Type',
          'Excitatory neurons',
          'pyramidal L4',
        ],
      ],
    },
    obsColorEncoding: {
      A: 'cellSetSelection',
    },
    featureSelection: {
      A: [
        'Lamp5',
      ],
      B: [
        'Rorb',
      ],
    },
    embeddingObsSetLabelsVisible: {
      A: true,
    },
    embeddingObsSetLabelSize: {
      A: 18,
    },
  },
  layout: [
    {
      component: 'layerController',
      coordinationScopes: {
        dataset: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
      },
      x: 0,
      y: 0,
      w: 3,
      h: 4,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        featureSelection: 'B',
      },
      x: 0,
      y: 4,
      w: 3,
      h: 4,
    },
    {
      component: 'obsSets',
      coordinationScopes: {
        dataset: 'A',
        obsSetSelection: 'A',
      },
      x: 0,
      y: 8,
      w: 3,
      h: 4,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialZoom: 'B',
        spatialTargetX: 'B',
        spatialTargetY: 'B',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        obsSetSelection: 'A',
        obsColorEncoding: 'A',
      },
      x: 3,
      y: 0,
      w: 3,
      h: 6,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialZoom: 'B',
        spatialTargetX: 'B',
        spatialTargetY: 'B',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        featureSelection: 'A',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 6,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        spatialZoom: 'B',
        spatialTargetX: 'B',
        spatialTargetY: 'B',
        spatialImageLayer: 'A',
        spatialSegmentationLayer: 'A',
        featureSelection: 'B',
      },
      x: 9,
      y: 0,
      w: 3,
      h: 6,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        embeddingType: 'A',
        embeddingZoom: 'A',
        obsSetSelection: 'A',
        obsColorEncoding: 'A',
        embeddingObsSetLabelsVisible: 'A',
        embeddingObsSetLabelSize: 'A',
      },
      x: 3,
      y: 6,
      w: 3,
      h: 6,
    },
    {
      component: 'obsSetFeatureValueDistribution',
      coordinationScopes: {
        dataset: 'A',
        obsSetSelection: 'A',
        featureSelection: 'A',
      },
      x: 6,
      y: 6,
      w: 3,
      h: 6,
    },
    {
      component: 'obsSetFeatureValueDistribution',
      coordinationScopes: {
        dataset: 'A',
        obsSetSelection: 'A',
        featureSelection: 'B',
      },
      x: 9,
      y: 6,
      w: 3,
      h: 6,
    },
  ],
  initStrategy: 'auto',
};
