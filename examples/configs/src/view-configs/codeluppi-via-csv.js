export const codeluppiViaCsv = {
  name: 'Codeluppi et al., Nature Methods 2018',
  description: 'Spatial organization of the somatosensory cortex revealed by osmFISH',
  version: '1.0.15',
  initStrategy: 'auto',
  datasets: [
    {
      "files": [
        {
          "fileType": "anndata.zarr",
          "options": {
            "obsEmbedding": [
              {
                "dims": [
                  0,
                  1
                ],
                "embeddingType": "t-SNE",
                "path": "obsm/tsne"
              }
            ],
            "obsFeatureMatrix": {
              "path": "X"
            },
            "obsLocations": {
              "path": "obsm/xy"
            },
            "obsSets": [
              {
                "name": "Cell K-Means [tSNE_All_Features]",
                "path": "obs/Cell K-Means [tSNE_All_Features]"
              },
              {
                "name": "Cell K-Means [Mean-All-SubRegions] Expression",
                "path": "obs/Cell K-Means [Mean-All-SubRegions] Expression"
              },
              {
                "name": "Cell K-Means [Mean] Expression",
                "path": "obs/Cell K-Means [Mean] Expression"
              },
              {
                "name": "Cell K-Means [Shape-Vectors]",
                "path": "obs/Cell K-Means [Shape-Vectors]"
              },
              {
                "name": "Cell K-Means [Texture]",
                "path": "obs/Cell K-Means [Texture]"
              },
              {
                "name": "Cell K-Means [Total] Expression",
                "path": "obs/Cell K-Means [Total] Expression"
              },
              {
                "name": "Cell K-Means [Covariance] Expression",
                "path": "obs/Cell K-Means [Covariance] Expression"
              }
            ]
          },
          "url": "https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/anndata-zarr/reg001_expr-anndata.zarr"
        },
        {
          "fileType": "raster.json",
          "options": {
            "images": [
              {
                "metadata": {
                  "isBitmask": false,
                  "omeTiffOffsetsUrl": "https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/output_offsets/pipeline_output/expr/reg001_expr.offsets.json?token="
                },
                "name": "reg001_expr",
                "type": "ome-tiff",
                "url": "https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/ometiff-pyramids/pipeline_output/expr/reg001_expr.ome.tif?token="
              },
              {
                "metadata": {
                  "isBitmask": true,
                  "omeTiffOffsetsUrl": "https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/output_offsets/pipeline_output/mask/reg001_mask.offsets.json?token="
                },
                "name": "reg001_mask",
                "type": "ome-tiff",
                "url": "https://assets.hubmapconsortium.org/8d86e6c899e80d0f5f95604eb4ad492e/ometiff-pyramids/pipeline_output/mask/reg001_mask.ome.tif?token="
              }
            ],
            "renderLayers": [
              "reg001_expr",
              "reg001_mask"
            ],
            "schemaVersion": "0.0.2",
            "usePhysicalSizeScaling": false
          }
        }
      ],
      "name": "SPRM",
      "uid": "A"
    }
  ],
  coordinationSpace: {
    obsType: {
      cell: 'cell',
      enhancer: 'enhancer',
    },
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
  },
  layout: [
    {
      // Cell by gene
      component: 'heatmap',
      x: 0, y: 0, h: 6, w: 6,
    },
    {
      // Enhancer by gene
      component: 'heatmap',
      coordinationScopes: {
        obsType: 'enhancer',
      },
      x: 0, y: 6, h: 6, w: 6,
    },
    {
      component: 'spatial',
      coordinationScopes: {

      },
      props: {
        channelNamesVisible: true,
      },
      x: 6, y: 0, h: 6, w: 6,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
      },
      x: 6, y: 6, h: 6, w: 3,
    },
    {
      component: 'featureList',
      x: 9, y: 6, h: 6, w: 3,
    },
  ],
};
