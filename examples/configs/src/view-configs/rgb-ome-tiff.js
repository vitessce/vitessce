export const rgbOmeTiff = {
  version: '1.0.6',
  name: 'HBM836.VTFP.364',
  description: 'Periodic acid-Schiff stained microscopy collected from the right kidney.',
  public: true,
  datasets: [
    {
      uid: 'HBM836.VTFP.364',
      name: 'HBM836.VTFP.364',
      files: [
        {
          fileType: 'image.ome-tiff',
          url: 'https://assets.hubmapconsortium.org/f273b4e4c5b759a904736c96be7c17ec/ometiff-pyramids/lab_processed/images/VAN0052-RK-3-81-PAS.ome.tif?token=',
          options: {
            offsetsUrl: 'https://assets.hubmapconsortium.org/f273b4e4c5b759a904736c96be7c17ec/output_offsets/lab_processed/images/VAN0052-RK-3-81-PAS.offsets.json?token=',
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    photometricInterpretation: {
      'init_HBM836.VTFP.364_image_0': 'RGB',
    },
  },
  initStrategy: 'auto',
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        photometricInterpretation: 'init_HBM836.VTFP.364_image_0',
      },
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        photometricInterpretation: 'init_HBM836.VTFP.364_image_0',
      },
      x: 8,
      y: 0,
      w: 4,
      h: 6,
    },
    {
      component: 'description',
      x: 8,
      y: 6,
      w: 4,
      h: 3,
    },
    {
      component: 'status',
      x: 8,
      y: 9,
      w: 4,
      h: 3,
    },
  ],
};
