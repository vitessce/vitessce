import cellsSchema from '../../schemas/cells.schema.json';
import JsonLoader from '../JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class CellsJsonAsObsLocationsLoader extends JsonLoader {
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

    const cellObjs = Object.values(data);
    if (cellObjs.length > 0 && !Array.isArray(cellObjs[0].xy)) {
      // This cells file does not contain xy coordinates.
      return Promise.resolve(new LoaderResult(null, url));
    }
    const obsLocationsX = cellObjs.map(cellObj => cellObj.xy[0]);
    const obsLocationsY = cellObjs.map(cellObj => cellObj.xy[1]);
    return Promise.resolve(new LoaderResult([obsLocationsX, obsLocationsY], url));
  }
}
