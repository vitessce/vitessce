export const kuppe2022nature = {
  version: '1.0.15',
  name: 'Kuppe et al., 2022 Nature',
  description: 'Spatial multi-omic map of human myocardial infarction. Visium slide from patient P9, region GT/IZ_P9',
  datasets: [{
    uid: 'kuppe_2022_nature',
    name: 'kuppe_2022_nature',
    files: [
      {
        fileType: 'obsSets.anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/kuppe-2022/kuppe_2022_nature.joint.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
        },
        options: [
          {
            name: 'Cell Type',
            path: 'obs/cell_type',
          },
          {
            name: 'Development Stage',
            path: 'obs/development_stage',
          },
          {
            name: 'Disease',
            path: 'obs/disease',
          },
          {
            name: 'Sex',
            path: 'obs/sex',
          },
        ],
      },
      {
        fileType: 'anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/kuppe-2022/kuppe_2022_nature.rna.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
          featureType: 'gene',
          featureValueType: 'transcript count',
        },
        options: {
          obsFeatureMatrix: {
            path: 'X',
          },
          featureLabels: {
            path: 'var/feature_name',
          },
          obsEmbedding: [
            {
              path: 'obsm/X_umap',
              embeddingType: 'snRNA UMAP',
            },
            {
              path: 'obsm/X_pca',
              embeddingType: 'snRNA PCA',
            },
          ],
        },
      },
      {
        fileType: 'anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/kuppe-2022/kuppe_2022_nature.atac.h5ad.zarr',
        coordinationValues: {
          obsType: 'cell',
          featureType: 'gene',
          featureValueType: 'mapped peak count',
        },
        options: {
          obsFeatureMatrix: {
            path: 'X',
          },
          featureLabels: {
            path: 'var/feature_name',
          },
          obsEmbedding: [
            {
              path: 'obsm/X_umap',
              embeddingType: 'snATAC UMAP',
            },
          ],
        },
      },
      {
        fileType: 'anndata.zarr',
        url: 'https://data-1.vitessce.io/0.0.33/main/kuppe-2022/kuppe_2022_nature.visium.h5ad.zarr',
        coordinationValues: {
          obsType: 'spot',
          featureType: 'gene',
          featureValueType: 'detection count',
        },
        options: {
          obsLocations: {
            path: 'obsm/xy_scaled',
          },
          obsSegmentations: {
            path: 'obsm/xy_segmentations_scaled',
          },
          obsFeatureMatrix: {
            path: 'X',
          },
          featureLabels: {
            path: 'var/feature_name',
          },
          obsSets: [
            {
              name: 'Spot Type',
              path: 'obs/cell_type',
            },
            {
              name: 'Development Stage',
              path: 'obs/development_stage',
            },
            {
              name: 'Disease',
              path: 'obs/disease',
            },
            {
              name: 'Sex',
              path: 'obs/sex',
            },
          ],
        },
      },
      {
        fileType: 'image.ome-zarr',
        url: 'https://vitessce-data.storage.googleapis.com/0.0.33/main/kuppe-2022/kuppe_2022_nature.visium.ome.zarr',
      },
    ],
  }],
  initStrategy: 'auto',
  coordinationSpace: {
    embeddingType: {
      RNA_UMAP: 'snRNA UMAP',
      RNA_PCA: 'snRNA PCA',
      ATAC_UMAP: 'snATAC UMAP',
    },
    obsType: {
      A: 'cell',
      B: 'spot',
    },
    featureType: {
      A: 'gene',
    },
    featureValueType: {
      A: 'transcript count',
      B: 'mapped peak count',
      C: 'detection count',
    },
    featureSelection: {
      A: null,
    },
    obsColorEncoding: {
      A: 'cellSetSelection',
    },
    obsSetSelection: {
      A: null,
      B: null,
    },
    obsSetColor: {
      A: null,
      B: null,
    },
    featureValueColormapRange: {
      A: [0, 0.1],
      B: [0, 0.1],
    },
    embeddingObsSetLabelsVisible: {
      A: true,
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
              selection: { c: 0 },
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
              selection: { c: 1 },
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
              selection: { c: 2 },
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
    spatialSegmentationLayer: {
      A: {
        radius: 65, stroked: true, visible: true, opacity: 1,
      },
    },
  },
  layout: [
    {
      component: 'obsSets',
      h: 2,
      w: 3,
      x: 3,
      y: 4,
      coordinationScopes: {
        obsType: 'A',
        obsColorEncoding: 'A',
        obsSetSelection: 'A',
        obsSetColor: 'A',
      },
      uid: 'A-cell',
    },
    {
      component: 'obsSets',
      h: 2,
      w: 3,
      x: 3,
      y: 6,
      coordinationScopes: {
        obsType: 'B',
        obsColorEncoding: 'A',
        obsSetSelection: 'B',
        obsSetColor: 'B',
      },
      uid: 'A-spot',
    },
    {
      component: 'spatial',
      h: 4,
      w: 4,
      x: 8,
      y: 0,
      coordinationScopes: {
        obsType: 'B',
        obsColorEncoding: 'A',
        obsSetColor: 'B',
        obsSetSelection: 'B',
        featureType: 'A',
        featureValueType: 'C',
        spatialSegmentationLayer: 'A',
        spatialImageLayer: 'A',
        featureSelection: 'A',
      },
      uid: 'B',
    },
    {
      component: 'scatterplot',
      h: 4,
      w: 4,
      x: 0,
      y: 0,
      coordinationScopes: {
        embeddingType: 'RNA_UMAP',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'A',
        featureSelection: 'A',
        obsColorEncoding: 'A',
        obsSetColor: 'A',
        obsSetSelection: 'A',
        featureValueColormapRange: 'A',
        embeddingObsSetLabelsVisible: 'A',
      },
      uid: 'C',
    },
    {
      component: 'scatterplot',
      h: 4,
      w: 4,
      x: 4,
      y: 0,
      coordinationScopes: {
        embeddingType: 'ATAC_UMAP',
        obsType: 'A',
        featureType: 'A',
        featureValueType: 'B',
        featureSelection: 'A',
        obsColorEncoding: 'A',
        obsSetColor: 'A',
        obsSetSelection: 'A',
        featureValueColormapRange: 'B',
        embeddingObsSetLabelsVisible: 'A',
      },
      uid: 'D',
    },
    {
      component: 'featureList',
      h: 4,
      w: 3,
      x: 6,
      y: 4,
      coordinationScopes: {
        featureType: 'A',
        featureSelection: 'A',
        obsColorEncoding: 'A',
      },
      uid: 'E',
    },
    {
      component: 'description',
      h: 4,
      w: 3,
      x: 0,
      y: 4,
      uid: 'H',
    },
    {
      component: 'layerController',
      coordinationScopes: {
        obsType: 'B',
        spatialSegmentationLayer: 'A',
        spatialImageLayer: 'A',
      },
      h: 4,
      w: 3,
      x: 9,
      y: 4,
      uid: 'I',
    },
  ],
};
