import { obsLocationsCsvSchema } from '../../app/file-options-schemas';
import CsvLoader from '../CsvLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';

export default class ObsLocationsCsvLoader extends CsvLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.optionsSchema = obsLocationsCsvSchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsLocations: [xCol, yCol] } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    const obsLocationsX = Float32Array.from(data.map(d => d[xCol]));
    const obsLocationsY = Float32Array.from(data.map(d => d[yCol]));
    const obsLocations = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    this.cachedResult = { obsIndex, obsLocations };
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
