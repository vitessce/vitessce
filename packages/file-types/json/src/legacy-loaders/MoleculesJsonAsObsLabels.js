import range from 'lodash/range';
import sum from 'lodash/sum';
import { AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';
import moleculesSchema from './schemas/molecules.schema.json';
import JsonLoader from '../json-loaders/JsonLoader';

export default class MoleculesJsonAsObsLabelsLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = moleculesSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const obsIndex = range(sum(Object.values(data).map(v => v.length))).map(i => String(i));
    let obsLabels = [];
    Object.entries(data).forEach(([gene, locations]) => {
      obsLabels = [...obsLabels, ...range(locations.length).map(() => gene)];
    });
    this.cachedResult = { obsIndex, obsLabels };
    return this.cachedResult;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const result = this.loadFromCache(data);
    return Promise.resolve(new LoaderResult(result, url));
  }
}
