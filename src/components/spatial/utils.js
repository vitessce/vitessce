/* eslint-disable */
import shortNumber from 'short-number';
import { VIEWER_PALETTE } from '../utils';
import { pluralize } from '../../utils';
import {
    GLOBAL_SLIDER_DIMENSION_FIELDS,
    DEFAULT_LAYER_PROPS,
} from './constants';
import { getChannelStats, DTYPE_VALUES, MAX_SLIDERS_AND_CHANNELS } from '@hms-dbmi/viv';







/**
 * Return the midpoint of the global dimensions.
 * @param {object[]} imageDims Loader dimensions object array.
 * @returns {object} The selection.
 */
function getDefaultGlobalSelection(imageDims) {
    const globalIndices = imageDims.filter(dim => GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dim.field));
    const selection = {};
    globalIndices.forEach((dim) => {
      selection[dim.field] = Math.floor((dim.values.length || 0) / 2);
    });
    return selection;
}
  
  // Create a default selection using the midpoint of the available global dimensions,
  // and then the first four available selections from the first selectable channel.
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
  
// Set the domain of the sliders based on either a full range or min/max.
async function getDomainsAndSliders(loader, loaderSelection, domainType) {
  let domains;
  const stats = await getChannelStats({ loader, loaderSelection });
  const sliders = stats.map(stat => stat.autoSliders);
  if (domainType === 'Min/Max') {
    domains = stats.map(stat => stat.domain);
  } if (domainType === 'Full') {
    domains = loaderSelection.map(() => [0, DTYPE_VALUES[loader.dtype].max]);
  }
  return { domains, sliders };
}

/**
 * Initialize the channel selections for an individual layer.
 * @param {object} layer A layer metadata object.
 * @param {object} loader A viv loader instance, for either Zarr or OME-TIFF.
 * @returns {object[]} An array of selected channels with default
 * domain/slider settings.
 */
export async function initializeLayerChannels(layer, loader) {
    const result = [];
    const loaderDimensions = loader.dimensions;
    // Add channel automatically as the first avaialable value for each dimension.
    const defaultSelection = buildDefaultSelection(loaderDimensions);
    // Get stats because initial value is Min/Max for domainType.
    const stats = await getChannelStats({ loader, loaderSelection: defaultSelection })

    const domains = loader.isRgb ? [[0, 255], [0, 255], [0, 255]] : stats.map(stat => stat.domain);
    const colors = loader.isRgb ? [[255, 0, 0], [0, 255, 0], [0, 0, 255]] : null;
    const sliders = loader.isRgb ? [[0, 255], [0, 255], [0, 255]] : stats.map(stat => stat.autoSliders);

    defaultSelection.forEach((selection, i) => {
        const domain = domains[i];
        const slider = sliders[i];
        const channel = {
          // TODO: clarify how this selection value can look in different scenarios, for example 3D or z-stack.
          selection,
          domain,
          color: colors ? colors[i] : VIEWER_PALETTE[i],
          visibility: true,
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
 * @param {*} images A list of image metadata objects with fields { name, type, and url }.
 * @param {*} loaderCreators A list of layer creator functions corresponding to each image.
 * @param {*} renderLayers 
 */
export async function initializeLayersAndChannels(layers, renderLayers) {
    const result = [];
    if (!renderLayers) {
        // Midpoint of images list as default image to show.
        const layerIndex = Math.floor(layers.length / 2);
        const layer = layers[layerIndex];
        const loader = await layer.loaderCreator();
        const channels = await initializeLayerChannels(layer, loader);
        result.push({ index: layerIndex, layer, loader, channels });
    } else {
        // The renderLayers parameter is a list of layer names to show by default.
        const globalIndicesOfRenderLayers = renderLayers.map(imageName => layers.findIndex(image => image.name === imageName));
        globalIndicesOfRenderLayers.forEach(async (layerIndex) => {
            const layer = layers[layerIndex];
            const loader = await layer.loaderCreator();
            const channels = await initializeLayerChannels(layer, loader);
            layers.push({ index: layerIndex, layer, loader, channels });
        });
    }
    return result;
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
  if (observationsCount > 0) {
    parts.push(`${observationsCount} ${pluralize(observationsLabel, observationsPluralLabel, observationsCount)}`);
  }
  if (subobservationsCount > 0) {
    let part = `${subobservationsCount} ${pluralize(subobservationsLabel, subobservationsPluralLabel, subobservationsCount)}`;
    if (locationsCount > 0) {
      part += ` at ${shortNumber(locationsCount)} locations`;
    }
    parts.push(part);
  }
  return parts.join(', ');
}
