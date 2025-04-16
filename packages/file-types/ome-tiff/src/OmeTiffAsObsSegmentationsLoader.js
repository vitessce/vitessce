import { viv } from '@vitessce/gl';
import { LoaderResult } from '@vitessce/abstract';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxesForTiff,
} from '@vitessce/spatial-utils';
import {
  ImageWrapper,
} from '@vitessce/image-utils';
import { CoordinationLevel as CL } from '@vitessce/config';
import OmeTiffLoader from './OmeTiffLoader.js';

export default class OmeTiffAsObsSegmentationsLoader extends OmeTiffLoader {
  async load() {
    const { url, requestInit } = this;
    const {
      coordinateTransformations: coordinateTransformationsFromOptions,
      obsTypesFromChannelNames,
    } = this.options || {};
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

    const channelObjects = imageWrapper.getChannelObjects();
    const channelCoordination = channelObjects.slice(0, 5).map((channelObj, i) => ({
      spatialTargetC: i,
      spatialChannelColor: (channelObj.defaultColor || channelObj.autoDefaultColor).slice(0, 3),
      spatialChannelVisible: true,
      spatialChannelOpacity: 1.0,
      spatialChannelWindow: channelObj.defaultWindow || null,
      // featureType: 'feature',
      // featureValueType: 'value',
      obsColorEncoding: 'spatialChannelColor',
      spatialSegmentationFilled: true,
      spatialSegmentationStrokeWidth: 1.0,
      obsHighlight: null,
      ...(obsTypesFromChannelNames ? { obsType: channelObj.name } : {}),
    }));

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
        // Old
        spatialSegmentationLayer: autoImageLayers,
        // New
        spatialTargetZ: imageWrapper.getDefaultTargetZ(),
        spatialTargetT: imageWrapper.getDefaultTargetT(),
        segmentationLayer: CL([
          {
            fileUid: this.coordinationValues?.fileUid || null,
            spatialLayerOpacity: 1.0,
            spatialLayerVisible: true,
            segmentationChannel: CL(channelCoordination),
          },
        ]),
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
