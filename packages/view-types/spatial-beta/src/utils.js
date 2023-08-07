/* eslint-disable no-plusplus */
import shortNumber from 'short-number';
import plur from 'plur';
import { Matrix4 } from 'math.gl';
import { viv, BitmaskLayerBeta as BitmaskLayer } from '@vitessce/gl';
import { DEFAULT_LAYER_TYPE_ORDERING } from '@vitessce/spatial-utils';
import { extent } from 'd3-array';
import {
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
  // TODO: obsPoints,
  obsSpots,
  obsSegmentations,
  images,
  is3dMode: use3d,
  isReady,
}) {
  let globalXMin = null;
  let globalXMax = null;
  let globalYMin = null;
  let globalYMax = null;
  let globalZMin = null;
  let globalZMax = null;
  

  // Some backoff from completely filling the screen.
  const zoomBackoff = use3d ? 1.5 : 0.1;

  Object.values(images || {}).forEach((layerData) => {
    const imageLayerLoader = layerData?.image?.instance.getData();
    const modelMatrix = layerData?.image?.instance.getModelMatrix();

    if(imageLayerLoader) {
      const viewSize = { height, width };
      const { target, zoom: newViewStateZoom } = viv.getDefaultInitialViewState(
        imageLayerLoader,
        viewSize,
        zoomBackoff,
        use3d,
        new Matrix4(modelMatrix),
      );

      const maxExtent = Math.max(width / 2**newViewStateZoom, height / 2**newViewStateZoom);
      const xMin = target[0] - maxExtent/2;
      const xMax = target[0] + maxExtent/2;
      const yMin = target[1] - maxExtent/2;
      const yMax = target[1] + maxExtent/2;
      const zMin = target[2];
      const zMax = target[2];
      globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
      globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
      globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
      globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
      globalZMin = globalZMin === null ? zMin : Math.min(globalZMin, zMin);
      globalZMax = globalZMax === null ? zMax : Math.max(globalZMax, zMax);
    }
  });

  // Segmentations
  Object.values(obsSegmentations || {}).forEach((layerData) => {
    if(layerData?.obsSegmentations && layerData?.obsSegmentationsType) {
      const { obsSegmentationsType } = layerData;
      // TODO: use obsLocations if available.
      const hasObsLocations = false;
      if (obsSegmentationsType === 'polygon') {
        if (hasObsLocations) {
          // TODO

        } else {
          // The fall back is the cells' polygon coordinates, if the original range
          // is 0 i.e the centroids are all on the same axis.
          const [xMin, xMax] = extent(layerData.obsSegmentations.data, poly => poly[0][0]);

          // The fall back is the first cells' polygon coordinates, if the original range
          // is 0 i.e the centroids are all on the same axis.
          const [yMin, yMax] = extent(layerData.obsSegmentations.data, poly => poly[0][1]);

          // TODO: support Z axis for polygon segmentations?

          globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
          globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
          globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
          globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
        }
      } else if(obsSegmentationsType === 'bitmask') {
        if (hasObsLocations) {
          // TODO
        } else {
          const imageLayerLoader = layerData?.obsSegmentations?.instance.getData();
          const modelMatrix = layerData?.obsSegmentations?.instance.getModelMatrix();
          if(imageLayerLoader) {
            const viewSize = { height, width };
            const { target, zoom: newViewStateZoom } = viv.getDefaultInitialViewState(
              imageLayerLoader,
              viewSize,
              zoomBackoff,
              use3d,
              new Matrix4(modelMatrix),
            );
            const maxExtent = Math.max(width / 2**newViewStateZoom, height / 2**newViewStateZoom);
            const xMin = target[0] - maxExtent/2;
            const xMax = target[0] + maxExtent/2;
            const yMin = target[1] - maxExtent/2;
            const yMax = target[1] + maxExtent/2;
            const zMin = target[2];
            const zMax = target[2];
            globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
            globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
            globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
            globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
            globalZMin = globalZMin === null ? zMin : Math.min(globalZMin, zMin);
            globalZMax = globalZMax === null ? zMax : Math.max(globalZMax, zMax);
          }
        }
      }
    }
  });

  // Spots
  Object.values(obsSpots || {}).forEach((layerData) => {
    if(layerData?.obsSpots) {
      const [xMin, xMax] = extent(layerData.obsSpots.data[0]);
      const [yMin, yMax] = extent(layerData.obsSpots.data[1]);
      // TODO: support Z axis for spots?

      globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
      globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
      globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
      globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
    }
  });

  if(
    !isReady
    || globalXMin === null
    || globalXMax === null
    || globalYMin === null
    || globalYMax === null
  ) {
    return {
      initialTargetX: null,
      initialTargetY: null,
      initialTargetZ: null,
      initialZoom: null,
    };
  }

  const xRange = globalXMax - globalXMin;
  const yRange = globalYMax - globalYMin;
  const zRange = globalZMax - globalZMin;

  const initialTargetX = globalXMin + xRange / 2;
  const initialTargetY = globalYMin + yRange / 2;
  const initialTargetZ = (globalZMin === null || globalZMax === null)
    ? null
    : (globalZMin + zRange / 2);
  const initialZoom = Math.log2(Math.min(width / xRange, height / yRange)) - zoomBackoff;

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
    zoom,
  } = props.tile;
  const {
    data, id, loader,
    maxZoom,
    minZoom,
    zoomOffset,
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
    // The zoom/maxZoom values are used in the computation
    // of the scale factor for the stroke width.
    zoom,
    minZoom,
    maxZoom,
    zoomOffset, // TODO: figure out if this needs to be used or not
  });
}
