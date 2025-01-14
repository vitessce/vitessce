import { extent } from 'd3-array';
import { range } from 'lodash-es';
import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import { clustersSchema } from './schemas/clusters.js';
import JsonLoader from '../json-loaders/JsonLoader.js';

export default class ClustersJsonAsObsFeatureMatrixLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = clustersSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { rows: featureIndex, cols: obsIndex, matrix } = data;
    const attrs = {
      rows: obsIndex,
      cols: featureIndex,
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
    const obsFeatureMatrix = { data: Uint8Array.from(normalizedFlatMatrix) };
    this.cachedResult = { obsIndex, featureIndex, obsFeatureMatrix };
    return this.cachedResult;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const result = this.loadFromCache(data);
    return Promise.resolve(new LoaderResult(
      result,
      url,
    ));
  }
}
