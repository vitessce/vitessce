export const borm2022 = {
  name: 'Borm et al. 2022',
  version: 'next',
  description: '',
  public: true,
  datasets: [
    {
      uid: 'borm-2022',
      name: 'Borm et al. 2022',
      description: '',
      files: [
        {
          type: 'molecules',
          fileType: 'anndata-molecules.zarr',
          url: 'http://localhost:8000/data/processed/borm_2022.h5ad.zarr',
          options: {
            spatial: 'obsm/spatial',
            rgb: 'obsm/rgb',
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialTargetX: {
      A: -24682,
    },
    spatialTargetY: {
      A: -25433,
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
      component: 'status',
      x: 0,
      y: 10,
      w: 2,
      h: 2,
    },
    {
      component: 'spatial',
      coordinationScopes: {
        spatialMoleculesLayer: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
      },
      x: 2,
      y: 0,
      w: 4,
      h: 12,
    },
  ],
};
