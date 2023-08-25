const blinName = 'Blin et al., PLoS Biol 2019';
const blinDescription = 'Mouse blastocysts imaged by confocal microscopy';
export const spatialDataImage = {
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
          url: 'http://localhost:8000/visium.zarr/images/ST8059048_image'
          // The s3 bucket does not allow CORS access
          // url: 'https://s3.embl.de/spatialdata/developers_resources/storage_format/transformation_identity.zarr/images/blobs_image',
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

export const multipleOmeZarrViaRasterJson = {
  version: '1.0.16',
  name: blinName,
  description: blinDescription,
  public: true,
  datasets: [
    {
      uid: 'idr0062-blin-nuclearsegmentation/6001240',
      name: 'idr0062-blin-nuclearsegmentation/6001240',
      files: [
        {
          fileType: 'image.raster.json',
          options: {
            schemaVersion: '0.0.2',
            renderLayers: ['Image 1', 'Image 2'],
            images: [
              {
                name: 'Image 1',
                type: 'ome-zarr',
                url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr',
              },
              {
                name: 'Image 2',
                type: 'ome-zarr',
                url: 'https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0076A/10501752.zarr',
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
