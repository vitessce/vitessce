export const network_vis = {
    name: 'network_vis',
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
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.segmentations.json',
          },
          {
            fileType: 'obsLocations.csv',
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
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
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
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
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
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
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
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
            fileType: 'obsLocations.csv',
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.molecules.csv',
            options: {
              obsIndex: 'molecule_id',
              obsLocations: ['X', 'Y'],
            },
            coordinationValues: {
              obsType: 'molecule',
            },
          },
          {
            fileType: 'obsLabels.csv',
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.molecules.csv',
            options: {
              obsIndex: 'molecule_id',
              obsLabels: 'Gene',
            },
            coordinationValues: {
              obsType: 'molecule',
            },
          },
          {
            fileType: 'obsFeatureMatrix.csv',
            url: 'https://data-1.vitessce.io/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.matrix.csv',
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
          description: 'Example Glomeruli Network Visualization',
        },
        x: 0,
        y: 0,
        w: 3,
        h: 6,
      },
      {
        component: 'network-vis',
        x: 3,
        y: 0,
        w: 9,
        h: 6,
      },
      // {
      //   component: 'graph-network',
      //   x: 3,
      //   y: 3,
      //   w: 9,
      //   h: 2,
      // },
      
    ],
    
  };
  