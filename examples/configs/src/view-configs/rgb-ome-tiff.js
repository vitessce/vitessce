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
          url: 'https://assets.hubmapconsortium.org/a4be39d9c1606130450a011d2f1feeff/ometiff-pyramids/processedMicroscopy/VAN0012-RK-102-167-PAS_IMS_images/VAN0012-RK-102-167-PAS_IMS-registered.ome.tif',
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
      component: 'spatialBeta',
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'layerControllerBeta',
      props: {
        disableChannelsIfRgbDetected: true,
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
