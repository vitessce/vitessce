export const petukhov2021 = {
  name: 'Baysor gut dataset',
  version: 'next',
  description: 'Baysor gut example',
  public: true,
  datasets: [
    {
      uid: 'baysor-gut-2021',
      name: 'Baysor gut 2021',
      description: 'Petukhov et al. 2021, Cell segmentation in imaging-based spatial transcriptomics',
      files: [
        {
          type: 'cells',
          fileType: 'cells.geojson',
          url: 'https://storage.googleapis.com/vitessce-demo-data/baysor-mouse-ileum/poly_per_z_5.json',
        },
        {
          type: 'expression-matrix',
          fileType: 'anndata-expression-matrix.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/baysor-mouse-ileum/cells.zarr',
          options: {
            matrix: 'X',
          },
        },
        {
          type: 'molecules',
          fileType: 'anndata-molecules.zarr',
          url: 'https://storage.googleapis.com/vitessce-demo-data/baysor-mouse-ileum/molecules.zarr',
          options: {
            spatial: 'obsm/spatial',
            rgb: 'obsm/rgb',
            cellIndex: 'obs/cell_id',
            geneIndex: 'obs/gene_index',
          },
        },
        {
          type: 'raster',
          fileType: 'raster.json',
          options: {
            images: [
              {
                metadata: {
                  isBitmask: false,
                },
                name: 'Stains',
                type: 'ome-tiff',
                url: 'https://storage.googleapis.com/vitessce-demo-data/baysor-mouse-ileum/stains/selected.ome.tiff',
              },
            ],
            schemaVersion: '0.0.2',
            usePhysicalSizeScaling: false,
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialRasterLayers: {
      A: [
        {
          index: 0,
          type: 'raster',
          domainType: 'Min/Max',
          use3d: false,
          visible: true,
          transparentColor: null,
          renderingMode: 'Additive',
          colormap: null,
          opacity: 1,
          channels: [
            {
              selection: {
                c: 0,
                t: 0,
                z: 0,
              },
              color: [
                255,
                255,
                255,
              ],
              visible: true,
              slider: [
                0,
                255,
              ],
            },
            {
              selection: {
                c: 1,
                t: 0,
                z: 0,
              },
              color: [
                0,
                0,
                255,
              ],
              visible: false,
              slider: [
                0,
                255,
              ],
            },
            {
              selection: {
                c: 2,
                t: 0,
                z: 0,
              },
              color: [
                255,
                0,
                0,
              ],
              visible: false,
              slider: [
                0,
                255,
              ],
            },
          ],
        },
      ],
    },
    spatialMoleculesLayer: {
      A: {
        opacity: 1,
        radius: 20,
        visible: true,
        use3d: true,
      },
    },
  },
  layout: [
    {
      component: 'description',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      component: 'layerController',
      x: 0,
      y: 1,
      w: 2,
      h: 8,
      coordinationScopes: {
        spatialRasterLayers: 'A',
        spatialMoleculesLayer: 'A',
      },
    },
    {
      component: 'status',
      x: 0,
      y: 10,
      w: 2,
      h: 2,
    },
    {
      component: 'genes',
      props: {
        enableMoleculeSelection: true,
      },
      x: 6,
      y: 0,
      w: 2,
      h: 12,
    },
    {
      component: 'heatmap',
      x: 8,
      y: 0,
      w: 4,
      h: 12,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialRasterLayers: 'A',
        spatialMoleculesLayer: 'A',
      },
      x: 2,
      y: 0,
      w: 4,
      h: 12,
    },
  ],
};
