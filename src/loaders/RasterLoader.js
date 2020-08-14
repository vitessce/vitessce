/* eslint-disable */
import { extent } from 'd3-array';
import range from 'lodash/range';
import uuidv4 from 'uuid/v4';
import rasterSchema from '../schemas/raster.schema.json';
import JsonLoader from './JsonLoader';
import { createZarrLoader, createOMETiffLoader } from '@hms-dbmi/viv';

async function initLoader(imageData) {
    const {
      type, url, metadata, requestInit,
    } = imageData;
    switch (type) {
      case ('zarr'): {
        const { dimensions, isPyramid, transform } = metadata;
        const { scale = 0, translate = { x: 0, y: 0 } } = transform;
        const loader = await createZarrLoader({
          url, dimensions, isPyramid, scale, translate,
        });
        return loader;
      }
      case ('ome-tiff'): {
        // Fetch offsets for ome-tiff if needed.
        if ('omeTiffOffsetsUrl' in metadata) {
          const { omeTiffOffsetsUrl } = metadata;
          const res = await fetch(omeTiffOffsetsUrl, requestInit);
          if (res.ok) {
            const offsets = await res.json();
            const loader = await createOMETiffLoader({
              url,
              offsets,
              headers: requestInit,
            });
            return loader;
          }
          throw new Error('Offsets not found but provided.');
        }
        const loader = createOMETiffLoader({
          url,
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

    this.schema = rasterSchema;
  }

  load() {
    const jsonPromise = super.load();

    return new Promise((resolve, reject) => {
      jsonPromise.then(async ({ data: raster }) => {
        const { images, renderLayers } = raster;
        
        // Get image name and URL tuples.
        const urls = images
            .filter(image => !image.url.includes('zarr'))
            .map((image) => ([image.url, image.name]));
        
        const layers = [];
        
        // renderLayers provides the order for rendering initially.
        if (!renderLayers) {
            const layerId = uuidv4();
            // Midpoint of images list as default image to show.
            const imageData = images[Math.floor(images.length / 2)];
            const loader = await initLoader(imageData);
            layers.push({ layerId, imageData, loader });
        } else {
            const newLayersAndLoaders = await Promise.all(renderLayers.map(async (imageName) => {
                const layerId = uuidv4();
                const [imageData] = images.filter(image => image.name === imageName);
                const loader = await initLoader(imageData);
                return { layerId, imageData, loader };
            }));
            layers.concat(newLayersAndLoaders);
        }
        resolve({ data: { images, layers }, urls });
      }).catch((reason) => {
        reject(reason);
      });
    });
  }
}
