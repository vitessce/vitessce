import { ZarrLoader } from '@hms-dbmi/viv';
import { openArray, HTTPStore } from 'zarr';
import rasterSchema from '../schemas/raster.schema.json';
import AbstractLoader from './AbstractLoader';
import { LoaderFetchError, AbstractLoaderError } from './errors';

async function openMultiResolutionData(store, rootAttrs) {
  let resolutions = ['0'];
  if ('multiscales' in rootAttrs) {
    const { datasets } = rootAttrs.multiscales[0];
    resolutions = datasets.map(d => d.path);
  }
  const promises = resolutions.map(path => openArray({ store, path }));
  const data = await Promise.all(promises);
  return data;
}

function createLoader(dataArr, imageData) {
  // TODO: There should be a much better way to do this.
  // If base image is small, we don't need to fetch data for the
  // top levels of the pyramid. For large images, the tile sizes (chunks)
  // will be the same size for x/y. We check the chunksize here for this edge case.
  const base = dataArr[0];
  const { chunks } = base;
  const [tileHeight, tileWidth] = chunks.slice(-2);
  // TODO: Need function to trim pyramidal levels that aren't chunked w/ even tile sizes.
  // Lowest resolution doesn't need to have square chunks, but all others do.
  const data = dataArr.length === 1 || tileHeight !== tileWidth ? base : dataArr;
  // need to make dimensions to use ZarrLoader, but not necessary
  const dimensions = [
    {
      field: 't',
      type: 'ordinal',
      values: ['0'],
    },
    {
      field: 'channel',
      type: 'nominal',
      values: imageData.metadata.channelNames,
    },
    {
      field: 'z',
      type: 'ordinal',
      values: ['0'],
    },
    {
      field: 'y',
      type: 'quantitative',
      values: [],
    },
    {
      field: 'x',
      type: 'quantitative',
      values: [],
    },
  ];
  return new ZarrLoader({ data, dimensions });
}

export default class OmeZarrLoader extends AbstractLoader {
  constructor(params) {
    super(params);
    this.schema = rasterSchema;
  }

  async initLoader(imageData) {
    const {
      url,
    } = imageData;

    this.store = new HTTPStore(url);
    const rootAttrs = (await this.getJson('.zattrs'));
    const data = await openMultiResolutionData(this.store, rootAttrs);
    const loader = createLoader(data, imageData);

    return loader;
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

    const renderLayers = undefined;
    const urls = [[this.url, 'Image']];

    const image = {
      name: 'Image',
      url: this.url,
      type: 'ome-zarr',
      metadata: {
        channelNames: payload.data.omero.channels.map(ch => ch.label),
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
          const loader = await this.initLoader(image);
          return loader;
        },
      },
    ];
    return Promise.resolve({ data: { layers: imagesWithLoaderCreators, renderLayers }, urls });
  }
}
