/* eslint-disable */
import shortNumber from 'short-number';
import { VIEWER_PALETTE } from '../utils';
import { pluralize } from '../../utils';
import {
    GLOBAL_SLIDER_DIMENSION_FIELDS, DEFAULT_RASTER_LAYER_PROPS
} from './constants';
import { getChannelStats } from '@hms-dbmi/viv';



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
 * @param {*} layers A list of layer metadata objects with fields { name, type, url, createLoader }.
 * @param {*} renderLayers A list of default layers, both raster (image) and vector (cells/molecules).
 */
export async function initializeLayersAndChannels(rasterLayers, rasterRenderLayers, layerDefs, initStrategy = "auto") {
    const nextImageLoaders = {};
    const nextImageMeta = {};
    const nextLayerDefs = [];

    if(layerDefs) {
        // There were already layers defined so do not consider the initialization strategy.
        for(const layerDef of layerDefs) {
            const { type: layerType, index: layerIndex } = layerDef;
            if(layerType === "raster") {
                // Since this is an image layer we need to set up its loader.
                const layer = rasterLayers[layerIndex];
                const loader = await layer.loaderCreator();
                // If channels array was provided, use it. Otherwise initialize automatically.
                // TODO: check if user provided a valid or partially-valid channels array
                // TODO: if only a partial channels array, set up defaults for domain/sliders/etc.
                nextImageLoaders[layerIndex] = loader;
                nextImageMeta[layerIndex] = layer;
            }
            nextLayerDefs.push(layerDef);
        };
    } else if(initStrategy === "auto") {
        // No layers were pre-defined and the initialization stragegy was "auto"
        // TODO: don't assume that molecules and cells data is available.
        nextLayerDefs.push({ type: 'molecules', opacity: 1, radius: 20, visible: true });
        nextLayerDefs.push({ type: 'cells', opacity: 1, radius: 50, visible: true, stroked: false });
         if (!rasterRenderLayers) {
            // Midpoint of images list as default image to show.
            const layerIndex = Math.floor(rasterLayers.length / 2);
            const layer = rasterLayers[layerIndex];
            const loader = await layer.loaderCreator();
            const channels = await initializeLayerChannels(layer, loader);
            nextImageLoaders[layerIndex] = loader;
            nextImageMeta[layerIndex] = layer;
            nextLayerDefs.push({ type: "raster", index: layerIndex, ...DEFAULT_RASTER_LAYER_PROPS, channels, });
        } else {
            // The renderLayers parameter is a list of layer names to show by default.
            const globalIndicesOfRenderLayers = rasterRenderLayers.map(imageName => rasterLayers.findIndex(image => image.name === imageName));
            for(const layerIndex of globalIndicesOfRenderLayers) {
                const layer = rasterLayers[layerIndex];
                const loader = await layer.loaderCreator();
                const channels = await initializeLayerChannels(layer, loader);
                nextImageLoaders[layerIndex] = loader;
                nextImageMeta[layerIndex] = layer;
                nextLayerDefs.push({ type: "raster", index: layerIndex, ...DEFAULT_RASTER_LAYER_PROPS, channels, });
            };
        }
    }
    return [nextLayerDefs, nextImageLoaders, nextImageMeta];
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
