/* eslint-disable */
export const merfish2022 = {
  name: 'MERFISH',
  version: 'next',
  description: '',
  public: true,
  datasets: [
    {
      uid: 'merfish-2022',
      name: 'MERFISH mouse ileum',
      description: 'Imaging-based spatial transcriptomics',
      files: [
        {
          type: 'molecules',
          fileType: 'anndata-molecules-by-fov.zarr',
          url: 'http://localhost:8000/data/processed/barcodes.zarr',
        },
        {
          type: 'raster',
          fileType: 'raster.ome-zarr',
          url: 'http://localhost:8000/data/processed/fov.zarr',
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialTargetX: {
      A: -9000.0
    },
    spatialTargetY: {
      A: -1100.0,
    },
    spatialZoom: {
      A: 1.0,
    },
    spatialSliceZ: {
      A: 0,
    },
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
        use3d: false,
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
        spatialSliceZ: 'A',
        //spatialRasterLayers: 'A',
        //spatialMoleculesLayer: 'A',
      },
    },
    {
      component: 'status',
      x: 0,
      y: 10,
      w: 2,
      h: 2,
    },
    /*{
      component: 'genes',
      props: {
        enableMoleculeSelection: true,
      },
      x: 6,
      y: 0,
      w: 2,
      h: 12,
    },*/
    {
      component: 'spatial',
      coordinationScopes: {
        spatialSliceZ: 'A',
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        //spatialRasterLayers: 'A',
        //spatialMoleculesLayer: 'A',
      },
      x: 2,
      y: 0,
      w: 4,
      h: 12,
    },
  ],
};
