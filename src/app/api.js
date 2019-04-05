const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.12/linnarsson-2018';

const linnarssonBase = {
  description: 'Spatial organization of the somatosensory cortex revealed by cyclic smFISH',
  views: {
    spatial: {
      zoom: -6.5,
      offset: [200, 200],
    },
  },
  layers: [
    'cells',
    'clusters',
    'factors',
    'genes',
    'images',
    'molecules',
    'neighborhoods',
  ].map(name => ({
    name,
    type: name.toUpperCase(),
    url: `${urlPrefix}/linnarsson.${name}.json`,
  })),
};

const configs = {
  'linnarsson-2018': {
    ...linnarssonBase,
    name: 'Linnarsson (responsive layout)',
    columnLayout: {
      columns: {
        1000: [0, 3, 9, 12],
        800: [0, 4, 8, 12],
      },
      layout: {
        description: { x: 0, y: 0 },
        status: { x: 0, y: 1 },
        tsne: { x: 0, y: 2, h: 2 },
        spatial: { x: 1, y: 0, h: 4 },
        factors: { x: 2, y: 0, h: 2 },
        genes: { x: 2, y: 2, h: 2 },
        heatmap: { x: 0, y: 4, w: 3 },
      },
    },
  },
  'linnarsson-2018-non-responsive': {
    ...linnarssonBase,
    name: 'Linnarsson (non-responsive layout)',
    /* eslint-disable object-curly-newline */
    gridLayout: {
      description: { x: 0, y: 0, w: 3, h: 1 },
      status: { x: 0, y: 1, w: 3, h: 1 },
      tsne: { x: 0, y: 2, w: 3, h: 2 },
      spatial: { x: 3, y: 0, w: 6, h: 4 },
      factors: { x: 9, y: 0, w: 3, h: 2 },
      genes: { x: 9, y: 2, w: 3, h: 2 },
      heatmap: { x: 0, y: 5, w: 12, h: 2 },
    },
    /* eslint-enable */
  },
};

export function listConfig() {
  return Object.entries(configs).map(([id, config]) => ({
    id,
    name: config.name,
    description: config.description,
  }));
}

export function getConfig(id) {
  return configs[id];
}
