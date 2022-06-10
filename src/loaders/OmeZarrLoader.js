import { loadOmeZarr } from '@hms-dbmi/viv';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

import { initializeRasterLayersAndChannels } from '../components/spatial/utils';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';

function hexToRgb(hex) {
  const result = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1].toLowerCase(), 16),
    parseInt(result[2].toLowerCase(), 16),
    parseInt(result[3].toLowerCase(), 16),
  ];
}

export default class OmeZarrLoader extends AbstractTwoStepLoader {
  async load() {
    const payload = await this.dataSource.getJson('.zattrs').catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const loader = await loadOmeZarr(this.url, { fetchOptions: this.requestInit, type: 'multiscales' });
    const { metadata, data } = loader;

    const { omero } = metadata;

    if (!omero) {
      console.error('Path for image not valid');
      return Promise.reject(payload);
    }

    const { rdefs, channels } = omero;

    const t = rdefs.defaultT ?? 0;
    const z = rdefs.defaultZ ?? 0;

    const filterSelection = (sel) => {
      // Remove selection keys for which there is no dimension.
      if (data.length > 0) {
        const nextSel = {};
        // eslint-disable-next-line prefer-destructuring
        const labels = data[0].labels;
        Object.keys(sel).forEach((key) => {
          if (labels.includes(key)) {
            nextSel[key] = sel[key];
          }
        });
        return nextSel;
      }
      return sel;
    };

    const imagesWithLoaderCreators = [
      {
        name: omero.name || 'Image',
        channels: channels.map((channel, i) => ({
          selection: filterSelection({ z, t, c: i }),
          slider: [channel.window.start, channel.window.end],
          color: hexToRgb(channel.color),
        })),
        loaderCreator: async () => ({ ...loader, channels: channels.map(c => c.label) }),
      },
    ];

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    const [
      autoImageLayers, imageLayerLoaders, imageLayerMeta,
    ] = await initializeRasterLayersAndChannels(
      imagesWithLoaderCreators, undefined,
    );

    const coordinationValues = {
      spatialImageLayer: autoImageLayers,
    };
    return Promise.resolve(new LoaderResult(
      { loaders: imageLayerLoaders, meta: imageLayerMeta },
      [],
      coordinationValues,
    ));
  }
}
