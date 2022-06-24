import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';
import RasterLoader from './RasterJsonLoader';

export default class RasterJsonAsImageLoader extends RasterLoader {
  async load() {
    const loaderResult = await super.load().catch(reason => Promise.resolve(reason));
    if (loaderResult instanceof AbstractLoaderError) {
      return Promise.reject(loaderResult);
    }
    const { data, url: urls, coordinationValues } = loaderResult;
    const { loaders, meta } = data;

    // Filter, removing any bitmask items.
    const imageLoaders = loaders.filter(l => l.type !== 'bitmask');
    const imageMeta = meta.filter(l => l.type !== 'bitmask');

    return new LoaderResult(
      {
        image: { loaders: imageLoaders, meta: imageMeta },
      },
      urls,
      coordinationValues,
    );
  }
}
