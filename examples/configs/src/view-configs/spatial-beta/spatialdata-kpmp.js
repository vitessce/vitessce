// Exported from https://github.com/vitessce/vitessce-python/blob/main/docs/notebooks/spatial_data_kpmp_vis.ipynb
// TODO: port to JS API here
// TODO: load shapes from sdata.zarr once an obsSegmentations loader is available
export const spatialDataKpmp2023 = {
  version: '1.0.17',
  name: 'SpatialData',
  description: '',
  datasets: [
    {
      uid: 'A',
      name: 'KPMP',
      files: [
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            image: {
              path: 'images/image',
              coordinateSystem: 'global',
            },
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            obsFeatureMatrix: {
              path: 'tables/table_tubules/X',
            },
            obsSegmentations: {
              path: 'shapes/shapes_tubules',
              tablePath: 'tables/table_tubules',
              coordinateSystem: 'global',
            },
          },
          coordinationValues: {
            fileUid: 'labels_tubules',
            obsType: 'Tubule',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            obsSegmentations: {
              path: 'labels/labels_arteries_arterioles',
              tablePath: 'tables/table',
              coordinateSystem: 'global',
            },
          },
          coordinationValues: {
            fileUid: 'labels_arteries_arterioles',
            obsType: 'Artery',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            obsFeatureMatrix: {
              path: 'tables/table_cortical_interstitia/X',
            },
            obsSegmentations: {
              path: 'labels/labels_cortical_interstitia',
              tablePath: 'tables/table_cortical_interstitia',
              coordinateSystem: 'global',
            },
          },
          coordinationValues: {
            fileUid: 'labels_cortical_interstitia',
            obsType: 'Cortical Interstitium',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            obsFeatureMatrix: {
              path: 'tables/table_globally_sclerotic_glomeruli/X',
            },
            obsSegmentations: {
              path: 'labels/labels_globally_sclerotic_glomeruli',
              tablePath: 'tables/table_globally_sclerotic_glomeruli',
              coordinateSystem: 'global',
            },
          },
          coordinationValues: {
            fileUid: 'labels_globally_sclerotic_glomeruli',
            obsType: 'G. S. Glomerulus',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            obsFeatureMatrix: {
              path: 'tables/table_non_globally_sclerotic_glomeruli/X',
            },
            obsSegmentations: {
              path: 'labels/labels_non_globally_sclerotic_glomeruli',
              tablePath: 'tables/table_non_globally_sclerotic_glomeruli',
              coordinateSystem: 'global',
            },
          },
          coordinationValues: {
            fileUid: 'labels_non_globally_sclerotic_glomeruli',
            obsType: 'Non-G. S. Glomerulus',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            obsSegmentations: {
              path: 'labels/labels_interstitialfibrosis_and_tubular_atrophy',
              tablePath: 'tables/table_interstitialfibrosis_and_tubular_atrophy',
              coordinateSystem: 'global',
            },
          },
          coordinationValues: {
            fileUid: 'labels_interstitialfibrosis_and_tubular_atrophy',
            obsType: 'Interstitial Fibrosis and Tubular Atrophy',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
        {
          fileType: 'spatialdata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/kpmp-f2f-march-2023/S-1905-017737/sdata.zarr',
          options: {
            obsFeatureMatrix: {
              path: 'tables/table_peritubular_capillaries/X',
            },
            obsSets: {
              obsSets: [
                {
                  name: 'Cortex and IFTA membership',
                  path: 'tables/table_peritubular_capillaries/obs/cortex_ifta_set',
                },
                {
                  name: 'Cortex membership',
                  path: 'tables/table_peritubular_capillaries/obs/cortex_set',
                },
                {
                  name: 'IFTA membership',
                  path: 'tables/table_peritubular_capillaries/obs/ifta_set',
                },
                {
                  name: 'Cortex and IFTA hierarchy',
                  path: [
                    'tables/table_peritubular_capillaries/obs/cortex_set',
                    'tables/table_peritubular_capillaries/obs/ifta_set',
                  ],
                },
              ],
              tablePath: 'tables/table_peritubular_capillaries',
            },
            obsSegmentations: {
              path: 'labels/labels_peritubular_capillaries',
              tablePath: 'tables/table_peritubular_capillaries',
              coordinateSystem: 'global',
            },
          },
          coordinationValues: {
            fileUid: 'labels_peritubular_capillaries',
            obsType: 'Peritubular Capillaries',
            featureType: 'feature',
            featureValueType: 'value',
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    dataset: {
      A: 'A',
    },
    featureType: {
      A: 'feature',
    },
    featureValueType: {
      A: 'value',
    },
    obsType: {
      A: 'Tubule',
      B: 'Peritubular Capillaries',
      C: 'G. S. Glomerulus',
      D: 'Non-G. S. Glomerulus',
      init_A_obsSegmentations_0: 'Artery',
      init_A_obsSegmentations_1: 'Cortical Interstitium',
      init_A_obsSegmentations_2: 'Interstitial Fibrosis and Tubular Atrophy',
    },
    featureSelection: {
      A: null,
      B: [
        'Area',
      ],
      C: null,
      D: null,
    },
    obsColorEncoding: {
      A: 'spatialChannelColor',
      B: 'cellSetSelection',
      C: 'spatialChannelColor',
      D: 'spatialChannelColor',
      init_A_obsSegmentations_0: 'spatialChannelColor',
      init_A_obsSegmentations_1: 'spatialChannelColor',
      init_A_obsSegmentations_2: 'spatialChannelColor',
    },
    featureValueColormapRange: {
      A: [
        0.02697802596272391,
        1.0,
      ],
      B: [
        0.0,
        0.4759995742718275,
      ],
      init_A_obsSegmentations_0: [
        0,
        1,
      ],
      init_A_obsSegmentations_1: [
        0,
        1,
      ],
      init_A_obsSegmentations_2: [
        0,
        1,
      ],
      init_A_obsSegmentations_3: [
        0,
        1,
      ],
      init_A_obsSegmentations_4: [
        0,
        0.5,
      ],
    },
    imageLayer: {
      init_A_image_0: '__dummy__',
    },
    spatialLayerOpacity: {
      init_A_image_0: 0.1,
    },
    photometricInterpretation: {
      init_A_image_0: 'RGB',
    },
    metaCoordinationScopes: {
      init_A_image_0: {
        imageLayer: [
          'init_A_image_0',
        ],
      },
      init_A_obsSegmentations_0: {
        segmentationLayer: [
          'init_A_obsSegmentations_0',
          'init_A_obsSegmentations_1',
          'init_A_obsSegmentations_2',
          'init_A_obsSegmentations_3',
          'init_A_obsSegmentations_4',
          'init_A_obsSegmentations_5',
          'init_A_obsSegmentations_6',
        ],
      },
    },
    metaCoordinationScopesBy: {
      init_A_image_0: {
        imageLayer: {
          spatialLayerOpacity: {
            init_A_image_0: 'init_A_image_0',
          },
          photometricInterpretation: {
            init_A_image_0: 'init_A_image_0',
          },
        },
      },
      init_A_obsSegmentations_0: {
        segmentationLayer: {
          fileUid: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
          segmentationChannel: {
            init_A_obsSegmentations_0: [
              'init_A_obsSegmentations_0',
            ],
            init_A_obsSegmentations_1: [
              'init_A_obsSegmentations_1',
            ],
            init_A_obsSegmentations_2: [
              'init_A_obsSegmentations_2',
            ],
            init_A_obsSegmentations_3: [
              'init_A_obsSegmentations_3',
            ],
            init_A_obsSegmentations_4: [
              'init_A_obsSegmentations_4',
            ],
            init_A_obsSegmentations_5: [
              'init_A_obsSegmentations_5',
            ],
            init_A_obsSegmentations_6: [
              'init_A_obsSegmentations_6',
            ],
          },
        },
        segmentationChannel: {
          spatialTargetC: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
          obsType: {
            init_A_obsSegmentations_0: 'A',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_3: 'C',
            init_A_obsSegmentations_4: 'D',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_6: 'B',
          },
          featureType: {
            init_A_obsSegmentations_0: 'A',
            init_A_obsSegmentations_1: 'A',
            init_A_obsSegmentations_2: 'A',
            init_A_obsSegmentations_3: 'A',
            init_A_obsSegmentations_4: 'A',
            init_A_obsSegmentations_5: 'A',
            init_A_obsSegmentations_6: 'A',
          },
          featureValueType: {
            init_A_obsSegmentations_0: 'A',
            init_A_obsSegmentations_1: 'A',
            init_A_obsSegmentations_2: 'A',
            init_A_obsSegmentations_3: 'A',
            init_A_obsSegmentations_4: 'A',
            init_A_obsSegmentations_5: 'A',
            init_A_obsSegmentations_6: 'A',
          },
          featureSelection: {
            init_A_obsSegmentations_0: 'A',
            init_A_obsSegmentations_3: 'C',
            init_A_obsSegmentations_4: 'D',
            init_A_obsSegmentations_6: 'B',
          },
          spatialChannelVisible: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
          spatialChannelColor: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
          spatialChannelOpacity: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
          obsColorEncoding: {
            init_A_obsSegmentations_0: 'A',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_3: 'C',
            init_A_obsSegmentations_4: 'D',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_6: 'B',
          },
          featureValueColormapRange: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'A',
            init_A_obsSegmentations_4: 'B',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_4',
          },
          featureAggregationStrategy: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
          spatialSegmentationFilled: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
          obsHighlight: {
            init_A_obsSegmentations_0: 'init_A_obsSegmentations_0',
            init_A_obsSegmentations_1: 'init_A_obsSegmentations_1',
            init_A_obsSegmentations_2: 'init_A_obsSegmentations_2',
            init_A_obsSegmentations_3: 'init_A_obsSegmentations_3',
            init_A_obsSegmentations_4: 'init_A_obsSegmentations_4',
            init_A_obsSegmentations_5: 'init_A_obsSegmentations_5',
            init_A_obsSegmentations_6: 'init_A_obsSegmentations_6',
          },
        },
      },
    },
    segmentationLayer: {
      init_A_obsSegmentations_0: '__dummy__',
      init_A_obsSegmentations_1: '__dummy__',
      init_A_obsSegmentations_2: '__dummy__',
      init_A_obsSegmentations_3: '__dummy__',
      init_A_obsSegmentations_4: '__dummy__',
      init_A_obsSegmentations_5: '__dummy__',
      init_A_obsSegmentations_6: '__dummy__',
    },
    fileUid: {
      init_A_obsSegmentations_0: 'labels_tubules',
      init_A_obsSegmentations_1: 'labels_arteries_arterioles',
      init_A_obsSegmentations_2: 'labels_cortical_interstitia',
      init_A_obsSegmentations_3: 'labels_globally_sclerotic_glomeruli',
      init_A_obsSegmentations_4: 'labels_non_globally_sclerotic_glomeruli',
      init_A_obsSegmentations_5: 'labels_interstitialfibrosis_and_tubular_atrophy',
      init_A_obsSegmentations_6: 'labels_peritubular_capillaries',
    },
    segmentationChannel: {
      init_A_obsSegmentations_0: '__dummy__',
      init_A_obsSegmentations_1: '__dummy__',
      init_A_obsSegmentations_2: '__dummy__',
      init_A_obsSegmentations_3: '__dummy__',
      init_A_obsSegmentations_4: '__dummy__',
      init_A_obsSegmentations_5: '__dummy__',
      init_A_obsSegmentations_6: '__dummy__',
    },
    spatialTargetC: {
      init_A_obsSegmentations_0: 0,
      init_A_obsSegmentations_1: 0,
      init_A_obsSegmentations_2: 0,
      init_A_obsSegmentations_3: 0,
      init_A_obsSegmentations_4: 0,
      init_A_obsSegmentations_5: 0,
      init_A_obsSegmentations_6: 0,
    },
    spatialChannelVisible: {
      init_A_obsSegmentations_0: false,
      init_A_obsSegmentations_1: false,
      init_A_obsSegmentations_2: false,
      init_A_obsSegmentations_3: false,
      init_A_obsSegmentations_4: false,
      init_A_obsSegmentations_5: true,
      init_A_obsSegmentations_6: true,
    },
    spatialChannelColor: {
      init_A_obsSegmentations_0: [
        73,
        155,
        119,
      ],
      init_A_obsSegmentations_1: [
        237,
        226,
        107,
      ],
      init_A_obsSegmentations_2: [
        255,
        255,
        255,
      ],
      init_A_obsSegmentations_3: [
        52,
        113,
        171,
      ],
      init_A_obsSegmentations_4: [
        114,
        179,
        226,
      ],
      init_A_obsSegmentations_5: [
        218,
        161,
        66,
      ],
      init_A_obsSegmentations_6: [
        197,
        101,
        47,
      ],
    },
    spatialChannelOpacity: {
      init_A_obsSegmentations_0: 0.5,
      init_A_obsSegmentations_1: 0.5,
      init_A_obsSegmentations_2: 0.5,
      init_A_obsSegmentations_3: 0.5,
      init_A_obsSegmentations_4: 0.5,
      init_A_obsSegmentations_5: 1.0,
      init_A_obsSegmentations_6: 1.0,
    },
    featureAggregationStrategy: {
      init_A_obsSegmentations_0: 'first',
      init_A_obsSegmentations_1: 'first',
      init_A_obsSegmentations_2: 'first',
      init_A_obsSegmentations_3: 'first',
      init_A_obsSegmentations_4: 'first',
      init_A_obsSegmentations_5: 'first',
      init_A_obsSegmentations_6: 'first',
    },
    spatialSegmentationFilled: {
      init_A_obsSegmentations_0: true,
      init_A_obsSegmentations_1: true,
      init_A_obsSegmentations_2: true,
      init_A_obsSegmentations_3: true,
      init_A_obsSegmentations_4: true,
      init_A_obsSegmentations_5: false,
      init_A_obsSegmentations_6: true,
    },
    obsHighlight: {
      init_A_obsSegmentations_0: null,
      init_A_obsSegmentations_1: null,
      init_A_obsSegmentations_2: null,
      init_A_obsSegmentations_3: null,
      init_A_obsSegmentations_4: null,
      init_A_obsSegmentations_5: null,
      init_A_obsSegmentations_6: null,
    },
  },
  layout: [
    {
      component: 'spatialBeta',
      coordinationScopes: {
        dataset: 'A',
        metaCoordinationScopes: [
          'init_A_image_0',
          'init_A_obsSegmentations_0',
        ],
        metaCoordinationScopesBy: [
          'init_A_image_0',
          'init_A_obsSegmentations_0',
        ],
      },
      x: 0,
      y: 0,
      w: 9,
      h: 4,
    },
    {
      component: 'layerControllerBeta',
      coordinationScopes: {
        dataset: 'A',
        metaCoordinationScopes: [
          'init_A_image_0',
          'init_A_obsSegmentations_0',
        ],
        metaCoordinationScopesBy: [
          'init_A_image_0',
          'init_A_obsSegmentations_0',
        ],
      },
      x: 9,
      y: 0,
      w: 3,
      h: 4,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'A',
        obsColorEncoding: 'A',
      },
      x: 0,
      y: 4,
      w: 3,
      h: 2,
      props: {
        title: 'Tubules',
      },
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'A',
        obsColorEncoding: 'A',
      },
      x: 0,
      y: 6,
      w: 3,
      h: 2,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'B',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'B',
        obsColorEncoding: 'B',
      },
      x: 3,
      y: 4,
      w: 3,
      h: 2,
      props: {
        title: 'Peritubular Capillaries',
      },
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'B',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'B',
        obsColorEncoding: 'B',
      },
      x: 3,
      y: 6,
      w: 3,
      h: 2,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'C',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'C',
        obsColorEncoding: 'C',
        featureValueColormapRange: 'A',
      },
      x: 6,
      y: 4,
      w: 3,
      h: 2,
      props: {
        title: 'Globally Sclerotic Glomeruli',
      },
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'C',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'C',
        obsColorEncoding: 'C',
        featureValueColormapRange: 'A',
      },
      x: 6,
      y: 6,
      w: 3,
      h: 2,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'D',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'D',
        obsColorEncoding: 'D',
        featureValueColormapRange: 'B',
      },
      x: 9,
      y: 4,
      w: 3,
      h: 2,
      props: {
        title: 'Non-Globally Sclerotic Glomeruli',
      },
    },
    {
      component: 'featureValueHistogram',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'D',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'D',
        obsColorEncoding: 'D',
        featureValueColormapRange: 'B',
      },
      x: 9,
      y: 6,
      w: 3,
      h: 2,
    },
    {
      component: 'obsSets',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'B',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'B',
        obsColorEncoding: 'B',
      },
      x: 0,
      y: 8,
      w: 4,
      h: 4,
    },
    {
      component: 'obsSetSizes',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'B',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'B',
        obsColorEncoding: 'B',
      },
      x: 4,
      y: 8,
      w: 4,
      h: 4,
    },
    {
      component: 'obsSetFeatureValueDistribution',
      coordinationScopes: {
        dataset: 'A',
        obsType: 'B',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'B',
        obsColorEncoding: 'B',
      },
      x: 8,
      y: 8,
      w: 4,
      h: 4,
      props: {
        jitter: true,
      },
    },
  ],
  initStrategy: 'auto',
};
