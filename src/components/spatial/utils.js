/* eslint-disable */
import shortNumber from 'short-number';
import { pluralize } from '../../utils';
import {
    GLOBAL_SLIDER_DIMENSION_FIELDS, DEFAULT_LAYER_PROPS,
  } from './constants';
  import { getChannelStats, DTYPE_VALUES, MAX_SLIDERS_AND_CHANNELS } from '@hms-dbmi/viv';


// Return the midpoint of the global dimensions.
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
