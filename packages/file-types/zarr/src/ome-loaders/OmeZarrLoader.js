import { viv } from '@vitessce/gl';
import {
  initializeRasterLayersAndChannels,
  coordinateTransformationsToMatrix,
  getNgffAxes,
  hexToRgb,
} from '@vitessce/spatial-utils';
import {
  ImageWrapper,
} from '@vitessce/image-utils';
import {
  AbstractLoaderError,
  LoaderResult,
  AbstractTwoStepLoader,
} from '@vitessce/vit-s';


export default class OmeZarrLoader extends AbstractTwoStepLoader {
  async load() {
    const payload = await this.dataSource.getJson('.zattrs').catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }

    const { coordinateTransformations: coordinateTransformationsFromOptions } = this.options || {};

    const loader = await viv.loadOmeZarr(this.url, { fetchOptions: this.requestInit, type: 'multiscales' });

    const imageWrapper = new ImageWrapper(loader, this.options);

    const { metadata, data } = loader;

    const { omero, multiscales } = metadata;

    if (!omero) {
      console.error('Path for image not valid');
      return Promise.reject(payload);
    }

    if (!Array.isArray(multiscales) || multiscales.length === 0) {
      console.error('Multiscales array must exist and have at least one element');
    }
    const { coordinateTransformations } = multiscales[0];

    // Axes in v0.4 format.
    const axes = getNgffAxes(multiscales[0].axes);

    const transformMatrixFromOptions = coordinateTransformationsToMatrix(
      coordinateTransformationsFromOptions, axes,
    );
    const transformMatrixFromFile = coordinateTransformationsToMatrix(
      coordinateTransformations, axes,
    );

    const transformMatrix = transformMatrixFromFile.multiplyLeft(transformMatrixFromOptions);

    const { rdefs, channels, name: omeroName } = omero;

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
        name: omeroName || 'Image',
        channels: channels.map((channel, i) => ({
          selection: filterSelection({ z, t, c: i }),
          slider: [channel.window.start, channel.window.end],
          color: hexToRgb(channel.color),
        })),
        ...(transformMatrix ? {
          metadata: {
            transform: {
              matrix: transformMatrix,
            },
          },
        } : {}),
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
      {
        image: {
          loaders: imageLayerLoaders, // TODO: replace with imageWrapper
          meta: imageLayerMeta, // TODO: replace with imageWrapper
          instance: imageWrapper, // TODO: make this the root value of LoaderResult.image.
        },
      },
      [],
      coordinationValues,
    ));
  }
}
