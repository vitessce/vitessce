import { createZarrLoader, createOMETiffLoader } from '@hms-dbmi/viv';
import rasterSchema from '../schemas/raster.schema.json';
import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors';

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('zarr'): {
      const { dimensions, isPyramid, transform } = metadata || {};
      const { scale = 0, translate = { x: 0, y: 0 } } = transform;
      const loader = await createZarrLoader({
        url, dimensions, isPyramid, scale, translate,
      });
      return loader;
    }
    case ('ome-tiff'): {
      // Fetch offsets for ome-tiff if needed.
      if (metadata && 'omeTiffOffsetsUrl' in metadata) {
        const { omeTiffOffsetsUrl } = metadata;
        const res = await fetch(omeTiffOffsetsUrl, requestInit);
        if (res.ok) {
          const offsets = await res.json();
          const loader = await createOMETiffLoader({
            urlOrFile: url,
            offsets,
            headers: requestInit,
          });
          return loader;
        }
        throw new Error('Offsets not found but provided.');
      }
      const loader = createOMETiffLoader({
        urlOrFile: url,
        headers: requestInit,
      });
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
    const { images, renderLayers } = raster;

    // Get image name and URL tuples.
    const urls = images
      .filter(image => !image.url.includes('zarr'))
      .map(image => ([image.url, image.name]));

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = images.map(image => ({
      ...image,
      loaderCreator: async () => {
        const loader = await initLoader(image);
        return loader;
      },
    }));
    return Promise.resolve({ data: { layers: imagesWithLoaderCreators, renderLayers }, urls });
  }
}
