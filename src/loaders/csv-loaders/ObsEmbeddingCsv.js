import { obsEmbeddingCsvSchema } from '../../app/file-options-schemas';
import CsvLoader from '../CsvLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class ObsEmbeddingCsvLoader extends CsvLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.optionsSchema = obsEmbeddingCsvSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsEmbedding: [xCol, yCol] } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    const obsEmbeddingX = Float32Array.from(data.map(d => d[xCol]));
    const obsEmbeddingY = Float32Array.from(data.map(d => d[yCol]));
    const obsEmbedding = {
      data: [obsEmbeddingX, obsEmbeddingY],
      shape: [2, obsEmbeddingX.length],
    };
    this.cachedResult = { obsIndex, obsEmbedding };
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
