import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import { cellsSchema } from './schemas/cells.js';
import JsonLoader from '../json-loaders/JsonLoader.js';

export default class CellsJsonAsObsLocationsLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = cellsSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const cellObjs = Object.values(data);
    if (cellObjs.length > 0 && !Array.isArray(cellObjs[0].xy)) {
      // This cells file does not contain xy coordinates.
      this.cachedResult = null;
    } else {
      const obsIndex = Object.keys(data);
      const obsLocationsX = Float32Array.from(cellObjs.map(cellObj => cellObj.xy[0]));
      const obsLocationsY = Float32Array.from(cellObjs.map(cellObj => cellObj.xy[1]));
      const obsLocations = {
        data: [obsLocationsX, obsLocationsY],
        shape: [2, obsLocationsX.length],
      };
      this.cachedResult = { obsIndex, obsLocations };
    }
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
