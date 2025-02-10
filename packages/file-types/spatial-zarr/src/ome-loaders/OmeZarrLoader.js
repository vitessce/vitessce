import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxes,
  hexToRgb,
  normalizeCoordinateTransformations,
  loadOmeZarr,
} from '@vitessce/spatial-utils';
import {
  ImageWrapper,
} from '@vitessce/image-utils';
import {
  AbstractLoaderError,
  LoaderResult,
  AbstractTwoStepLoader,
} from '@vitessce/abstract';
import { CoordinationLevel as CL } from '@vitessce/config';
import { log } from '@vitessce/globals';

export default class OmeZarrLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.storeRoot = this.dataSource.storeRoot;
  }

  async load() {
    const payload = await this.dataSource.getJson('.zattrs', this.storeRoot).catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const { coordinateTransformations: coordinateTransformationsFromOptions } = this.options || {};

    // Here, we use this.storeRoot as opposed to this.dataSource.storeRoot.
    // Loader sub-classes may override this.storeRoot in their constructor
    // if their OME-Zarr image is not at the root of the store.
    const loader = await loadOmeZarr(this.storeRoot);
    const imageWrapper = new ImageWrapper(loader, this.options);

    const { metadata, data } = loader;
    const { omero, multiscales, channels_metadata: spatialDataChannels, 'image-label': imageLabel } = metadata;

    // Crude way to check if this is a SpatialData OME-NGFF.
    const isSpatialData = !!spatialDataChannels || !!imageLabel;
    const isLabels = !!imageLabel;

    if (!isSpatialData && !omero) {
      log.error('image.ome-zarr must have omero metadata in attributes.');
      return Promise.reject(payload);
    }

    if (!Array.isArray(multiscales) || multiscales.length === 0) {
      log.error('Multiscales array must exist and have at least one element');
    }

    const {
      datasets,
      coordinateTransformations: coordinateTransformationsFromFile,
      name: imageName,
    } = multiscales[0];

    // Axes in v0.4 format.
    const axes = getNgffAxes(multiscales[0].axes);

    // SpatialData uses the new coordinateTransformations spec.
    // Reference: https://github.com/ome/ngff/pull/138

    // This new spec is very flexible, so here we will attepmpt to convert it back to the old spec.
    const normCoordinateTransformationsFromFile = normalizeCoordinateTransformations(
      coordinateTransformationsFromFile, datasets,
    );

    const transformMatrixFromOptions = coordinateTransformationsToMatrix(
      coordinateTransformationsFromOptions, axes,
    );
    const transformMatrixFromFile = coordinateTransformationsToMatrix(
      normCoordinateTransformationsFromFile, axes,
    );

    const transformMatrix = transformMatrixFromFile.multiplyLeft(transformMatrixFromOptions);


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

    let channelObjects;
    let channelLabels = [];
    let initialTargetT = 0;
    let initialTargetZ = 0;
    if (isSpatialData) {
      // TODO: Consider removing support for `channels_metadata` once OME-NGFF loosens
      // requirements for channel metadata fields such as `window` and `color`.
      // (Unclear if we will need to keep this around for backwards compatibility with
      // those SpatialData objects generated in the meantime though.)
      // References:
      // - https://github.com/ome/ngff/issues/192
      // - https://github.com/ome/ome-zarr-py/pull/261
      if (isLabels) {
        channelObjects = [{
          selection: filterSelection({ z: initialTargetZ, t: initialTargetT, c: 0 }),
          slider: [0, 255],
          color: [255, 255, 255],
        }];
        channelLabels = ['labels'];
      } else {
        const { channels } = spatialDataChannels;
        channelObjects = channels.map((channel, i) => ({
          selection: filterSelection({ z: initialTargetZ, t: initialTargetT, c: i }),
          slider: [0, 255],
          color: [255, 255, 255],
        }));
        channelLabels = channels.map(c => c.label);
      }
    } else {
      const { rdefs = {}, channels } = omero;
      if (typeof rdefs.defaultT === 'number') {
        initialTargetT = rdefs.defaultT;
      }
      if (typeof rdefs.defaultZ === 'number') {
        initialTargetZ = rdefs.defaultZ;
      }
      channelObjects = channels.map((channel, i) => ({
        selection: filterSelection({ z: initialTargetZ, t: initialTargetT, c: i }),
        slider: channel.window ? ([channel.window.start, channel.window.end]) : [0, 255],
        color: channel.color ? hexToRgb(channel.color) : [255, 255, 255],
      }));
      channelLabels = channels.map(c => c.label);
    }

    const imagesWithLoaderCreators = [
      {
        name: imageName || 'Image',
        channels: channelObjects,
        ...(transformMatrix ? {
          metadata: {
            transform: {
              matrix: transformMatrix,
            },
          },
        } : {}),
        loaderCreator: async () => ({ ...loader, channels: channelLabels }),
      },
    ];

    // TODO: use options for initial selection of channels
    // which omit domain/slider ranges.
    const [
      autoImageLayers, imageLayerLoaders, imageLayerMeta,
    ] = await initializeRasterLayersAndChannels(
      imagesWithLoaderCreators, undefined,
    );

    const channelObjects2 = imageWrapper.getChannelObjects();
    const channelCoordination = channelObjects2.slice(0, 5).map((channelObj, i) => ({
      spatialTargetC: i,
      spatialChannelColor: (channelObj.defaultColor || channelObj.autoDefaultColor).slice(0, 3),
      spatialChannelVisible: true,
      spatialChannelOpacity: 1.0,
      spatialChannelWindow: channelObj.defaultWindow || null,
    }));


    const coordinationValues = {
      // Old
      spatialImageLayer: autoImageLayers,
      // New
      spatialTargetZ: imageWrapper.getDefaultTargetZ(),
      spatialTargetT: imageWrapper.getDefaultTargetT(),
      imageLayer: CL([
        {
          fileUid: this.coordinationValues?.fileUid || null,
          spatialLayerOpacity: 1.0,
          spatialLayerVisible: true,
          photometricInterpretation: imageWrapper.getPhotometricInterpretation(),
          volumetricRenderingAlgorithm: 'maximumIntensityProjection',
          spatialTargetResolution: null,
          imageChannel: CL(channelCoordination),
        },
      ]),
    };

    return Promise.resolve(new LoaderResult(
      {
        image: {
          loaders: imageLayerLoaders, // TODO: replace with imageWrapper
          meta: imageLayerMeta, // TODO: replace with imageWrapper
          instance: imageWrapper, // TODO: make this the root value of LoaderResult.image.
        },
        featureIndex: imageWrapper.getChannelNames(),
      },
      null,
      coordinationValues,
    ));
  }
}
