import {
  AbstractLoaderError,
} from '@vitessce/vit-s';
import SpatialDataImageLoader from './SpatialDataImageLoader.js';

export default class SpatialDataLabelsLoader extends SpatialDataImageLoader {
  async load() {
    const result = await super.load();
    if (result instanceof AbstractLoaderError) {
      return Promise.reject(result);
    }

    result.data = {
      obsSegmentations: result.data.image,
      obsSegmentationsType: 'bitmask',
    };
    return Promise.resolve(result);
  }
}
