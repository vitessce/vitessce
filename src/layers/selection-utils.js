import { COORDINATE_SYSTEM } from 'deck.gl';
import SelectionLayer from './SelectionLayer';

/**
 * Convert a DeckGL layer ID to a "base" layer ID for selection.
 * @param {string} layerId The layer ID to convert.
 * @returns {string} The base layer ID.
 */
function getBaseLayerId(layerId) {
  return `base-${layerId}`;
}

/**
 * Convert a DeckGL layer ID to a "selected" layer ID for selection.
 * @param {string} layerId The layer ID to convert.
 * @returns {string} The base layer ID.
 */
function getSelectedLayerId(layerId) {
  return `selected-${layerId}`;
}

/**
 * Construct DeckGL selection layers.
 * @param {string} tool
 * @param {number} zoom
 * @param {string} cellBaseLayerId
 * @param {function} getCellCoords
 * @param {function} updateCellsSelection
 * @returns {object[]} The array of DeckGL selection layers.
 */
export function getSelectionLayers(
  tool,
  zoom,
  layerId,
  getCellCoords,
  updateCellsSelection,
  cellsQuadTree,
  flipY = false,
) {
  if (!tool) {
    return [];
  }

  const cellBaseLayerId = getBaseLayerId(layerId);
  const editHandlePointRadius = 5 / (zoom + 16);

  return [new SelectionLayer({
    id: 'selection',
    flipY,
    cellsQuadTree,
    getCellCoords,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    selectionType: tool,
    onSelect: ({ pickingInfos }) => {
      const cellIds = pickingInfos.map(cellObj => cellObj[0]);
      if (updateCellsSelection) {
        updateCellsSelection(cellIds);
      }
    },
    layerIds: [cellBaseLayerId],
    getTentativeFillColor: () => [255, 255, 255, 95],
    getTentativeLineColor: () => [143, 143, 143, 255],
    getTentativeLineDashArray: () => [7, 4],
    lineWidthMinPixels: 2,
    lineWidthMaxPixels: 2,
    getEditHandlePointColor: () => [0xff, 0xff, 0xff, 0xff],
    getEditHandlePointRadius: () => editHandlePointRadius,
    editHandlePointRadiusScale: 1,
    editHandlePointRadiusMinPixels: editHandlePointRadius,
    editHandlePointRadiusMaxPixels: 2 * editHandlePointRadius,
  })];
}

/**
 * Using a color function and a theme name, return a function
 * that mixes a cell color with a theme background color.
 * Reference: https://github.com/bgrins/TinyColor/blob/80f7225029c428c0de0757f7d98ac15f497bee57/tinycolor.js#L701
 * @param {function} colorFunction Returns a color given a cell.
 * @param {number[]} backgroundColor The scatterplot or spatial background color.
 * @returns {function} Returns a color given a cell.
 */
function mixFunction(colorFunction, backgroundColor) {
  const p = 0.5;
  return (cell) => {
    const rgb = colorFunction(cell);
    return [
      ((backgroundColor[0] - rgb[0]) * p) + rgb[0],
      ((backgroundColor[1] - rgb[1]) * p) + rgb[1],
      ((backgroundColor[2] - rgb[2]) * p) + rgb[2],
    ];
  };
}

/**
 * Get deck.gl layer props for selection overlays.
 * @param {object} props
 * @returns {object} Object with two properties,
 * overlay: overlayProps, base: baseProps,
 * where the values are deck.gl layer props.
 */
export function overlayBaseProps(props) {
  const {
    id, backgroundColor, getColor, data, isSelected, ...rest
  } = props;
  return {
    overlay: {
      id: getSelectedLayerId(id),
      getFillColor: getColor,
      getLineColor: getColor,
      data: data.filter(isSelected),
      ...rest,
    },
    base: {
      id: getBaseLayerId(id),
      getLineColor: mixFunction(getColor, backgroundColor),
      getFillColor: mixFunction(getColor, backgroundColor),
      // Alternatively: contrast outlines with solids:
      // getLineColor: getColor,
      // getFillColor: [255,255,255],
      data: data.slice(),
      ...rest,
    },
  };
}
