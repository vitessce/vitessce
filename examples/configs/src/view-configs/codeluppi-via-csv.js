export const codeluppiViaCsv = {
  name: 'Codeluppi et al., Nature Methods 2018',
  description: 'Spatial organization of the somatosensory cortex revealed by osmFISH',
  version: '1.0.15',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        {
          fileType: 'obsSegmentations.json',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.segmentations.json',
        },
        {
          fileType: 'obsLocations.csv',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
          options: {
            obsIndex: 'cell_id',
            obsLocations: ['X', 'Y'],
          },
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          fileType: 'obsEmbedding.csv',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
          options: {
            obsIndex: 'cell_id',
            obsEmbedding: ['PCA_1', 'PCA_2'],
          },
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 'PCA',
          },
        },
        {
          fileType: 'obsEmbedding.csv',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
          options: {
            obsIndex: 'cell_id',
            obsEmbedding: ['TSNE_1', 'TSNE_2'],
          },
          coordinationValues: {
            obsType: 'cell',
            embeddingType: 't-SNE',
          },
        },
        {
          fileType: 'obsSets.csv',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
          options: {
            obsIndex: 'cell_id',
            obsSets: [
              {
                name: 'Cell Type',
                column: ['Cluster', 'Subcluster'],
              },
            ],
          },
          coordinationValues: {
            obsType: 'cell',
          },
        },
        {
          fileType: 'obsFeatureMatrix.csv',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.matrix.csv',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
          },
        },
        {
          fileType: 'image.raster.json',
          options: {
            schemaVersion: '0.0.2',
            images: [
              {
                name: 'Image',
                url: 'https://vitessce-data.storage.googleapis.com/0.0.31/master_release/linnarsson/linnarsson.images.zarr',
                type: 'zarr',
                metadata: {
                  dimensions: [
                    {
                      field: 'channel',
                      type: 'nominal',
                      values: [
                        'polyT',
                        'nuclei',
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
                  isPyramid: true,
                  transform: {
                    translate: {
                      y: 0,
                      x: 0,
                    },
                    scale: 1,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
    spatialZoom: {
      A: -5.5,
    },
    spatialTargetX: {
      A: 16000,
    },
    spatialTargetY: {
      A: 20000,
    },
    spatialSegmentationLayer: {
      A: {
        opacity: 1, radius: 0, visible: true, stroked: false,
      },
    },
    spatialPointLayer: {
      A: {
        opacity: 1, radius: 20, visible: true,
      },
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        description: 'Codeluppi et al., Nature Methods 2018: Spatial organization of the somatosensory cortex revealed by osmFISH',
      },
      x: 0,
      y: 0,
      w: 2,
      h: 1,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        spatialSegmentationLayer: 'A',
        spatialPointLayer: 'A',
      },
      x: 0,
      y: 1,
      w: 2,
      h: 4,
    },
    {
      component: 'status',
      x: 0,
      y: 5,
      w: 2,
      h: 1,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialSegmentationLayer: 'A',
        spatialPointLayer: 'A',
      },
      props: {
        channelNamesVisible: true,
      },
      x: 2,
      y: 0,
      w: 4,
      h: 4,
    },
    {
      component: 'featureList',
      x: 9,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'obsSets',
      x: 9,
      y: 3,
      w: 3,
      h: 2,
    },
    {
      component: 'heatmap',
      props: {
        transpose: true,
      },
      x: 2,
      y: 4,
      w: 5,
      h: 2,
    },
    {
      component: 'featureBarPlot',
      x: 7,
      y: 4,
      w: 5,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'PCA',
        embeddingZoom: 'PCA',
      },
      x: 6,
      y: 0,
      w: 3,
      h: 2,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'TSNE',
        embeddingZoom: 'TSNE',
      },
      x: 6,
      y: 2,
      w: 3,
      h: 2,
    },
  ],
};
