import isEqual from 'lodash/isEqual';
import { Matrix4 } from 'math.gl';
import { divide, compare, unit } from 'mathjs';
import { VIEWER_PALETTE } from '@vitessce/utils';
import { viv } from '@vitessce/gl';
import { getMultiSelectionStats } from './layer-controller';

export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

export const GLOBAL_LABELS = ['z', 't'];

export const DEFAULT_RASTER_DOMAIN_TYPE = 'Min/Max';

export const DEFAULT_RASTER_LAYER_PROPS = {
  visible: true,
  colormap: null,
  opacity: 1,
  domainType: DEFAULT_RASTER_DOMAIN_TYPE,
  transparentColor: [0, 0, 0],
  renderingMode: viv.RENDERING_MODES.ADDITIVE,
  use3d: false,
};

export const DEFAULT_MOLECULES_LAYER = {
  opacity: 1, radius: 20, visible: true,
};
export const DEFAULT_CELLS_LAYER = {
  opacity: 1, radius: 50, visible: true, stroked: false,
};
export const DEFAULT_NEIGHBORHOODS_LAYER = {
  visible: false,
};

export const DEFAULT_LAYER_TYPE_ORDERING = [
  'molecules',
  'cells',
  'neighborhoods',
  'raster',
];

/**
 * Get a representative PixelSource from a loader object returned from
 * the Vitessce imaging loaders
 * @param {object} loader { data: (PixelSource[]|PixelSource), metadata, channels } object
 * @param {number=} level Level of the multiscale loader from which to get a PixelSource
 * @returns {object} PixelSource object
 */
export function getSourceFromLoader(loader, level) {
  const { data } = loader;
  const source = Array.isArray(data) ? data[(level || data.length - 1)] : data;
  return source;
}

/**
 * Helper method to determine whether pixel data is interleaved and rgb or not.
 * @param {object} loader
 * @param {array|null} channels
 */
export function isRgb(loader, channels) {
  const source = getSourceFromLoader(loader);
  const { shape, dtype, labels } = source;
  const channelSize = shape[(labels.includes('channel') ? labels.indexOf('channel') : labels.indexOf('c'))];
  if (channelSize === 3 && dtype === 'Uint8') {
    return true;
  }
  if (channels && channels.length === 3
    && isEqual(channels[0].color, [255, 0, 0])
    && isEqual(channels[1].color, [0, 255, 0])
    && isEqual(channels[2].color, [0, 0, 255])
  ) {
    return true;
  }
  return false;
}

// From spatial/utils.js

function getMetaWithTransformMatrices(imageMeta, imageLoaders) {
  // Do not fill in transformation matrices if any of the layers specify one.
  const sources = imageLoaders.map(loader => getSourceFromLoader(loader));
  if (
    imageMeta.map(meta => meta?.metadata?.transform?.matrix
      || meta?.metadata?.transform?.scale
      || meta?.metadata?.transform?.translate).some(Boolean)
    || sources.every(
      source => !source.meta?.physicalSizes?.x || !source.meta?.physicalSizes?.y,
    )
  ) {
    return imageMeta;
  }
  // Get the minimum physical among all the current images.
  const minPhysicalSize = sources.reduce((acc, source) => {
    const hasZPhyscialSize = source.meta?.physicalSizes?.z?.size;
    const sizes = [
      unit(`${source.meta?.physicalSizes.x.size} ${source.meta?.physicalSizes.x.unit}`.replace('µ', 'u')),
      unit(`${source.meta?.physicalSizes.y.size} ${source.meta?.physicalSizes.y.unit}`.replace('µ', 'u')),
    ];
    if (hasZPhyscialSize) {
      sizes.push(unit(`${source.meta?.physicalSizes.z.size} ${source.meta?.physicalSizes.z.unit}`.replace('µ', 'u')));
    }
    acc[0] = (acc[0] === undefined || compare(sizes[0], acc[0]) === -1) ? sizes[0] : acc[0];
    acc[1] = (acc[1] === undefined || compare(sizes[1], acc[1]) === -1) ? sizes[1] : acc[1];
    acc[2] = (acc[2] === undefined || compare(sizes[2], acc[2]) === -1) ? sizes[2] : acc[2];
    return acc;
  }, []);
  const imageMetaWithTransform = imageMeta.map((meta, j) => {
    const source = sources[j];
    const hasZPhyscialSize = source.meta?.physicalSizes?.z?.size;
    const sizes = [
      unit(`${source.meta?.physicalSizes.x.size} ${source.meta?.physicalSizes.x.unit}`.replace('µ', 'u')),
      unit(`${source.meta?.physicalSizes.y.size} ${source.meta?.physicalSizes.y.unit}`.replace('µ', 'u')),
    ];
    if (hasZPhyscialSize) {
      sizes.push(unit(`${source.meta?.physicalSizes.z.size} ${source.meta?.physicalSizes.z.unit}`.replace('µ', 'u')));
    }
    // Find the ratio of the sizes to get the scaling factor.
    const scale = sizes.map((i, k) => divide(i, minPhysicalSize[k]));
    // Add in z dimension needed for Matrix4 scale API.
    if (!scale[2]) {
      scale[2] = 1;
    }
    // no need to store/use identity scaling
    if (isEqual(scale, [1, 1, 1])) {
      return meta;
    }
    // Make sure to scale the z direction by one.
    const matrix = new Matrix4().scale([...scale]);
    const newMeta = { ...meta };
    newMeta.metadata = {
      ...newMeta.metadata,
      // We don't want to store matrix objects in the view config.
      transform: { matrix: matrix.toArray() },
    };
    return newMeta;
  });
  return imageMetaWithTransform;
}

/**
 * Return the midpoint of the global dimensions.
 * @param {object} source PixelSource object from Viv
 * @returns {object} The selection.
 */
function getDefaultGlobalSelection(source) {
  const globalIndices = source.labels
    .filter(dim => GLOBAL_LABELS.includes(dim));
  const selection = {};
  globalIndices.forEach((dim) => {
    selection[dim] = Math.floor(
      (source.shape[source.labels.indexOf(dim)] || 0) / 2,
    );
  });
  return selection;
}


/**
 * Create a default selection using the midpoint of the available global dimensions,
 * and then the first four available selections from the first selectable channel.
 * @param {object} source PixelSource object from Viv
 * @returns {object} The selection.
 */
function buildDefaultSelection(source) {
  const selection = [];
  const globalSelection = getDefaultGlobalSelection(source);
  // First non-global dimension with some sort of selectable values
  const firstNonGlobalDimension = source.labels.filter(
    dim => !GLOBAL_LABELS.includes(dim)
      && source.shape[source.labels.indexOf(dim)],
  )[0];
  for (let i = 0; i < Math.min(4, source.shape[
    source.labels.indexOf(firstNonGlobalDimension)
  ]); i += 1) {
    selection.push(
      {
        [firstNonGlobalDimension]: i,
        ...globalSelection,
      },
    );
  }
  return selection;
}

/**
 * @param {Array.<number>} shape loader shape
 */
export function isInterleaved(shape) {
  const lastDimSize = shape[shape.length - 1];
  return lastDimSize === 3 || lastDimSize === 4;
}

/**
 * Initialize the channel selections for an individual layer.
 * @param {object} loader A viv loader instance with channel names appended by Vitessce loaders
 * of the form { data: (PixelSource[]|PixelSource), metadata: Object, channels }
 * @returns {object[]} An array of selected channels with default
 * domain/slider settings.
 */
export async function initializeLayerChannels(loader, use3d) {
  const result = [];
  const source = getSourceFromLoader(loader);
  // Add channel automatically as the first avaialable value for each dimension.
  let defaultSelection = buildDefaultSelection(source);
  defaultSelection = isInterleaved(source.shape)
    ? [{ ...defaultSelection[0], c: 0 }] : defaultSelection;
  const stats = await getMultiSelectionStats({
    loader: loader.data, selections: defaultSelection, use3d,
  });

  const domains = isRgb(loader, null)
    ? [[0, 255], [0, 255], [0, 255]]
    : stats.domains;
  const colors = isRgb(loader, null)
    ? [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
    : null;
  const sliders = isRgb(loader, null)
    ? [[0, 255], [0, 255], [0, 255]]
    : stats.sliders;

  defaultSelection.forEach((selection, i) => {
    const domain = domains[i];
    const slider = sliders[i];
    const channel = {
      selection,
      // eslint-disable-next-line no-nested-ternary
      color: colors ? colors[i]
        : defaultSelection.length !== 1
          ? VIEWER_PALETTE[i] : [255, 255, 255],
      visible: true,
      slider: slider || domain,
    };
    result.push(channel);
  });
  return result;
}

/**
 * Given a set of image layer loader creator functions,
 * create loader objects for an initial layer or set of layers,
 * which will be selected based on default values predefined in
 * the image data file or otherwise by a heuristic
 * (the midpoint of the layers array).
 * @param {object[]} rasterLayers A list of layer metadata objects with
 * shape { name, type, url, createLoader }.
 * @param {(string[]|null)} rasterRenderLayers A list of default raster layers. Optional.
 */
export async function initializeRasterLayersAndChannels(
  rasterLayers,
  rasterRenderLayers,
  usePhysicalSizeScaling,
) {
  const nextImageLoaders = [];
  let nextImageMetaAndLayers = [];
  const autoImageLayerDefPromises = [];

  // Start all loader creators immediately.
  // Reference: https://eslint.org/docs/rules/no-await-in-loop
  const loaders = await Promise.all(rasterLayers.map(layer => layer.loaderCreator()));

  for (let i = 0; i < rasterLayers.length; i++) {
    const layer = rasterLayers[i];
    const loader = loaders[i];
    nextImageLoaders[i] = loader;
    nextImageMetaAndLayers[i] = layer;
  }
  if (usePhysicalSizeScaling) {
    nextImageMetaAndLayers = getMetaWithTransformMatrices(nextImageMetaAndLayers, nextImageLoaders);
  }
  // No layers were pre-defined so set up the default image layers.
  if (!rasterRenderLayers) {
    // Midpoint of images list as default image to show.
    const layerIndex = Math.floor(rasterLayers.length / 2);
    const loader = nextImageLoaders[layerIndex];
    const autoImageLayerDefPromise = initializeLayerChannels(loader)
      .then(channels => Promise.resolve({
        type: nextImageMetaAndLayers[layerIndex]?.metadata?.isBitmask ? 'bitmask' : 'raster',
        index: layerIndex,
        ...DEFAULT_RASTER_LAYER_PROPS,
        channels: channels.map((channel, j) => ({
          ...channel,
          ...(nextImageMetaAndLayers[layerIndex].channels
            ? nextImageMetaAndLayers[layerIndex].channels[j] : []),
        })),
        modelMatrix: nextImageMetaAndLayers[layerIndex]?.metadata?.transform?.matrix,
        transparentColor: layerIndex > 0 ? [0, 0, 0] : null,
      }));
    autoImageLayerDefPromises.push(autoImageLayerDefPromise);
  } else {
    // The renderLayers parameter is a list of layer names to show by default.
    const globalIndicesOfRenderLayers = rasterRenderLayers
      .map(imageName => rasterLayers.findIndex(image => image.name === imageName));
    for (let i = 0; i < globalIndicesOfRenderLayers.length; i++) {
      const layerIndex = globalIndicesOfRenderLayers[i];
      const loader = nextImageLoaders[layerIndex];
      const autoImageLayerDefPromise = initializeLayerChannels(loader)
        // eslint-disable-next-line no-loop-func
        .then(channels => Promise.resolve({
          type: nextImageMetaAndLayers[layerIndex]?.metadata?.isBitmask ? 'bitmask' : 'raster',
          index: layerIndex,
          ...DEFAULT_RASTER_LAYER_PROPS,
          channels: channels.map((channel, j) => ({
            ...channel,
            ...(nextImageMetaAndLayers[layerIndex].channels
              ? nextImageMetaAndLayers[layerIndex].channels[j] : []),
          })),
          domainType: 'Min/Max',
          modelMatrix: nextImageMetaAndLayers[layerIndex]?.metadata?.transform?.matrix,
          transparentColor: i > 0 ? [0, 0, 0] : null,
        }));
      autoImageLayerDefPromises.push(autoImageLayerDefPromise);
    }
  }

  const autoImageLayerDefs = await Promise.all(autoImageLayerDefPromises);
  return [autoImageLayerDefs, nextImageLoaders, nextImageMetaAndLayers];
}
