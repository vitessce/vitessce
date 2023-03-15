import { AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';
import JsonLoader from './JsonLoader';

export default class ObsSegmentationsJsonLoader extends JsonLoader {
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
