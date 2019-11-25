import Ajv from 'ajv';

import datasetSchema from '../schemas/dataset.schema.json';

// Exported because used by the cypress tests: They route API requests to the fixtures instead.
export const urlPrefix = 'https://s3.amazonaws.com/vitessce-data/0.0.18/tile_ometiff';

function makeLayerNameToConfig(datasetPrefix) {
  return name => ({
    name,
    type: name.toUpperCase(),
    url: `${urlPrefix}/${datasetPrefix}/${datasetPrefix}.${name}.json`,
  });
}

const linnarssonLayerNames = [
  'cells',
  'clusters',
  'factors',
  'genes',
  'images',
  'molecules',
  'neighborhoods',
];
const linnarssonDescription = 'Spatial organization of the somatosensory cortex revealed by cyclic smFISH';
const linnarssonBase = {
  description: linnarssonDescription,
  layers: linnarssonLayerNames
    .map(makeLayerNameToConfig('linnarsson')),
};
const linnarssonBaseNoClusters = {
  description: linnarssonDescription,
  layers: linnarssonLayerNames.filter(name => name !== 'clusters')
    .map(makeLayerNameToConfig('linnarsson')),
};

const driesDescription = 'Giotto, a pipeline for integrative analysis and visualization of single-cell spatial transcriptomic data';
const driesBase = {
  description: driesDescription,
  layers: [
    'cells',
    'factors',
  ].map(makeLayerNameToConfig('dries')),
};

const wangDescription = 'Multiplexed imaging of high-density libraries of RNAs with MERFISH and expansion microscopy';
const wangBase = {
  description: wangDescription,
  layers: [
    'cells',
    'molecules',
    'genes',
  ].map(makeLayerNameToConfig('wang')),
};

const caoDescription = 'scRNA-seq data from early cardiac progenitor cells in mouse cardiogenesis';
const caoBase = {
  description: caoDescription,
  layers: [
    'cells',
  ].map(makeLayerNameToConfig('cao')),
};


/* eslint-disable object-property-newline */
/* eslint-disable object-curly-newline */
const configs = {
  'linnarsson-2018': {
    ...linnarssonBase,
    name: 'Linnarsson',
    public: true,
    responsiveLayout: {
      columns: {
        // Grid cell width stays roughly constant,
        // but more columns are available in a wider window.
        1500: [0, 3, 8, 13, 15],
        1300: [0, 3, 7, 11, 13],
        1100: [0, 3, 6, 9, 11],
        900: [0, 3, 5, 7, 9],
      },
      components: [
        { component: 'description',
          props: {
            description: `Linnarsson: ${linnarssonDescription}`,
          },
          x: 0, y: 0 },
        { component: 'cellSets',
          props: {
            datasetId: 'linnarsson-2018',
          },
          x: 0, y: 1, h: 3 },
        { component: 'status',
          x: 0, y: 4 },
        { component: 'spatial',
          props: {
            view: {
              zoom: -6.5,
              target: [16000, 20000, 0],
            },
          },
          x: 1, y: 0, h: 4 },
        { component: 'scatterplot',
          props: {
            mapping: 'PCA',
            // This intentionally does not have a  "view" prop,
            // in order to have an example that uses the default.
          },
          x: 2, y: 0, h: 2 },
        { component: 'scatterplot',
          props: {
            mapping: 't-SNE',
            view: {
              zoom: 0.75,
              target: [0, 0, 0],
            },
          },
          x: 2, y: 2, h: 2 },
        { component: 'factors',
          x: 3, y: 0, h: 2 },
        { component: 'genes',
          x: 3, y: 2, h: 2 },
        { component: 'heatmap',
          x: 1, y: 4, w: 3 },
      ],
    },
  },
  'linnarsson-2018-two-spatial': {
    ...linnarssonBase,
    name: 'Linnarsson (two spatial)',
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
      components: [
        { component: 'spatial',
          props: {
            view: {
              zoom: -8,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 0, h: 2 },
        { component: 'scatterplot',
          props: { mapping: 't-SNE' },
          x: 0, y: 2, h: 2 },
        { component: 'spatial',
          props: {
            view: {
              zoom: -6,
              target: [18000, 18000, 0],
            },
          },
          x: 1, y: 0, h: 2 },
        { component: 'scatterplot',
          props: { mapping: 'PCA' },
          x: 1, y: 2, h: 2 },
        { component: 'factors',
          x: 2, y: 0, h: 2 },
        { component: 'genes',
          x: 2, y: 2, h: 2 },
        { component: 'heatmap',
          x: 0, y: 4, w: 3 },
      ],
    },
  },
  'linnarsson-2018-just-spatial': {
    ...linnarssonBaseNoClusters,
    name: 'Linnarsson (just spatial)',
    responsiveLayout: {
      columns: {
        1400: [0, 12, 14],
        1200: [0, 10, 12],
        1000: [0, 8, 10],
        800: [0, 6, 8],
        600: [0, 4, 8],
      },
      components: [
        { component: 'spatial',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 0, h: 2 },
        { component: 'factors',
          x: 1, y: 0, h: 1 },
        { component: 'genes',
          x: 1, y: 1, h: 1 },
      ],
    },
  },
  'linnarsson-2018-static': {
    ...linnarssonBase,
    name: 'Linnarsson (static layout)',
    staticLayout: [
      { component: 'description',
        props: {
          description: `Linnarsson (static layout): ${linnarssonDescription}`,
        },
        x: 0, y: 0, w: 3, h: 1 },
      { component: 'scatterplot',
        props: { mapping: 't-SNE' },
        x: 0, y: 2, w: 3, h: 2 },
      { component: 'spatial',
        props: {
          view: {
            zoom: -6.5,
            target: [18000, 18000, 0],
          },
        },
        x: 3, y: 0, w: 6, h: 4 },
      { component: 'factors',
        x: 9, y: 0, w: 3, h: 2 },
      { component: 'genes',
        x: 9, y: 2, w: 3, h: 2 },
      { component: 'heatmap',
        x: 0, y: 4, w: 12, h: 1 },
    ],
  },
  'linnarsson-2018-dozen': {
    ...linnarssonBase,
    name: 'Linnarsson (responsive layout, redundant components for performance testing)',
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
      components: [
        { component: 'spatial',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 0, h: 1 },
        { component: 'spatial',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 0, y: 1, h: 1 },
        { component: 'spatial',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 1, y: 0, h: 1 },
        { component: 'spatial',
          props: {
            view: {
              zoom: -6.5,
              target: [18000, 18000, 0],
            },
          },
          x: 1, y: 1, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 't-SNE' },
          x: 0, y: 2, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 't-SNE' },
          x: 0, y: 3, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 't-SNE' },
          x: 0, y: 4, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 't-SNE' },
          x: 0, y: 5, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 'PCA' },
          x: 1, y: 2, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 'PCA' },
          x: 1, y: 3, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 'PCA' },
          x: 1, y: 4, h: 1 },
        { component: 'scatterplot',
          props: { mapping: 'PCA' },
          x: 1, y: 5, h: 1 },
        { component: 'factors',
          x: 2, y: 0, h: 2 },
        { component: 'genes',
          x: 2, y: 2, h: 2 },
        { component: 'heatmap',
          x: 2, y: 4, w: 1, h: 2 },
      ],
    },
  },
  'dries-2019': {
    ...driesBase,
    name: 'Dries',
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
      components: [
        { component: 'description',
          props: {
            description: driesDescription,
          },
          x: 0, y: 0 },
        { component: 'status',
          x: 0, y: 1 },
        { component: 'scatterplot',
          props: {
            mapping: 't-SNE',
            view: {
              zoom: 3,
              target: [0, 0, 0],
            },
          },
          x: 0, y: 2, h: 2 },
        { component: 'spatial',
          props: {
            cellRadius: 50,
            view: {
              zoom: -4.4,
              target: [3800, -900, 0],
            },
          },
          x: 1, y: 0, h: 2 },
        { component: 'scatterplot',
          props: {
            mapping: 'UMAP',
            view: {
              zoom: 3,
              target: [0, 0, 0],
            },
          },
          x: 1, y: 2, h: 2 },
        { component: 'factors',
          x: 2, y: 0, h: 4 },
      ],
    },
  },
  'wang-2019': {
    ...wangBase,
    name: 'Wang',
    public: true,
    responsiveLayout: {
      columns: {
        1400: [0, 12, 14],
        1200: [0, 10, 12],
        1000: [0, 8, 10],
        800: [0, 6, 8],
        600: [0, 4, 6],
      },
      components: [
        { component: 'spatial',
          props: {
            view: {
              zoom: -1,
              target: [0, 0, 0],
            },
            moleculeRadius: 2,
          },
          x: 0, y: 0, h: 2 },
        { component: 'genes',
          x: 1, y: 0, h: 2 },
      ],
    },
  },
  'cao-2019': {
    ...caoBase,
    name: 'Cao',
    public: false,
    responsiveLayout: {
      columns: {
        1400: [0, 14],
        1200: [0, 12],
        1000: [0, 10],
        800: [0, 8],
        600: [0, 6],
      },
      components: [
        { component: 'scatterplot',
          props: { mapping: 't-SNE' },
          x: 0, y: 0, h: 2 },
      ],
    },
  },
};
/* eslint-enable */

export function listConfigs(showAll) {
  return Object.entries(configs).filter(
    entry => showAll || entry[1].public,
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
