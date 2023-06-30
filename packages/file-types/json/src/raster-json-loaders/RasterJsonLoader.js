import { viv } from '@vitessce/gl';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxes,
} from '@vitessce/spatial-utils';
import { openArray } from 'zarr';
import { AbstractLoaderError, LoaderResult } from '@vitessce/vit-s';
import { rasterJsonSchema as rasterSchema } from '@vitessce/schemas';
import JsonLoader from '../json-loaders/JsonLoader.js';

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('zarr'): {
      const {
        dimensions, isPyramid, transform,
      } = metadata || {};
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
        const [yChunk, xChunk] = data[0].chunks.slice(-2);
        const size = Math.min(yChunk, xChunk);
        // deck.gl requirement for power-of-two tile size.
        const tileSize = 2 ** Math.floor(Math.log2(size));
        source = data.map(d => new viv.ZarrPixelSource(d, labels, tileSize));
      } else {
        const data = await openArray({ store: url });
        source = new viv.ZarrPixelSource(data, labels);
      }
      return { data: source, metadata: { dimensions, transform }, channels: (dimensions.find(d => d.field === 'channel') || dimensions[0]).values };
    }
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
    case ('ome-zarr'): {
      // Reference: https://github.com/vitessce/vitessce-python/issues/242#issuecomment-1517930964
      // Most of the following has been copied from OmeZarrLoader.js.
      // Reference: https://github.com/vitessce/vitessce/blob/fb0e7f/packages/file-types/zarr/src/ome-loaders/OmeZarrLoader.js#L29
      const { coordinateTransformations: coordinateTransformationsFromOptions } = metadata || {};

      const loader = await viv.loadOmeZarr(url, { fetchOptions: requestInit, type: 'multiscales' });
      const { metadata: loaderMetadata } = loader;

      const { omero, multiscales } = loaderMetadata;

      if (!Array.isArray(multiscales) || multiscales.length === 0) {
        console.error('Multiscales array must exist and have at least one element');
      }
      const { coordinateTransformations } = multiscales[0];

      // Axes in v0.4 format.
      const axes = getNgffAxes(multiscales[0].axes);

      const transformMatrixFromOptions = coordinateTransformationsToMatrix(
        coordinateTransformationsFromOptions, axes,
      );
      const transformMatrixFromFile = coordinateTransformationsToMatrix(
        coordinateTransformations, axes,
      );

      const transformMatrix = transformMatrixFromFile.multiplyLeft(transformMatrixFromOptions);

      const { channels, name: omeroName } = omero;

      return {
        name: omeroName || 'Image',
        channels: channels.map((c, i) => c.label || `Channel ${i}`),
        ...(transformMatrix ? {
          metadata: {
            transform: {
              matrix: transformMatrix,
            },
          },
        } : {}),
        ...loader,
      };
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}

export default class RasterLoader extends JsonLoader {
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
      .map(image => ({ url: image.url, name: image.name }));

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
