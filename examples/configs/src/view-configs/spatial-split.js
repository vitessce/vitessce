export const codeluppiSpatialSplit = {
  name: 'Codeluppi et al., Nature Methods 2018',
  description: 'Spatial organization of the somatosensory cortex revealed by osmFISH',
  version: '1.0.16',
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
          fileType: 'obsLocations.csv',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.molecules.csv',
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
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.molecules.csv',
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
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.matrix.csv',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
          },
        },
        {
          fileType: 'image.raster.json',
          coordinationValues: {
            spatialImageLayer: 'linnarsson',
            // TODO: if an image file contains multiple "images", add functionality to .options to enable each to be mapped to a separate spatialImageLayer.
          },
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
    obsType: {
      pointScopeA: 'molecule',
      segmentationScopeA: 'cell',
    },
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
    spatialImageLayer: {
      A: 'linnarsson',
    },
    spatialLayerVisible: {
      visibilityScopeA: true,
    },
    spatialImageColormap: {
      colormapScopeA: 'viridis',
    },
    spatialImageChannel: {
      A_1: 'A_1',
      A_2: 'A_2',
    },
    spatialTargetC: {
      channelScopeA1: 0,
      channelScopeA2: 1,
    },
    spatialImageChannelMode: {
      channelModeScopeA: null,
    },
    featureSelection: {
      featureSelectionScopeA: null,
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
    spatialImageChannelVisible: {
      A_1: true,
      A_2: true,
    },
    spatialImageChannelColor: {
      A_1: [255, 0, 0],
      A_2: [0, 0, 255],
    },
    spatialImageChannelRange: {
      A_1: null,
      A_2: null,
    },
    spatialImageChannelRangeExtentMode: {
      A_1: null,
      A_2: null,
    },
  },
  layout: [
    {
      component: 'layerControllerV2',
      coordinationScopes: {
        spatialPointLayer: 'A',
        spatialSegmentationLayer: 'A',
        spatialImageLayer: ['A'],
      },
      coordinationScopesBy: {
        spatialPointLayer: {
          obsType: { A: 'pointScopeA' },
        },
        spatialSegmentationLayer: {
          obsType: { A: 'segmentationScopeA' },
        },
        spatialImageLayer: {
          spatialLayerVisible: { A: 'visibilityScopeA' },
          spatialImageColormap: { A: 'colormapScopeA' },
          spatialImageChannelMode: { A: 'channelModeScopeA' },
          featureSelection: { A: 'featureSelectionScopeA' },
          spatialImageChannel: {
            A: ['A_1', 'A_2'],
          },
        },
        spatialImageChannel: {
          spatialTargetC: {
            A_1: 'channelScopeA1',
            A_2: 'channelScopeA2',
          },
          spatialImageChannelVisible: {
            A_1: 'A_1',
            A_2: 'A_2',
          },
          spatialImageChannelColor: {
            A_1: 'A_1',
            A_2: 'A_2',
          },
          spatialImageChannelRange: {
            A_1: 'A_1',
            A_2: 'A_2',
          },
          spatialImageChannelRangeExtentMode: {
            A_1: 'A_1',
            A_2: 'A_2',
          },
        },
      },
      x: 0,
      y: 1,
      w: 2,
      h: 4,
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
      x: 2,
      y: 0,
      w: 4,
      h: 4,
    },
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
      component: 'status',
      x: 0,
      y: 5,
      w: 2,
      h: 1,
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
  ],
};
