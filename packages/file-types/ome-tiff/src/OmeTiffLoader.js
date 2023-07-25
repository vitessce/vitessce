import { viv } from '@vitessce/gl';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxesForTiff,
} from '@vitessce/spatial-utils';
import { ImageWrapper } from '@vitessce/image-utils';
import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';

export default class OmeTiffLoader extends AbstractTwoStepLoader {
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
    const { coordinateTransformations: coordinateTransformationsFromOptions } = this.options || {};

    const offsets = await this.loadOffsets();
    const loader = await viv.loadOmeTiff(url, { offsets, headers: requestInit?.headers });

    const imageWrapper = new ImageWrapper(loader, this.options);

    const {
      Name: imageName,
      Pixels: {
        Channels,
        DimensionOrder,
        PhysicalSizeX,
        PhysicalSizeXUnit,
        PhysicalSizeY,
        PhysicalSizeYUnit,
      },
    } = loader.metadata;
    const channels = Array.isArray(Channels)
      ? Channels.map((channel, i) => channel.Name || `Channel ${i}`)
      : [Channels.Name || `Channel ${0}`];

    const transformMatrixFromOptions = coordinateTransformationsToMatrix(
      coordinateTransformationsFromOptions, getNgffAxesForTiff(DimensionOrder),
    );

    const usePhysicalSizeScaling = (
      PhysicalSizeX
      && PhysicalSizeXUnit
      && PhysicalSizeY
      && PhysicalSizeYUnit
    );

    const image = {
      name: imageName || 'Image',
      url,
      type: 'ome-tiff',
      ...(transformMatrixFromOptions ? {
        metadata: {
          transform: {
            matrix: transformMatrixFromOptions,
          },
        },
      } : {}),
    };

    // Get image name and URL tuples.
    const urls = [
      { url, name: image.name },
    ];

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = [
      {
        ...image,
        loaderCreator: async () => ({ ...loader, channels }),
      },
    ];

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
          image: {
            loaders: imageLayerLoaders, // TODO: replace with imageWrapper
            meta: imageLayerMeta, // TODO: replace with imageWrapper
            instance: imageWrapper, // TODO: make this the root value of LoaderResult.image.
          },
          featureIndex: imageWrapper.getChannelNames(),
        },
        urls,
        coordinationValues,
      );
    });
  }
}
