import genesSchema from '../../schemas/genes.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class GenesJsonAsObsIndexLoader extends JsonLoader {
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
    const cols = Object.keys(data);
    const obsIndex = (cols.length > 0 ? Object.keys(data[cols[0]].cells) : []);
    return Promise.resolve(new LoaderResult(obsIndex, url));
  }
}
