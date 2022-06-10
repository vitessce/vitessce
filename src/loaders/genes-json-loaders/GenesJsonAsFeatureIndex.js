import genesSchema from '../../schemas/genes.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class GenesJsonAsFeatureIndexLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = genesSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const featureIndex = Object.keys(data);
    return Promise.resolve(new LoaderResult(featureIndex, url));
  }
}
