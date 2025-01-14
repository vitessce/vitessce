import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import { genesSchema } from './schemas/genes.js';
import JsonLoader from '../json-loaders/JsonLoader.js';

export default class GenesJsonAsObsFeatureMatrixLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = genesSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const cols = Object.keys(data);
    const rows = (cols.length > 0 ? Object.keys(data[cols[0]].cells) : []);

    const normalizedFlatMatrix = rows
      .flatMap(cellId => cols.map(
        geneId => (data[geneId].cells[cellId] / data[geneId].max) * 255,
      ));
    // Need to wrap the NestedArray to mock the HTTPStore-based array
    // which returns promises.
    const featureIndex = cols;
    const obsIndex = rows;
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
