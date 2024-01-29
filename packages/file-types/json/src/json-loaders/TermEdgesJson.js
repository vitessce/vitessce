import { AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';
import JsonLoader from './JsonLoader.js';

export default class TermEdgesJsonLoader extends JsonLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const termEdges = data; // [ { obsTerm, featureTerm } ]
    this.cachedResult = { termEdges };
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
