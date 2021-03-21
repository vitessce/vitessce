import { ZarrPixelSource, loadOmeTiff } from '@hms-dbmi/viv';
import { openArray } from 'zarr';
import rasterSchema from '../schemas/raster.schema.json';
import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

import { initializeRasterLayersAndChannels } from '../components/spatial/utils';

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('zarr'): {
      const { dimensions, isPyramid } = metadata || {};
      const labels = dimensions.map(d => d.field);
      let source;
      if (isPyramid) {
        const metadataUrl = `${url}${
          url.slice(-1) === '/' ? '' : '/'
        }.zmetadata`;
        const response = await fetch(metadataUrl);
        const { metadata: zarrMetadata } = await response.json();
        const paths = Object.keys(zarrMetadata)
          .filter(metaKey => metaKey.includes('.zarray'))
          .map(arrMetaKeys => arrMetaKeys.slice(0, -7));
        const data = await Promise.all(
          paths.map(path => openArray({ store: url, path })),
        );
        source = data.map(d => new ZarrPixelSource(d, labels));
      } else {
        const data = await openArray({ store: url });
        source = new ZarrPixelSource(data, labels);
      }
      return { data: source, metadata: dimensions };
    }
    case ('ome-tiff'): {
      // Fetch offsets for ome-tiff if needed.
      if (metadata && 'omeTiffOffsetsUrl' in metadata) {
        const { omeTiffOffsetsUrl } = metadata;
        const res = await fetch(omeTiffOffsetsUrl, requestInit);
        if (res.ok) {
          const offsets = await res.json();
          const loader = await loadOmeTiff(
            url,
            {
              offsets,
              headers: requestInit.headers,
            },
          );
          return loader;
        }
        throw new Error('Offsets not found but provided.');
      }
      const loader = loadOmeTiff(
        url,
        { headers: requestInit.headers },
      );
      return loader;
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}

export default class RasterLoader extends JsonLoader {
  constructor(params) {
    super(params);
    const { url, options } = params;
    if (!url && options) {
      this.url = URL.createObjectURL(new Blob([JSON.stringify(options)]));
      this.options = undefined;
    }
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
    const [
      autoImageLayers,
      imageLayerLoaders,
      imageLayerMeta,
    ] = await initializeRasterLayersAndChannels(
      imagesWithLoaderCreators,
      renderLayers,
      usePhysicalSizeScaling,
    );

    const coordinationValues = {
      spatialRasterLayers: autoImageLayers,
    };

    return Promise.resolve(
      new LoaderResult(
        { loaders: imageLayerLoaders, meta: imageLayerMeta },
        urls,
        coordinationValues,
      ),
    );
  }
}
