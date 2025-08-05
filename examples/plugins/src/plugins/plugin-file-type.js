import { range } from 'lodash-es';
import { JsonLoader, JsonSource } from '@vitessce/json';
import {
  LoaderResult,
} from '@vitessce/abstract';
import {
  PluginFileType,
} from '@vitessce/plugins';
import { z } from '@vitessce/schemas';

const numCells = 60;
const numGenes = 90;

class InMemoryMatrixLoader extends JsonLoader {
  // eslint-disable-next-line class-methods-use-this
  async load() {
    const data = {
      rows: range(numGenes).map(j => `gene_${j}`),
      cols: range(numCells).map(j => `cell_${j}`),
      matrix: range(numGenes).map(
        i => range(numCells).map(j => i + j + 1),
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
    return Promise.resolve(new LoaderResult({
      obsFeatureMatrix: arr,
      obsIndex: attrs.rows,
      featureIndex: attrs.cols,
    }, null));
  }
}

export const pluginFileTypeProps = {
  pluginFileTypes: [
    new PluginFileType(
      'in-memory-matrix', 'obsFeatureMatrix',
      InMemoryMatrixLoader, JsonSource,
      z.null(),
    ),
  ],
};

// Use the plugin file type in the configuration.
export const pluginFileType = {
  name: 'Test plugin file types',
  version: '1.0.13',
  description: 'Demonstration of a basic plugin file type implementation.',
  datasets: [
    {
      uid: 'plugin-test-dataset',
      name: 'Plugin test dataset',
      files: [
        {
          fileType: 'in-memory-matrix',
          url: '',
          coordinationValues: {
            obsType: 'cell',
            featureType: 'gene',
            featureValueType: 'expression',
          },
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
