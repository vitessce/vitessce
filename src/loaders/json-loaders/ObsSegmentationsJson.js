import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';
import { emptySchema } from '../../app/file-options-schemas';

export default class ObsSegmentationsJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.optionsSchema = emptySchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const obsIndex = Object.keys(data);
    const obsPolygons = Object.values(data);
    const obsSegmentations = {
      data: obsPolygons,
      shape: [obsPolygons.length, obsPolygons[0].length],
    };
    this.cachedResult = { obsIndex, obsSegmentations, obsSegmentationsType: 'polygon' };
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
