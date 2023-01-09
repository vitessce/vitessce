import { viv } from '@vitessce/gl';
import { LoaderResult, obsSegmentationsOmeTiffSchema } from '@vitessce/vit-s';
import { initializeRasterLayersAndChannels } from '@vitessce/spatial-utils';
import OmeTiffLoader from './OmeTiffLoader';

export default class RasterJsonAsObsSegmentationsLoader extends OmeTiffLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.optionsSchema = obsSegmentationsOmeTiffSchema;
  }

  async load() {
    const offsets = await this.loadOffsets();
    const { url, requestInit } = this;
    const { channel: channelIndex } = this.options || {};

    // Get image name and URL tuples.
    const urls = [url, 'OME-TIFF'];

    const image = {
      name: 'Segmentations',
      url,
      type: 'ome-tiff',
      // This load() method is the same as in ./OmeTiffLoader except we specify isBitmask here:
      metadata: {
        isBitmask: true,
      },
    };

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = [
      {
        ...image,
        loaderCreator: async () => {
          const loader = await viv.loadOmeTiff(url, { offsets, headers: requestInit?.headers });
          const { Pixels: { Channels } } = loader.metadata;
          let channels = Array.isArray(Channels)
            ? Channels.map((channel, i) => channel.Name || `Channel ${i}`)
            : [Channels.Name || `Channel ${0}`];
          if (channelIndex !== undefined && channelIndex !== null) {
            channels = [channels[channelIndex]];
          }
          return { ...loader, channels };
        },
      },
    ];

    const usePhysicalSizeScaling = false;
    const renderLayers = null;

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    if (!this.autoImageCache) {
      this.autoImageCache = initializeRasterLayersAndChannels(
        imagesWithLoaderCreators,
        renderLayers,
        usePhysicalSizeScaling,
        channelIndex,
      );
    }

    return this.autoImageCache.then((autoImages) => {
      const [autoImageLayers, imageLayerLoaders, imageLayerMeta] = autoImages;

      const coordinationValues = {
        spatialSegmentationLayer: autoImageLayers,
      };
      return new LoaderResult(
        {
          obsSegmentationsType: 'bitmask',
          obsSegmentations: { loaders: imageLayerLoaders, meta: imageLayerMeta },
        },
        urls,
        coordinationValues,
      );
    });
  }
}
