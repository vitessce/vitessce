import clustersSchema from '../../schemas/clusters.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class ClustersJsonAsObsIndexLoader extends JsonLoader {
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
    const { cols: obsIndex } = data;
    return Promise.resolve(new LoaderResult(obsIndex, url));
  }
}
