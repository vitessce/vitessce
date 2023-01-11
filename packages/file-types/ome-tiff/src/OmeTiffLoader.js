import { viv } from '@vitessce/gl';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
} from '@vitessce/spatial-utils';
import { AbstractTwoStepLoader, imageOmeTiffSchema, LoaderResult } from '@vitessce/vit-s';

export default class OmeTiffLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.optionsSchema = imageOmeTiffSchema;
  }

  async loadOffsets() {
    const { offsetsUrl } = this.options || {};
    if (offsetsUrl) {
      const res = await fetch(offsetsUrl, (this.requestInit || {}));
      if (res.ok) {
        const offsets = await res.json();
        return offsets;
      }
      throw new Error(`OME-TIFF offsets JSON file failed to load: ${res.status} from ${res.url}`);
    }
    return null;
  }

  async load() {
    const { url, requestInit } = this;
    const { coordinateTransformations } = this.options || {};

    // Get image name and URL tuples.
    const urls = [
      [url, 'image'],
    ];

    const offsets = await this.loadOffsets();
    const loader = await viv.loadOmeTiff(url, { offsets, headers: requestInit?.headers });
    const { Name: imageName, Pixels: { Channels } } = loader.metadata;
    const channels = Array.isArray(Channels)
      ? Channels.map((channel, i) => channel.Name || `Channel ${i}`)
      : [Channels.Name || `Channel ${0}`];

    const image = {
      name: imageName || 'Image',
      url,
      type: 'ome-tiff',
      ...(coordinateTransformations ? {
        metadata: {
          transform: {
            matrix: coordinateTransformationsToMatrix(coordinateTransformations),
          },
        },
      } : {}),
    };

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = [
      {
        ...image,
        loaderCreator: async () => ({ ...loader, channels }),
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
      );
    }

    return this.autoImageCache.then((autoImages) => {
      const [autoImageLayers, imageLayerLoaders, imageLayerMeta] = autoImages;

      const coordinationValues = {
        spatialImageLayer: autoImageLayers,
      };
      return new LoaderResult(
        {
          image: { loaders: imageLayerLoaders, meta: imageLayerMeta },
          featureIndex: channels,
        },
        urls,
        coordinationValues,
      );
    });
  }
}
