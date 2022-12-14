import { viv } from '@vitessce/gl';
import { initializeRasterLayersAndChannels } from '@vitessce/spatial-utils';
import { AbstractTwoStepLoader, rasterSchema, AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('ome-tiff'): {
      let loader;
      // Fetch offsets for ome-tiff if needed.
      if (metadata && 'omeTiffOffsetsUrl' in metadata) {
        const { omeTiffOffsetsUrl } = metadata;
        const res = await fetch(omeTiffOffsetsUrl, (requestInit || {}));
        if (res.ok) {
          const offsets = await res.json();
          loader = await viv.loadOmeTiff(
            url,
            {
              offsets,
              headers: requestInit?.headers,
            },
          );
        } else {
          throw new Error(`Offsets not found but provided: ${res.status} from ${res.url}`);
        }
      } else {
        loader = await viv.loadOmeTiff(url, { headers: requestInit?.headers });
      }
      const { Pixels: { Channels } } = loader.metadata;
      const channels = Array.isArray(Channels)
        ? Channels.map((channel, i) => channel.Name || `Channel ${i}`)
        : [Channels.Name || `Channel ${0}`];
      return { ...loader, channels };
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}

export default class RasterLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    const { url, options } = params;
    if (!url && options) {
      // eslint-disable-next-line no-param-reassign
      dataSource.url = URL.createObjectURL(new Blob([JSON.stringify(options)]));
    }
    super(dataSource, params);
    this.schema = rasterSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data: raster } = payload;
    const { images, renderLayers, usePhysicalSizeScaling = false } = raster;

    // Get image name and URL tuples.
    const urls = images
      .filter(image => !image.url.includes('zarr'))
      .map(image => ([image.url, image.name]));

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = images.map(image => ({
      ...image,
      loaderCreator: async () => initLoader(image),
    }));

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    if (!this.autoImageCache) {
      this.autoImageCache = initializeRasterLayersAndChannels(
        imagesWithLoaderCreators,
        renderLayers,
        usePhysicalSizeScaling,
      );
    }

    return this.autoImageCache.then((autoImages) => {
      const [autoImageLayers, imageLayerLoaders, imageLayerMeta] = autoImages;

      const coordinationValues = {
        spatialImageLayer: autoImageLayers,
      };
      return new LoaderResult(
        { loaders: imageLayerLoaders, meta: imageLayerMeta },
        urls,
        coordinationValues,
      );
    });
  }
}
