import { viv } from '@vitessce/gl';
import { LoaderResult } from '@vitessce/vit-s';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxesForTiff,
} from '@vitessce/spatial-utils';
import {
  ImageWrapper,
} from '@vitessce/image-utils';
import OmeTiffLoader from './OmeTiffLoader.js';

export default class OmeTiffAsObsSegmentationsLoader extends OmeTiffLoader {
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
      // This load() method is the same as in ./OmeTiffLoader except we specify isBitmask here:
      metadata: {
        isBitmask: true,
        ...(transformMatrixFromOptions ? {
          transform: {
            matrix: transformMatrixFromOptions,
          },
        } : {}),
      },
    };

    // Get image name and URL tuples.
    const urls = [{ url, name: image.name }];

    // Add a loaderCreator function for each image layer.
    const imagesWithLoaderCreators = [
      {
        ...image,
        loaderCreator: async () => {
          const channels = Array.isArray(Channels)
            ? Channels.map((channel, i) => channel.Name || `Channel ${i}`)
            : [Channels.Name || `Channel ${0}`];
          return { ...loader, channels };
        },
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
        spatialSegmentationLayer: autoImageLayers,
      };
      return new LoaderResult(
        {
          obsSegmentationsType: 'bitmask',
          obsSegmentations: {
            loaders: imageLayerLoaders, // TODO: replace with imageWrapper
            meta: imageLayerMeta, // TODO: replace with imageWrapper
            instance: imageWrapper, // TODO: make this the root value of LoaderResult.image.
          },
        },
        urls,
        coordinationValues,
      );
    });
  }
}
