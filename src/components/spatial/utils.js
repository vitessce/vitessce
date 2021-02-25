/* eslint-disable no-plusplus */
import shortNumber from 'short-number';
import { cloneDeep, isEqual } from 'lodash';
import { getChannelStats, getDefaultInitialViewState } from '@hms-dbmi/viv';
import { extent } from 'd3-array';
import { Matrix4 } from 'math.gl';
import { divide, compare, unit } from 'mathjs';
import { pluralize } from '../../utils';
import { VIEWER_PALETTE } from '../utils';
import {
  GLOBAL_SLIDER_DIMENSION_FIELDS,
  DEFAULT_RASTER_LAYER_PROPS,
  DEFAULT_LAYER_TYPE_ORDERING,
} from './constants';

export function square(x, y, r) {
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
}

/**
 * Sort spatial layer definition array,
 * to keep the ordering in the layer controller
 * consistent.
 * Intended to be used with auto-initialized layer
 * definition arrays only, as a pre-defined layer array
 * should not be re-ordered.
 * @param {object[]} layers Array of layer definition objects.
 * Object must have a .type property.
 */
export function sortLayers(layers) {
  return layers.sort((a, b) => (
    DEFAULT_LAYER_TYPE_ORDERING.indexOf(a.type) - DEFAULT_LAYER_TYPE_ORDERING.indexOf(b.type)
  ));
}

/**
 * Return the midpoint of the global dimensions.
 * @param {object[]} imageDims Loader dimensions object array.
 * @returns {object} The selection.
 */
function getDefaultGlobalSelection(imageDims) {
  const globalIndices = imageDims
    .filter(dim => GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dim.field));
  const selection = {};
  globalIndices.forEach((dim) => {
    selection[dim.field] = Math.floor((dim.values.length || 0) / 2);
  });
  return selection;
}

/**
 * Create a default selection using the midpoint of the available global dimensions,
 * and then the first four available selections from the first selectable channel.
 * @param {object[]} imageDims Loader dimensions object array.
 * @returns {object} The selection.
 */
function buildDefaultSelection(imageDims) {
  const selection = [];
  const globalSelection = getDefaultGlobalSelection(imageDims);
  // First non-global dimension with some sort of selectable values
  const firstNonGlobalDimension = imageDims.filter(
    dim => !GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dim.field) && dim.values,
  )[0];
  for (let i = 0; i < Math.min(4, firstNonGlobalDimension.values.length); i += 1) {
    selection.push(
      {
        [firstNonGlobalDimension.field]: i,
        ...globalSelection,
      },
    );
  }
  return selection;
}

/**
 * Initialize the channel settings for an individual channel and selection.
 * @param {object} loader A viv loader instance, for either Zarr or OME-TIFF.
 * @param {object} selection The channel selection object.
 * @param {number} i The index of this channel for the layer.
 * @returns {object} The initialized channel with
 * domain/slider settings.
 */
export async function initializeChannelForSelection(loader, selection, i) {
  // Get stats because initial value is Min/Max for domainType.
  const stats = await getChannelStats({ loader, loaderSelection: [selection] });

  const domain = loader.isRgb ? [[0, 255], [0, 255], [0, 255]][i] : stats[0].domain;
  const color = loader.isRgb ? [[255, 0, 0], [0, 255, 0], [0, 0, 255]][i] : VIEWER_PALETTE[i];
  const slider = loader.isRgb ? [[0, 255], [0, 255], [0, 255]][i] : stats[0].autoSliders;

  return {
    selection,
    color,
    visible: true,
    slider: slider || domain,
  };
}

/**
 * Initialize the channel selections for an individual layer.
 * @param {object} loader A viv loader instance, for either Zarr or OME-TIFF.
 * @returns {object[]} An array of selected channels with default
 * domain/slider settings.
 */
export async function initializeLayerChannels(loader) {
  const result = [];
  const loaderDimensions = loader.dimensions;
  // Add channel automatically as the first avaialable value for each dimension.
  const defaultSelection = buildDefaultSelection(loaderDimensions);
  // Get stats because initial value is Min/Max for domainType.
  const stats = await getChannelStats({ loader, loaderSelection: defaultSelection });

  const domains = loader.isRgb
    ? [[0, 255], [0, 255], [0, 255]]
    : stats.map(stat => stat.domain);
  const colors = loader.isRgb
    ? [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
    : null;
  const sliders = loader.isRgb
    ? [[0, 255], [0, 255], [0, 255]]
    : stats.map(stat => stat.autoSliders);

  defaultSelection.forEach((selection, i) => {
    const domain = domains[i];
    const slider = sliders[i];
    const channel = {
      selection,
      color: colors ? colors[i] : VIEWER_PALETTE[i],
      visible: true,
      slider: slider || domain,
    };
    result.push(channel);
  });
  return result;
}

/**
 * A user may want to use pre-defined channels of interest
 * (defined in a `spatialLayers` coordination object),
 * but wants to allow Vitessce to auto-initialize the
 * sliders, colors, and/or domains for those channels.
 * This function allows those channel properties to
 * be initialized.
 * @param {object[]} layerDefsOrig The original array
 * of user-defined layer definitions, which must contain
 * an array of channel definitions with the .selection
 * property, but may be missing the .domain, .color, .visible,
 * or .slider properties.
 * @param {object} loaders Mapping from layer index to loader
 * instance.
 * @returns {Promise<array>} A tuple of [newLayerDefs, didInitialize],
 * where newLayerDefs is an array of the layers which contains
 * initialized channel properties,
 * and didInitialize is a boolean value indicating whether any
 * channels were initialized.
 */
export async function initializeLayerChannelsIfMissing(layerDefsOrig, loaders) {
  const layerDefs = cloneDeep(layerDefsOrig);
  const newLayerDefPromises = [];

  let didInitialize = false;
  for (let layerIndex = 0; layerIndex < layerDefs.length; layerIndex++) {
    const layerDef = layerDefs[layerIndex];
    const loader = loaders[layerDef.index];
    let newLayerDefPromise = Promise.resolve(layerDef);
    if (layerDef.channels) {
      const newChannelDefPromises = [];
      for (let channelIndex = 0; channelIndex < layerDef.channels.length; channelIndex++) {
        const channelDef = layerDef.channels[channelIndex];
        let newChannelDefPromise = Promise.resolve(channelDef);
        // Only auto-initialize if domains, colors, or sliders is missing.
        if (channelDef.selection && !(channelDef.color && channelDef.slider)) {
          newChannelDefPromise = initializeChannelForSelection(
            loader, channelDef.selection, channelIndex,
          )
            .then(autoChannelDef => Promise.resolve({ ...autoChannelDef, ...channelDef }));
          didInitialize = true;
        }
        newChannelDefPromises.push(newChannelDefPromise);
      }
      newLayerDefPromise = Promise.all(newChannelDefPromises)
        .then(newChannelDefs => Promise.resolve({ ...layerDef, channels: newChannelDefs }));
    }
    newLayerDefPromises.push(newLayerDefPromise);
  }
  const newLayerDefs = await Promise.all(newLayerDefPromises);
  return [newLayerDefs, didInitialize];
}

function getMetaWithTransformMatrices(imageMeta, imageLoaders) {
  // Do not fill in transformation matrices if any of the layers specify one.
  if (
    imageMeta.map(meta => meta?.metadata?.transform?.matrix
      || meta?.metadata?.transform?.scale
      || meta?.metadata?.transform?.translate).some(Boolean)
      || imageLoaders.every(loader => !loader?.physicalSizes?.x || !loader?.physicalSizes?.y)
  ) {
    return imageMeta;
  }
  // Get the minimum physical among all the current images.
  const minPhysicalSize = imageLoaders.reduce((acc, loader) => {
    const sizes = [
      unit(`${loader.physicalSizes.x.value} ${loader.physicalSizes.x.unit}`.replace('µ', 'u')),
      unit(`${loader.physicalSizes.y.value} ${loader.physicalSizes.y.unit}`.replace('µ', 'u')),
    ];
    acc[0] = (acc[0] === undefined || compare(sizes[0], acc[0]) === -1) ? sizes[0] : acc[0];
    acc[1] = (acc[1] === undefined || compare(sizes[1], acc[1]) === -1) ? sizes[1] : acc[1];
    return acc;
  }, []);
  const imageMetaWithTransform = imageMeta.map((meta, j) => {
    const loader = imageLoaders[j];
    const sizes = [
      unit(`${loader.physicalSizes.x.value} ${loader.physicalSizes.x.unit}`.replace('µ', 'u')),
      unit(`${loader.physicalSizes.y.value} ${loader.physicalSizes.y.unit}`.replace('µ', 'u')),
    ];
    // Find the ratio of the sizes to get the scaling factor.
    const scale = sizes.map((i, k) => divide(i, minPhysicalSize[k]));
    // no need to store/use identity scaling
    if (isEqual(scale, [1, 1])) {
      return meta;
    }
    // Make sure to scale the z direction by one.
    const matrix = new Matrix4().scale([...scale, 1]);
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
  let nextImageMeta = [];
  const autoImageLayerDefPromises = [];

  // Start all loader creators immediately.
  // Reference: https://eslint.org/docs/rules/no-await-in-loop
  const loaders = await Promise.all(rasterLayers.map(layer => layer.loaderCreator()));

  for (let i = 0; i < rasterLayers.length; i++) {
    const layer = rasterLayers[i];
    const loader = loaders[i];
    nextImageLoaders[i] = loader;
    nextImageMeta[i] = layer;
  }
  if (usePhysicalSizeScaling) {
    nextImageMeta = getMetaWithTransformMatrices(nextImageMeta, nextImageLoaders);
  }
  // No layers were pre-defined so set up the default image layers.
  if (!rasterRenderLayers) {
    // Midpoint of images list as default image to show.
    const layerIndex = Math.floor(rasterLayers.length / 2);
    const loader = nextImageLoaders[layerIndex];
    const autoImageLayerDefPromise = initializeLayerChannels(loader)
      .then(channels => Promise.resolve({
        type: 'raster', index: layerIndex, ...DEFAULT_RASTER_LAYER_PROPS, channels, modelMatrix: nextImageMeta[layerIndex]?.metadata?.transform?.matrix, transparentColor: layerIndex > 0 ? [0, 0, 0] : null,
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
          type: 'raster', index: layerIndex, ...DEFAULT_RASTER_LAYER_PROPS, channels, domainType: 'Min/Max', modelMatrix: nextImageMeta[layerIndex]?.metadata?.transform?.matrix, transparentColor: i > 0 ? [0, 0, 0] : null,
        }));
      autoImageLayerDefPromises.push(autoImageLayerDefPromise);
    }
  }

  const autoImageLayerDefs = await Promise.all(autoImageLayerDefPromises);
  return [autoImageLayerDefs, nextImageLoaders, nextImageMeta];
}

/**
 * Make a subtitle for the spatial component.
 * @param {object} params
 * @param {number} params.observationsCount
 * @param {string} params.observationsLabel
 * @param {string} params.observationsPluralLabel
 * @param {number} params.subobservationsCount
 * @param {string} params.subobservationsLabel
 * @param {string} params.subobservationsPluralLabel
 * @param {number} params.locationsCount
 * @returns {string} The subtitle string,
 * with info about items with zero counts omitted.
 */
export function makeSpatialSubtitle({
  observationsCount, observationsLabel, observationsPluralLabel,
  subobservationsCount, subobservationsLabel, subobservationsPluralLabel,
  locationsCount,
}) {
  const parts = [];
  if (subobservationsCount > 0) {
    let part = `${subobservationsCount} ${pluralize(subobservationsLabel, subobservationsPluralLabel, subobservationsCount)}`;
    if (locationsCount > 0) {
      part += ` at ${shortNumber(locationsCount)} locations`;
    }
    parts.push(part);
  }
  if (observationsCount > 0) {
    parts.push(`${observationsCount} ${pluralize(observationsLabel, observationsPluralLabel, observationsCount)}`);
  }
  return parts.join(', ');
}

export function getInitialSpatialTargets({
  width,
  height,
  cells,
  imageLayerLoaders,
}) {
  let initialTargetX = -Infinity;
  let initialTargetY = -Infinity;
  let initialZoom = -Infinity;
  // Some backoff from completely filling the screen.
  const zoomBackoff = 0.1;
  const cellValues = Object.values(cells);
  if (imageLayerLoaders.length > 0) {
    for (let i = 0; i < imageLayerLoaders.length; i += 1) {
      const viewSize = { height, width };
      const { target, zoom: newViewStateZoom } = getDefaultInitialViewState(
        imageLayerLoaders[i],
        viewSize,
        zoomBackoff,
      );
      if (target[0] > initialTargetX) {
        // eslint-disable-next-line prefer-destructuring
        initialTargetX = target[0];
        initialZoom = newViewStateZoom;
      }
      if (target[1] > initialTargetY) {
        // eslint-disable-next-line prefer-destructuring
        initialTargetY = target[1];
        initialZoom = newViewStateZoom;
      }
    }
  } else if (cellValues.length > 0) {
    const cellCoordinates = cellValues.map(c => c.xy);
    const xExtent = extent(cellCoordinates, c => c[0]);
    const yExtent = extent(cellCoordinates, c => c[1]);
    const xRange = xExtent[1] - xExtent[0];
    const yRange = yExtent[1] - yExtent[0];
    initialTargetX = xExtent[0] + xRange / 2;
    initialTargetY = yExtent[0] + yRange / 2;
    initialZoom = Math.log2(Math.min(width / xRange, height / yRange)) - zoomBackoff;
  }
  return { initialTargetX, initialTargetY, initialZoom };
}
