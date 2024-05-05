export const threeDemoConfig = {
  version: '1.0.6',
  name: 'Three example',
  description: '',
  public: true,
  datasets: [
    {
      uid: 'idr0062-blin-nuclearsegmentation/6001240',
      name: 'idr0062-blin-nuclearsegmentation/6001240',
      files: [
        {
          fileType: 'image.ome-tiff',
          url: 'https://viv-demo.storage.googleapis.com/idr0106.pyramid.ome.tif',
        },
      ],
    },
  ],
  initStrategy: 'auto',
  layout: [
    {
      component: 'spatialBeta',
      props: {
        threeFor3d: true,
      },
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'layerController',
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
