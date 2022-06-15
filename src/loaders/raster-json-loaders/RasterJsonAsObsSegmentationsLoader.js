import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';
import RasterLoader from './RasterJsonLoader';

export default class RasterJsonAsObsSegmentationsLoader extends RasterLoader {
  async load() {
    const loaderResult = await super.load().catch(reason => Promise.resolve(reason));
    if (loaderResult instanceof AbstractLoaderError) {
      return Promise.reject(loaderResult);
    }
    const { data, url: urls, coordinationValues } = loaderResult;
    const { loaders, meta } = data;

    // Filter, removing any bitmask items.
    const segmentationLoaders = loaders.filter(l => l.type === 'bitmask');
    const segmentationMeta = meta.filter(l => l.type === 'bitmask');

    return new LoaderResult(
      {
        obsSegmentationsType: 'bitmask',
        obsSegmentations: { loaders: segmentationLoaders, meta: segmentationMeta },
      },
      urls,
      coordinationValues,
    );
  }
}
