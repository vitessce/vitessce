/* eslint-disable */
import {
    GLOBAL_SLIDER_DIMENSION_FIELDS, DEFAULT_LAYER_PROPS,
  } from './constants';
  import { getChannelStats, DTYPE_VALUES, MAX_SLIDERS_AND_CHANNELS } from '@hubmap/vitessce-image-viewer';


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
  async function getDomain(loader, loaderSelection, domainType) {
    let domain;
    if (domainType === 'Min/Max') {
      const stats = await getChannelStats({ loader, loaderSelection });
      domain = stats.map(stat => stat.domain);
    } if (domainType === 'Full') {
      domain = loaderSelection.map(() => [0, DTYPE_VALUES[loader.dtype].max]);
    }
    return domain;
  }