

const blinName = '179706';
const blinDescription = 'Example of OME-NGFF v0.1';
export const omeNgffLegacy = {
  version: '1.0.6',
  name: blinName,
  description: blinDescription,
  public: false,
  datasets: [
    {
      uid: '179706',
      name: '179706',
      files: [
        {
          type: 'raster',
          fileType: 'raster.ome-zarr',
          url: 'https://s3.embassy.ebi.ac.uk/idr/zarr/v0.1/179706.zarr',
        },
      ],
    },
  ],
  coordinationSpace: {
    spatialZoom: {
      A: -0.38015,
    },
    spatialTargetX: {
      A: 807.843,
    },
    spatialTargetY: {
      A: 537.031,
    },
  },
  initStrategy: 'auto',
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        spatialZoom: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
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
