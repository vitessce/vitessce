export const visiumSpatialViewer = {
  coordinationSpace: {
    embeddingZoom: {
      UMAP: 0,
    },
    dataset: {
      A: 'A',
    },
    embeddingType: {
      UMAP: 'UMAP',
    },
    embeddingCellRadiusMode: {
      UMAP: 'manual',
    },
    embeddingCellRadius: {
      UMAP: 3,
    },
    spatialCellsLayer: {
      is_visible: {
        opacity: 1,
        radius: 10,
        visible: true,
        stroked: false,
      },
      is_not_visible: {
        opacity: 1,
        radius: 10,
        visible: false,
        stroked: false,
      },
    },
  },
  datasets: [
    {
      files: [
        {
          type: 'cells',
          fileType: 'anndata-cells.zarr',
          url: 'https://data-1.vitessce.io/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr',
          options: {
            xy: 'obsm/spatial',
            mappings: {
              UMAP: {
                key: 'obsm/X_umap',
                dims: [
                  0,
                  1,
                ],
              },
            },
          },
        },
        {
          type: 'expression-matrix',
          fileType: 'anndata-expression-matrix.zarr',
          url: 'https://data-1.vitessce.io/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.h5ad.zarr',
          options: {
            matrix: 'X',
          },
        },
        {
          fileType: 'raster.json',
          options: {
            images: [
              {
                name: 'XY02_Stitch-ome.zarr',
                type: 'ome-zarr',
                url: 'https://vitessce-data.storage.googleapis.com/0.0.33/main/human-lymph-node-10x-visium/human_lymph_node_10x_visium.ome.zarr',
              },
            ],
            schemaVersion: '0.0.2',
            usePhysicalSizeScaling: false,
          },
          type: 'raster',
        },
      ],
      name: 'Visualization Files',
      uid: 'A',
    },
  ],
  description: '10x Visium Spatial Gene Expression',
  initStrategy: 'auto',
  layout: [
    {
      component: 'description',
      coordinationScopes: {
        dataset: 'A',
      },
      h: 3,
      w: 3,
      x: 0,
      y: 0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialCellsLayer: 'is_visible',
        dataset: 'A',
      },
      h: 6,
      w: 4,
      x: 3,
      y: 0,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialCellsLayer: 'is_not_visible',
        dataset: 'A',
      },
      h: 6,
      w: 4,
      x: 3,
      y: 0,
    },
    {
      component: 'scatterplot',
      coordinationScopes: {
        embeddingType: 'UMAP',
        embeddingZoom: 'UMAP',
        embeddingCellRadiusMode: 'UMAP',
        embeddingCellRadius: 'UMAP',
      },
      h: 12,
      w: 5,
      x: 7,
      y: 0,
    },
    {
      component: 'genes',
      x: 0,
      y: 3,
      w: 3,
      h: 5,
    },
    {
      component: 'expressionHistogram',
      x: 0,
      y: 7,
      w: 3,
      h: 4,
    },
  ],
  name: 'Spatial Viewer',
  version: '1.0.4',
};
