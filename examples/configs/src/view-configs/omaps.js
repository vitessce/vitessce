export const pancreasOmap = {
  version: '1.0.16',
  name: 'Pancreas OMAP image',
  description: '',
  datasets: [
    {
      uid: 'OMAP 1',
      name: 'OMAP 1',
      files: [
        {
          fileType: 'image.ome-tiff',
          url: 'https://storage.googleapis.com/vitessce-demo-data/hubmap-arwg-may-2023/DON218-ND-52yM-T1A.pyramid.ome.tif',
        },
        {
          fileType: 'obsSets.json',
          url: 'https://storage.googleapis.com/vitessce-demo-data/hubmap-arwg-may-2023/cell_sets.json',
        },
        {
          fileType: 'termEdges.json',
          url: 'https://storage.googleapis.com/vitessce-demo-data/hubmap-arwg-may-2023/term_mapping.json',
        },
      ],
    },
  ],
  initStrategy: 'auto',
  layout: [
    {
      component: 'obsSets',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
    },
    {
      component: 'layerController',
      props: {
        disableChannelsIfRgbDetected: true,
      },
      x: 0,
      y: 0,
      w: 6,
      h: 8,
    },
    {
      component: 'spatial',
      x: 6,
      y: 0,
      w: 6,
      h: 10,
    },
    {
      component: 'description',
      x: 6,
      y: 10,
      w: 6,
      h: 1,
    },
    {
      component: 'status',
      x: 6,
      y: 11,
      w: 6,
      h: 1,
    },
  ],
};
