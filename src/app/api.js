import Ajv from 'ajv';

import datasetSchema from '../schemas/dataset.schema.json';

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
    public: true,
    responsiveLayout: {
      columns: {
        // First two columns are equal,
        // third column is constant;
        // Grid cell width stays roughly constant,
        // but more columns are available in a wider window.
        1400: [0, 6, 12, 14],
        1200: [0, 5, 10, 12],
        1000: [0, 4, 8, 10],
        800: [0, 3, 6, 8],
        600: [0, 2, 4, 8],
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
  'linnarsson-2018-static': {
    ...linnarssonBase,
    name: 'Linnarsson (static layout)',
    /* eslint-disable object-curly-newline */
    staticLayout: {
      description: { x: 0, y: 0, w: 3, h: 1 },
      status: { x: 0, y: 1, w: 3, h: 1 },
      tsne: { x: 0, y: 2, w: 3, h: 2 },
      spatial: { x: 3, y: 0, w: 6, h: 4 },
      factors: { x: 9, y: 0, w: 3, h: 2 },
      genes: { x: 9, y: 2, w: 3, h: 2 },
      heatmap: { x: 0, y: 4, w: 12, h: 1 },
    },
    /* eslint-enable */
  },
};

export function listConfig() {
  return Object.entries(configs).filter(
    entry => entry[1].public,
  ).map(
    ([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
    }),
  );
}

export function getConfig(id) {
  const datasetConfig = configs[id];
  const validate = new Ajv().compile(datasetSchema);
  const valid = validate(datasetConfig);
  if (!valid) {
    const failureReason = JSON.stringify(validate.errors, null, 2);
    console.warn('dataset validation failed', failureReason);
  }
  return datasetConfig;
}
