import { createZarrLoader } from '@hms-dbmi/viv';
import rasterSchema from '../schemas/raster.schema.json';
import AbstractLoader from './AbstractLoader';
import { LoaderFetchError, AbstractLoaderError } from './errors';

async function initLoader(imageData) {
  const {
    url, metadata,
  } = imageData;

  const { dimensions, isPyramid, transform } = metadata || {};
  const { scale = 0, translate = { x: 0, y: 0 } } = transform;
  const loader = await createZarrLoader({
    url, dimensions, isPyramid, scale, translate,
  });
  return loader;
}

export default class OmeZarrLoader extends AbstractLoader {
  constructor(params) {
    super(params);
    this.schema = rasterSchema;
  }

  async loadZattrs() {
    // We need to load the .zattrs json, not the 'url' itself
    // We don't do any validation (yet)
    const url = `${this.url}/.zattrs`;
    const { requestInit, fileType, type } = this;
    this.data = fetch(url, requestInit)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(new LoaderFetchError(type, fileType, url, response.headers));
      })
      .catch(reason => Promise.resolve(reason))
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        return Promise.resolve({ data, url });
      });
    return this.data;
  }

  async load() {
    const payload = await this.loadZattrs().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const channelNames = payload.data.omero.channels.map(ch => ch.label);

    const renderLayers = undefined;
    const urls = [[this.url, 'Image']];

    const image = {
      name: 'Image',
      url: this.url,
      type: 'ome-zarr',
      metadata: {
        dimensions: [
          {
            field: 't',
            type: 'ordinal',
            values: ['0'],
          },
          {
            field: 'channel',
            type: 'nominal',
            values: channelNames,
          },
          {
            field: 'z',
            type: 'ordinal',
            values: ['0'],
          },
          {
            field: 'y',
            type: 'quantitative',
            values: null,
          },
          {
            field: 'x',
            type: 'quantitative',
            values: null,
          },
        ],
        isPyramid: true,
        transform: {
          translate: {
            y: 0,
            x: 0,
          },
          scale: 1,
        },
      },
    };

    const imagesWithLoaderCreators = [
      {
        ...image,
        loaderCreator: async () => {
          const loader = await initLoader(image);
          return loader;
        },
      },
    ];
    return Promise.resolve({ data: { layers: imagesWithLoaderCreators, renderLayers }, urls });
  }
}
