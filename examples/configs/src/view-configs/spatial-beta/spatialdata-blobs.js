

const baseUrl = 'https://storage.googleapis.com/vitessce-demo-data/spatialdata-august-2025/blobs_with_feature_index.sdata.zarr';

// Configured using the blobs EasyVitessce example notebook.
// Reference: https://github.com/vitessce/easy_vitessce/blob/main/docs/notebooks/spatialdata_blobs.ipynb
export const spatialdataBlobsConfig = {
  version: '1.0.18',
  name: 'SpatialData Plot',
  description: '',
  datasets: [
    {
      uid: 'A',
      name: 'SpatialData Dataset',
      files: [
        {
          fileType: 'spatialdata.zarr',
          url: baseUrl,
          options: {
            obsFeatureMatrix: {
              path: 'tables/table/X',
            },
            obsSegmentations: {
              path: 'labels/blobs_labels',
              tablePath: 'tables/table',
            },
          },
          coordinationValues: {
            fileUid: 'labels_blobs_labels',
            obsType: 'cell',
            featureType: 'channel',
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: baseUrl,
          options: {
            obsPoints: {
              path: 'points/blobs_points',
              tablePath: 'tables/table_points',
              // featureIndexColumn: 'genes_codes', // Should be automatically used.
            },
            obsFeatureMatrix: {
              path: 'tables/table_points/X',
            },
          },
          coordinationValues: {
            fileUid: 'points_blobs_points',
            obsType: 'point',
            featureType: 'gene',
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    obsType: {
      A: 'cell',
      init_A_obsSegmentations_0: 'cell',
      init_A_obsPoints_0: 'point',
    },
    featureType: {
      A: 'gene',
      init_A_obsSegmentations_0: 'channel',
    },
    featureSelection: {
      A: [
        'channel_0_sum',
      ],
      gene: null,
    },
    featureValueColormap: {
      A: 'viridis',
    },
    segmentationLayer: {
      init_A_obsSegmentations_0: '__dummy__',
    },
    fileUid: {
      init_A_obsSegmentations_0: 'labels_blobs_labels',
      init_A_obsPoints_0: 'points_blobs_points',
    },
    spatialLayerVisible: {
      init_A_obsSegmentations_0: true,
    },
    segmentationChannel: {
      init_A_obsSegmentations_0: '__dummy__',
    },
    spatialChannelVisible: {
      init_A_obsSegmentations_0: true,
    },
    obsHighlight: {
      init_A_obsSegmentations_0: null,
      init_A_obsPoints_0: null,
    },
    obsColorEncoding: {
      init_A_obsSegmentations_0: 'geneSelection',
    },
    spatialChannelOpacity: {
      init_A_obsSegmentations_0: 0.4,
    },
    metaCoordinationScopes: {
      init_A_obsSegmentations_0: {
        segmentationLayer: [
          'init_A_obsSegmentations_0',
        ],
      },
      init_A_obsPoints_0: {
        pointLayer: [
          'init_A_obsPoints_0',
        ],
      },
    },
    metaCoordinationScopesBy: {
      init_A_obsSegmentations_0: {
        segmentationLayer: {
          fileUid: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
          spatialLayerVisible: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
          segmentationChannel: {
            init_A_obsSegmentations_0: [
              'init_A_obsSegmentations_0',
            ],
          },
        },
        segmentationChannel: {
          obsType: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
          featureType: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
          featureSelection: {
            init_A_obsSegmentations_0: 'A',
          },
          featureValueColormap: {
            init_A_obsSegmentations_0: 'A',
          },
          spatialChannelVisible: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
          obsHighlight: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
          obsColorEncoding: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
          spatialChannelOpacity: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
          },
        },
      },
      init_A_obsPoints_0: {
        pointLayer: {
          obsType: {
            init_A_obsPoints_0: 'init_A_obsPoints_0',
          },
          obsHighlight: {
            init_A_obsPoints_0: 'init_A_obsPoints_0',
          },
          fileUid: {
            init_A_obsPoints_0: 'init_A_obsPoints_0',
          },
          featureSelection: {
            init_A_obsPoints_0: 'gene',
          },
        },
      },
    },
    pointLayer: {
      init_A_obsPoints_0: '__dummy__',
    },
  },
  layout: [
    {
      component: 'spatialBeta',
      coordinationScopes: {
        dataset: 'A',
        metaCoordinationScopes: [
          'init_A_obsSegmentations_0',
          'init_A_obsPoints_0',
        ],
        metaCoordinationScopesBy: [
          'init_A_obsSegmentations_0',
          'init_A_obsPoints_0',
        ],
      },
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'layerControllerBeta',
      coordinationScopes: {
        dataset: 'A',
        metaCoordinationScopes: [
          'init_A_obsSegmentations_0',
          'init_A_obsPoints_0',
        ],
        metaCoordinationScopesBy: [
          'init_A_obsSegmentations_0',
          'init_A_obsPoints_0',
        ],
      },
      x: 8,
      y: 0,
      w: 4,
      h: 6,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        featureType: 'init_A_obsSegmentations_0',
        featureSelection: 'A',
        featureValueColormap: 'A',
      },
      x: 8,
      y: 6,
      w: 4,
      h: 3,
      coordinationScopesBy: {},
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'init_A_obsPoints_0',
        featureType: 'A',
        featureSelection: 'gene',
        featureValueColormap: 'A',
      },
      x: 8,
      y: 9,
      w: 4,
      h: 3,
      coordinationScopesBy: {},
    },
  ],
  initStrategy: 'auto',
};
