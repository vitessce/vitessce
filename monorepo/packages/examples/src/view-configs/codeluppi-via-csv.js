export const codeluppiViaCsv = {
  name: 'Codeluppi et al., Nature Methods 2018',
  description: 'Spatial organization of the somatosensory cortex revealed by osmFISH',
  version: '1.0.15',
  initStrategy: 'auto',
  datasets: [
    {
      uid: 'codeluppi',
      name: 'Codeluppi',
      files: [
        {
          fileType: 'obsSets.csv',
          url: 'https://s3.amazonaws.com/vitessce-data/0.0.33/main/codeluppi-2018/codeluppi_2018_nature_methods.cells.csv',
          options: {
            obsIndex: 'cell_id',
            obsSets: [
              {
                name: 'Cell Type',
                column: ['Cluster', 'Subcluster'],
              },
            ],
          },
          coordinationValues: {
            obsType: 'cell',
          },
        },
      ],
    },
  ],
  coordinationSpace: {
    embeddingZoom: {
      PCA: 0,
      TSNE: 0.75,
    },
    embeddingType: {
      PCA: 'PCA',
      TSNE: 't-SNE',
    },
    spatialZoom: {
      A: -5.5,
    },
    spatialTargetX: {
      A: 16000,
    },
    spatialTargetY: {
      A: 20000,
    },
    spatialSegmentationLayer: {
      A: {
        opacity: 1, radius: 0, visible: true, stroked: false,
      },
    },
    spatialPointLayer: {
      A: {
        opacity: 1, radius: 20, visible: true,
      },
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        description: 'Codeluppi et al., Nature Methods 2018: Spatial organization of the somatosensory cortex revealed by osmFISH',
      },
      x: 0,
      y: 0,
      w: 2,
      h: 12,
    },
    {
      component: 'obsSets',
      x: 2,
      y: 0,
      w: 2,
      h: 12,
    }
  ],
};
