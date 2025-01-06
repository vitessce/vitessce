/* eslint-disable no-plusplus */
import shortNumber from 'short-number';
import { Matrix4 } from 'math.gl';
import { viv, BitmaskLayer } from '@vitessce/gl';
import { DEFAULT_LAYER_TYPE_ORDERING } from '@vitessce/spatial-utils';
import { extent } from 'd3-array';
import {
  pluralize as plur,
  commaNumber,
} from '@vitessce/utils';

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
  observationsCount, observationsLabel,
  subobservationsCount, subobservationsLabel,
  locationsCount,
}) {
  const parts = [];
  if (subobservationsCount > 0) {
    let part = `${commaNumber(subobservationsCount)} ${plur(subobservationsLabel, subobservationsCount)}`;
    if (locationsCount > 0) {
      part += ` at ${shortNumber(locationsCount)} locations`;
    }
    parts.push(part);
  }
  if (observationsCount > 0) {
    parts.push(`${commaNumber(observationsCount)} ${plur(observationsLabel, observationsCount)}`);
  }
  return parts.join(', ');
}

export function getInitialSpatialTargets({
  width,
  height,
  obsCentroids,
  obsSegmentations,
  obsSegmentationsType,
  imageLayerLoaders,
  useRaster,
  use3d,
  modelMatrices,
}) {
  let initialTargetX = -Infinity;
  let initialTargetY = -Infinity;
  let initialTargetZ = -Infinity;
  let initialZoom = -Infinity;
  // Some backoff from completely filling the screen.
  const zoomBackoff = use3d ? 1.5 : 0.1;
  if (imageLayerLoaders.length > 0 && useRaster) {
    for (let i = 0; i < imageLayerLoaders.length; i += 1) {
      const viewSize = { height, width };
      const { target, zoom: newViewStateZoom } = viv.getDefaultInitialViewState(
        imageLayerLoaders[i].data,
        viewSize,
        zoomBackoff,
        use3d,
        new Matrix4(modelMatrices[i]),
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
      if (target[2] > initialTargetZ) {
        // eslint-disable-next-line prefer-destructuring
        initialTargetZ = target[2];
        initialZoom = newViewStateZoom;
      } else {
        initialTargetZ = null;
      }
    }
  } else if (!useRaster && (
    (obsSegmentationsType === 'polygon' && obsSegmentations)
    || (!obsSegmentations && obsCentroids) // For backwards compatibility (diamond case).
  )) {
    let xExtent;
    let yExtent;
    let xRange;
    let yRange;
    if (obsCentroids) {
      xExtent = extent(obsCentroids.data[0]);
      yExtent = extent(obsCentroids.data[1]);
      xRange = xExtent[1] - xExtent[0];
      yRange = yExtent[1] - yExtent[0];
    }
    if (!obsCentroids || xRange === 0) {
      // The fall back is the cells' polygon coordinates, if the original range
      // is 0 i.e the centroids are all on the same axis.
      xExtent = extent(obsSegmentations.data, poly => poly[0][0]);
      xRange = xExtent[1] - xExtent[0];
    }
    if (!obsCentroids || yRange === 0) {
      // The fall back is the first cells' polygon coordinates, if the original range
      // is 0 i.e the centroids are all on the same axis.
      yExtent = extent(obsSegmentations.data, poly => poly[0][1]);
      yRange = yExtent[1] - yExtent[0];
    }
    initialTargetX = xExtent[0] + xRange / 2;
    initialTargetY = yExtent[0] + yRange / 2;
    initialTargetZ = null;
    initialZoom = Math.log2(Math.min(width / xRange, height / yRange)) - zoomBackoff;
  } else {
    return {
      initialTargetX: null, initialTargetY: null, initialTargetZ: null, initialZoom: null,
    };
  }
  return {
    initialTargetX, initialTargetY, initialZoom, initialTargetZ,
  };
}

/**
 * Make a subtitle for the spatial component.
 * @param {object} data PixelSource | PixelSource[]
 * @returns {Array} [Layer, PixelSource | PixelSource[]] tuple.
 */
export function getLayerLoaderTuple(data, use3d) {
  const loader = ((Array.isArray(data) && data.length > 1) || !Array.isArray(data))
    ? data : data[0];
  if (use3d) {
    return [viv.VolumeLayer, Array.isArray(loader) ? loader : [loader]];
  }
  const Layer = (Array.isArray(data) && data.length > 1)
    ? viv.MultiscaleImageLayer
    : viv.ImageLayer;
  return [Layer, loader];
}

export function renderSubBitmaskLayers(props) {
  const {
    bbox: {
      left, top, right, bottom,
    },
    index: { x, y, z },
  } = props.tile;
  const {
    data, id, loader,
  } = props;
  // Only render in positive coorinate system
  if ([left, bottom, right, top].some(v => v < 0) || !data) {
    return null;
  }
  const base = loader[0];
  const [height, width] = loader[0].shape.slice(-2);
  // Tiles are exactly fitted to have height and width such that their bounds
  // match that of the actual image (not some padded version).
  // Thus the right/bottom given by deck.gl are incorrect since
  // they assume tiles are of uniform sizes, which is not the case for us.
  const bounds = [
    left,
    data.height < base.tileSize ? height : bottom,
    data.width < base.tileSize ? width : right,
    top,
  ];
  return new BitmaskLayer(props, {
    channelData: data,
    // Uncomment to help debugging - shades the tile being hovered over.
    // autoHighlight: true,
    // highlightColor: [80, 80, 80, 50],
    // Shared props with BitmapLayer:
    bounds,
    id: `sub-layer-${bounds}-${id}`,
    tileId: { x, y, z },
  });
}

export const HOVER_MODE = {
  CELL_LAYER: 'cell_layer_hover',
  MOLECULE_LAYER: 'molecule_layer_hover',
};
