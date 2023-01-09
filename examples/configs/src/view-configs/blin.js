

const blinName = 'Blin et al., PLoS Biol 2019';
const blinDescription = '18-142_PAS_1of6.ome.tif';
export const blin2019 = {
  version: '1.0.15',
  name: blinName,
  description: blinDescription,
  datasets: [
    {
      uid: 'idr0062-blin-nuclearsegmentation/6001240',
      name: 'idr0062-blin-nuclearsegmentation/6001240',
      files: [
        {
          fileType: 'obsSegmentations.ome-tiff',
          url: 'http://localhost:8000/18-142_PAS_1of6.ome.tif',
          /*options: {
            channel: 2,
          },*/
          coordinationValues: {
            obsType: 'glomerulus',
          },
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    obsType: {
      A: 'glomerulus',
    },
    spatialTargetX: {
      A: 19375.01239458,
    },
    spatialTargetY: {
      A: 18524.67196937,
    },
    spatialZoom: {
      A: -4.60703913795,
    },
  },
  layout: [
    {
      component: 'spatial',
      coordinationScopes: {
        obsType: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
      },
      x: 0,
      y: 0,
      w: 8,
      h: 12,
    },
    {
      component: 'layerController',
      coordinationScopes: {
        obsType: 'A',
        spatialTargetX: 'A',
        spatialTargetY: 'A',
        spatialZoom: 'A',
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
