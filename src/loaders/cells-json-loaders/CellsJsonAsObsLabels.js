import cellsSchema from '../../schemas/cells.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class CellsJsonAsObsLabelsLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = cellsSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const { key } = this.options;
    const obsIndex = Object.keys(data);
    const obsLabels = Object.values(data).map(cellObj => cellObj.factors[key]);
    return Promise.resolve(new LoaderResult({ obsIndex, obsLabels }, url));
  }
}
