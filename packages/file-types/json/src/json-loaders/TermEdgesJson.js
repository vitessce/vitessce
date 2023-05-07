import { AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';
import { termEdgesSchema } from '@vitessce/schemas';
import JsonLoader from './JsonLoader.js';

export default class TermEdgesJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = termEdgesSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data: rawData, url } = payload;
    console.log(rawData);
    
    return Promise.resolve(new LoaderResult({
      termEdges: rawData,
    }, url));
  }
}
