import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';
import RasterLoader from './RasterJsonLoader';

export default class RasterJsonAsObsSegmentationsLoader extends RasterLoader {
  async load() {
    const loaderResult = await super.load().catch(reason => Promise.resolve(reason));
    if (loaderResult instanceof AbstractLoaderError) {
      return Promise.reject(loaderResult);
    }
    const { data = {}, url: urls, coordinationValues } = loaderResult;
    const { loaders: allLoaders = [], meta: allMeta = [] } = data;

    const loaders = [];
    const meta = [];

    // Only include bitmask items.
    allMeta.forEach((layer, i) => {
      if (layer?.metadata?.isBitmask) {
        loaders.push(allLoaders[i]);
        meta.push(allMeta[i]);
      }
    });

    return new LoaderResult(
      {
        obsSegmentationsType: 'bitmask',
        obsSegmentations: (loaders.length > 0 && meta.length > 0 ? { loaders, meta } : null),
      },
      urls,
      {
        // Filter coordinationValues, keeping only bitmask layers.
        spatialSegmentationLayer: coordinationValues
          .spatialImageLayer
          .filter(l => l.type === 'bitmask')
          // Re-index since we removed the bitmask layers,
          // so the indices may have gaps.
          .map(layer => ({
            ...layer,
            index: meta.findIndex(metaItem => metaItem.name === allMeta[layer.index].name),
          })),
      },
    );
  }
}
