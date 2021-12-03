import { loadOmeTiff } from '@hms-dbmi/viv';
import { initializeRasterLayersAndChannels } from '../components/spatial/utils';
import LoaderResult from './LoaderResult';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';

async function initLoader(url, requestInit, metadata) {
  let loader;
  // Fetch offsets for ome-tiff if needed.
  if (metadata && 'omeTiffOffsetsUrl' in metadata) {
    const { omeTiffOffsetsUrl } = metadata;
    const res = await fetch(omeTiffOffsetsUrl, (requestInit || {}));
    if (res.ok) {
      const offsets = await res.json();
      loader = await loadOmeTiff(
        url,
        {
          offsets,
          headers: requestInit?.headers,
        },
      );
    } else {
      throw new Error('Offsets not found but provided.');
    }
  } else {
    loader = await loadOmeTiff(url, { headers: requestInit?.headers });
  }
  const { Pixels: { Channels } } = loader.metadata;
  const channels = Array.isArray(Channels)
    ? Channels.map((channel, i) => channel.Name || `Channel ${i}`)
    : [Channels.Name || `Channel ${0}`];
  return { ...loader, channels };
}

export default class OmeTiffLoader extends AbstractTwoStepLoader {
  async load() {
    const { name = 'OME-TIFF Image', metadata } = this.options;
    const { url, requestInit } = this;
    // Get image name and URL tuples.
    const urls = [
      [url, name],
    ];

    const usePhysicalSizeScaling = false;

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = [{
      name,
      metadata,
      loaderCreator: async () => initLoader(url, requestInit, metadata),
    }];

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    if (!this.autoImageCache) {
      this.autoImageCache = initializeRasterLayersAndChannels(
        imagesWithLoaderCreators,
        undefined,
        usePhysicalSizeScaling,
      );
    }

    return this.autoImageCache.then((autoImages) => {
      const [autoImageLayers, imageLayerLoaders, imageLayerMeta] = autoImages;

      const coordinationValues = {
        spatialRasterLayers: autoImageLayers,
      };
      return new LoaderResult(
        { loaders: imageLayerLoaders, meta: imageLayerMeta },
        urls,
        coordinationValues,
      );
    });
  }
}
