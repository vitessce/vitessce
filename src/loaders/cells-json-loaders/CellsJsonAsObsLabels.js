import cellsSchema from '../../schemas/cells.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class CellsJsonAsObsLabelsLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = cellsSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsLabelsType } = this.coordinationValues;
    const obsIndex = Object.keys(data);
    const obsLabels = Object.values(data).map(cellObj => cellObj.factors[obsLabelsType]);
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
