/* eslint-disable */
import { ZarrLoader } from '@hms-dbmi/viv';
import range from 'lodash/range';
import { openArray } from 'zarr';
import AbstractZarrLoader from './AbstractZarrLoader';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

import { initializeRasterLayersAndChannels, initializeLayerChannelsIfMissing } from '../components/spatial/utils';

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

function createLoader(dataArr, dimensions) {
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
  return new ZarrLoader({ data, dimensions });
}

export default class OmeZarrLoader extends AbstractZarrLoader {
  async load() {
    const payload = await this.getJson('.zattrs').catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const { rdefs, channels, name } = payload.omero;

    const initialT = rdefs.defaultT ?? 0;
    const initialZ = rdefs.defaultZ ?? 0;

    const multiresData = await openMultiResolutionData(this.store, payload);
    const { shape } = multiresData[0];
    const image = {
      name,
      type: 'ome-zarr',
      url: this.url,
      metadata: {
        isPyramid: true,
        dimensions: [
          {
            field: 'time',
            type: 'ordinal',
            values: range(shape[0]),
          },
          {
            field: 'channel',
            type: 'nominal',
            values: channels.map(ch => ch.label),
          },
          {
            field: 'z',
            type: 'ordinal',
            values: range(shape[2]),
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
        ],
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
          const loader = createLoader(multiresData, image.metadata.dimensions);
          return loader;
        },
      },
    ];

    const [autoImageLayers, imageLayerLoaders, imageLayerMeta] = await initializeRasterLayersAndChannels(imagesWithLoaderCreators, undefined);
    const [newLayers] = await initializeLayerChannelsIfMissing(autoImageLayers, imageLayerLoaders);

    const ztLayers = newLayers.map(d => ({
      ...d,
      channels: d.channels.map(c => ({
        ...c,
        selection: {
          ...c.selection,
          z: initialZ,
          time: initialT,
        }
      }))
    }));

    // TODO: split spatialLayers into three coordination types
    // spatialRasterLayers, spatialCellLayers, spatialMoleculeLayers
    const coordinationValues = {
      spatialLayers: ztLayers
    };
    return Promise.resolve(new LoaderResult({ loaders: imageLayerLoaders, meta: imageLayerMeta }, [], coordinationValues));
  }
}
