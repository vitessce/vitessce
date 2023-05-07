export const pancreasOmap = {
  version: '1.0.16',
  name: 'Pancreas OMAP image',
  description: '',
  datasets: [
    {
      uid: 'OMAP 1',
      name: 'OMAP 1',
      files: [
        /*{
          fileType: 'image.ome-tiff',
          url: 'https://assets.hubmapconsortium.org/a4be39d9c1606130450a011d2f1feeff/ometiff-pyramids/processedMicroscopy/VAN0012-RK-102-167-PAS_IMS_images/VAN0012-RK-102-167-PAS_IMS-registered.ome.tif',
        },
        */
       {
        fileType: 'obsSets.json',
        url: 'http://localhost:8000/cell_sets.json',
       },
       {
        fileType: 'termEdges.json',
        url: 'http://localhost:8000/term_mapping.json',
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
      w: 8,
      h: 12,
    },
    {
      component: 'layerController',
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
