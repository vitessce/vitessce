import clustersSchema from '../../schemas/clusters.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class ClustersJsonAsFeatureIndexLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = clustersSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const { rows: featureIndex } = data;
    return Promise.resolve(new LoaderResult(featureIndex, url));
  }
}
