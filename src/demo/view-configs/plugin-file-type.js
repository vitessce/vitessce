import range from 'lodash/range';
import JsonLoader from '../../loaders/JsonLoader';
import LoaderResult from '../../loaders/LoaderResult';
import JsonSource from '../../loaders/data-sources/JsonSource';
import {
  registerPluginFileType,
} from '../../app/plugins';
import { fromEntries } from '../../utils';

const numCells = 60;
const numGenes = 90;

class InMemoryCellsLoader extends JsonLoader {
  // eslint-disable-next-line class-methods-use-this
  async load() {
    const data = fromEntries(range(numCells).map(i => ([`cell_${i}`, {
      mappings: {
        random: [
          Math.random(),
          Math.random(),
        ],
      },
      genes: {},
      xy: [
        Math.random(),
        Math.random(),
      ],
    }])));

    return Promise.resolve(new LoaderResult(data, null));
  }
}

class InMemoryMatrixLoader extends JsonLoader {
  // eslint-disable-next-line class-methods-use-this
  async load() {
    const data = {
      rows: Array.from({ length: numGenes }, (i, j) => `gene_${j}`),
      cols: Array.from({ length: numCells }, (i, j) => `cell_${j}`),
      matrix: Array.from(
        { length: numGenes },
        () => Array.from({ length: numCells }, () => Math.random() * 100),
      ),
    };
    const { rows, cols, matrix } = data;
    const attrs = {
      rows: cols,
      cols: rows,
    };
    const shape = [attrs.rows.length, attrs.cols.length];
    // Normalize values by converting to one-byte integers.
    // Normalize for each gene (column) independently.
    const normalizedMatrix = matrix.map((col) => {
      const [min, max] = [0, 1];
      const normalize = d => Math.floor(((d - min) / (max - min)) * 255);
      return col.map(normalize);
    });
    // Transpose the normalized matrix.
    const tNormalizedMatrix = range(shape[0])
      .map(i => range(shape[1]).map(j => normalizedMatrix[j][i]));
    // Flatten the transposed matrix.
    const normalizedFlatMatrix = tNormalizedMatrix.flat();
    // Need to wrap the NestedArray to mock the HTTPStore-based array
    // which returns promises.
    const arr = { data: Uint8Array.from(normalizedFlatMatrix) };
    return Promise.resolve(new LoaderResult([attrs, arr], null));
  }
}

registerPluginFileType(
  'in-memory-cells', 'cells',
  InMemoryCellsLoader, JsonSource,
);

registerPluginFileType(
  'in-memory-matrix', 'expression-matrix',
  InMemoryMatrixLoader, JsonSource,
);

// Use the plugin file type in the configuration.
export const pluginFileType = {
  name: 'Test plugin file types',
  version: '1.0.9',
  description: 'Demonstration of a basic plugin file type implementation.',
  public: true,
  datasets: [
    {
      uid: 'plugin-test-dataset',
      name: 'Plugin test dataset',
      files: [
        {
          type: 'expression-matrix',
          fileType: 'in-memory-matrix',
          url: '',
        },
        {
          type: 'cells',
          fileType: 'in-memory-cells',
          url: '',
        },
      ],
    },
  ],
  initStrategy: 'auto',
  coordinationSpace: {
    spatialZoom: {
      A: -6.5,
    },
  },
  layout: [
    {
      component: 'description',
      props: {
        title: 'Description',
      },
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      component: 'heatmap',
      x: 2,
      y: 0,
      w: 10,
      h: 2,
    },
  ],
};
