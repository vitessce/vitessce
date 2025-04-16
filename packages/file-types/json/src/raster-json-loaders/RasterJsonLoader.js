import { viv } from '@vitessce/gl';
import { log } from '@vitessce/globals';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxes,
  loadOmeZarr,
  guessTileSize,
  ZarritaPixelSource,
} from '@vitessce/spatial-utils';
import { open as zarrOpen } from 'zarrita';
import { zarrOpenRoot, createZarrArrayAdapter } from '@vitessce/zarr-utils';
import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import { rasterJsonSchema as rasterSchema } from '@vitessce/schemas';
import JsonLoader from '../json-loaders/JsonLoader.js';

async function initLoader(imageData) {
  try {
    const {
      type, url, metadata, requestInit,
    } = imageData;

    switch (type) {
      case 'zarr': {
        // Bioformats-Zarr case
        const { dimensions, isPyramid, transform } = metadata || {};
        const labels = dimensions.map(d => d.field);
        let source;
        const root = await zarrOpenRoot(url, null, { requestInit });

        if (isPyramid) {
          const metadataUrl = `${url}${url.slice(-1) === '/' ? '' : '/'}.zmetadata`;
          const response = await fetch(metadataUrl);
          if (!response.ok) throw new Error(`Failed to fetch metadata: ${response.status}`);

          const { metadata: zarrMetadata } = await response.json();
          const paths = Object.keys(zarrMetadata)
            .filter(metaKey => metaKey.includes('.zarray'))
            .map(arrMetaKeys => arrMetaKeys.slice(0, -7));
          const data = await Promise.all(
            paths.map(path => zarrOpen(root.resolve(path), { kind: 'array' })),
          );
          const tileSize = guessTileSize(data[0]);
          source = data.map(d => new ZarritaPixelSource(
            createZarrArrayAdapter(d), labels, tileSize,
          ));
        } else {
          const data = await zarrOpen(root, { kind: 'array' });
          source = new ZarritaPixelSource(createZarrArrayAdapter(data), labels);
        }

        return {
          data: source,
          metadata: { dimensions, transform },
          channels: (dimensions.find(d => d.field === 'channel') || dimensions[0]).values,
        };
      }

      case 'ome-tiff': {
        let loader;
        // Fetch offsets for ome-tiff if needed.
        if (metadata?.omeTiffOffsetsUrl) {
          try {
            const res = await fetch(metadata.omeTiffOffsetsUrl, requestInit || {});
            if (!res.ok) throw new Error(`Offsets not found: ${res.status} from ${res.url}`);

            const offsets = await res.json();
            loader = await viv.loadOmeTiff(url, {
              offsets,
              headers: requestInit?.headers,
            });
          } catch (err) {
            log.error('Error loading OME-TIFF offsets:', err);
            throw err;
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

      case 'ome-zarr': {
        // OME-NGFF case
        // Reference: https://github.com/vitessce/vitessce-python/issues/242#issuecomment-1517930964
        // Most of the following has been copied from OmeZarrLoader.js.
        // Reference: https://github.com/vitessce/vitessce/blob/fb0e7f/packages/file-types/zarr/src/ome-loaders/OmeZarrLoader.js#L29
        const { coordinateTransformations: coordinateTransformationsFromOptions } = metadata || {};

        const root = await zarrOpenRoot(url, null, { requestInit });
        const loader = await loadOmeZarr(root);
        const { metadata: loaderMetadata } = loader;
        const { omero, multiscales } = loaderMetadata;

        if (!Array.isArray(multiscales) || multiscales.length === 0) {
          throw new Error('Multiscales array must exist and have at least one element');
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
          ...(transformMatrix ? { metadata: { transform: { matrix: transformMatrix } } } : {}),
          ...loader,
        };
      }
      default: {
        const errorMessage = `Image type (${type}) is not supported`;
        log.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  } catch (error) {
    log.error('Error in initLoader:', error);
    throw error;
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
