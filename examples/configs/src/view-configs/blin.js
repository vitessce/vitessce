

const blinName = 'Blin et al., PLoS Biol 2019';
const blinDescription = 'Mouse blastocysts imaged by confocal microscopy';
export const blin2019 = {
  version: '1.0.6',
  name: blinName,
  description: blinDescription,
  public: true,
  datasets: [
    {
      uid: 'idr0062-blin-nuclearsegmentation/6001240',
      name: 'idr0062-blin-nuclearsegmentation/6001240',
      files: [
        {
          fileType: 'image.ome-zarr',
          url: 'https://minio-dev.openmicroscopy.org/idr/v0.3/idr0062-blin-nuclearsegmentation/6001240.zarr',
          options: {
            coordinateTransformations: [
              {
                type: 'translation',
                translation: [1, 1],
              },
              {
                type: 'scale',
                scale: [0.5, 0.5, 0.5],
              },
            ],
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  layout: [
    {
      component: 'spatial',
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
