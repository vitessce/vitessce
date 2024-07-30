export const codex = {
  version: '1.0.15',
  name: 'CODEX',
  description: '',
  datasets: [
    {
      uid: 'A',
      name: 'CODEX',
      files: [
        {
          fileType: 'anndata.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/codex/A/0/cd901da1-0514-4cf4-a939-41bef2614dab',
          options: {
            obsLocations: {
              path: 'obsm/xy',
            },
            obsEmbedding: [
              {
                path: 'obsm/tsne',
                dims: [
                  0,
                  1,
                ],
                embeddingType: 't-SNE',
              },
            ],
            obsSets: [
              {
                name: 'Cell K-Means [Mean] Expression',
                path: 'obs/Cell K-Means [Mean] Expression',
              },
            ],
            obsFeatureMatrix: {
              path: 'X',
            },
          },
          coordinationValues: {
            obsType: 'cell',
            featureType: 'antigen',
            featureValueType: 'expression',
          },
        },
        {
          fileType: 'raster.json',
          options: {
            schemaVersion: '0.0.2',
            usePhysicalSizeScaling: false,
            images: [
              {
                name: 'Segmentations',
                type: 'ome-tiff',
                url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/codex/A/1/eae219c2-ddbc-4ebb-98a7-47c82e444619',
                metadata: {
                  omeTiffOffsetsUrl: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/codex/A/1/6c1864e1-1f1a-43ee-a13b-53e68c89c06c',
                  isBitmask: true,
                },
              },
              {
                name: 'Image',
                type: 'ome-tiff',
                url: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/codex/A/1/903dfc3b-0dbc-425a-96a7-71136bb010a2',
                metadata: {
                  omeTiffOffsetsUrl: 'https://storage.googleapis.com/vitessce-demo-data/paper-figures-august-2023/codex/A/1/8ce83835-db34-4bde-8ae5-6643eb74c375',
                  isBitmask: false,
                },
              },
            ],
            renderLayers: [
              'Segmentations',
              'Image',
            ],
          },
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
    featureType: {
      A: 'antigen',
    },
    featureSelection: {
      A: [
        'CD20',
      ],
    },
    featureValueColormapRange: {
      A: [
        0,
        0.25,
      ],
    },
    embeddingZoom: {
      A: 26.572,
    },
    spatialTargetX: {
      A: 2779.069,
    },
    spatialTargetY: {
      A: 2438.511,
    },
    spatialZoom: {
      A: -3.7195,
    },
  },
  layout: [
    {
      component: 'layerController',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
      },
      x: 0.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
      },
      x: 3.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        dataset: 'A',
        embeddingType: 'A',
        featureType: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
        embeddingZoom: 'A',
      },
      x: 6.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'featureList',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
      },
      x: 9.0,
      y: 0.0,
      w: 3.0,
      h: 6.0,
    },
    {
      component: 'description',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
      },
      x: 0.0,
      y: 6.0,
      w: 4.0,
      h: 6.0,
    },
    {
      component: 'heatmap',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
      },
      x: 4.0,
      y: 6.0,
      w: 4.0,
      h: 6.0,
      props: {
        transpose: true,
      },
    },
    {
      component: 'obsSets',
      coordinationScopes: {
        dataset: 'A',
        featureType: 'A',
        featureSelection: 'A',
        featureValueColormapRange: 'A',
      },
      x: 8.0,
      y: 6.0,
      w: 4.0,
      h: 6.0,
    },
  ],
  initStrategy: 'auto',
};
