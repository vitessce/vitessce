import { viv } from '@vitessce/gl';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxes,
} from '@vitessce/spatial-utils';
import {
  AbstractLoaderError,
  LoaderResult,
  AbstractTwoStepLoader,
} from '@vitessce/vit-s';

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

    const { coordinateTransformations: coordinateTransformationsFromOptions } = this.options || {};

    const loader = await viv.loadOmeZarr(this.url, { fetchOptions: this.requestInit, type: 'multiscales' });
    const { metadata, data } = loader;

    const { omero, multiscales, channels_metadata: spatialDataChannels } = metadata;

    // Crude way to check if this is a SpatialData OME-NGFF.
    const isSpatialData = !!spatialDataChannels;

    if (!isSpatialData && !omero) {
      console.error('image.ome-zarr must have omero metadata in attributes.');
      return Promise.reject(payload);
    }

    if (!Array.isArray(multiscales) || multiscales.length === 0) {
      console.error('Multiscales array must exist and have at least one element');
    }

    const { coordinateTransformations, name: imageName } = multiscales[0];

    // Axes in v0.4 format.
    const axes = getNgffAxes(multiscales[0].axes);

    const transformMatrixFromOptions = coordinateTransformationsToMatrix(
      coordinateTransformationsFromOptions, axes,
    );
    const transformMatrixFromFile = coordinateTransformationsToMatrix(
      coordinateTransformations, axes,
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
      const { channels } = spatialDataChannels;
      channelObjects = channels.map((channel, i) => ({
        selection: filterSelection({ z: initialTargetZ, t: initialTargetT, c: i }),
        slider: [0, 255],
        color: [255, 255, 255],
      }));
      channelLabels = channels.map(c => c.label);
    } else {
      const { rdefs, channels } = omero;
      if(typeof rdefs.defaultT === 'number') {
        initialTargetT = rdefs.defaultT;
      }
      if(typeof rdefs.defaultZ === 'number') {
        initialTargetZ = rdefs.defaultZ;
      }
      channelObjects = channels.map((channel, i) => ({
        selection: filterSelection({ z: initialTargetZ, t: initialTargetT, c: i }),
        slider: [channel.window.start, channel.window.end],
        color: hexToRgb(channel.color),
      }))
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

    const coordinationValues = {
      spatialImageLayer: autoImageLayers,
    };
    return Promise.resolve(new LoaderResult(
      { image: { loaders: imageLayerLoaders, meta: imageLayerMeta } },
      [],
      coordinationValues,
    ));
  }
}
