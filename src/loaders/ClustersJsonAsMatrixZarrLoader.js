import { extent } from 'd3-array';
import range from 'lodash/range';
import clustersSchema from '../schemas/clusters.schema.json';
import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors';

export default class ClustersJsonAsMatrixZarrLoader extends JsonLoader {
  constructor(params) {
    super(params);

    this.schema = clustersSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const { rows, cols, matrix } = data;
    const attrs = {
      rows: cols,
      cols: rows,
    };
    const shape = [attrs.rows.length, attrs.cols.length];
    // Normalize values by converting to one-byte integers.
    // Normalize for each gene (column) independently.
    const normalizedMatrix = matrix.map((col) => {
      const [min, max] = extent(col);
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
    return Promise.resolve({ data: [attrs, arr], url });
  }
}
