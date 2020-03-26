import { COORDINATE_SYSTEM } from 'deck.gl';
import { interpolatePlasma } from 'd3-scale-chromatic';

export function makeCellStatusMessage(cellInfoFactors) {
  return Object.entries(cellInfoFactors).map(
    ([factor, value]) => `${factor}: ${value}`,
  ).join('; ');
}

export function cellLayerDefaultProps(cells, updateStatus, updateCellsHover, uuid) {
  return {
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    data: cells,
    pickable: true,
    autoHighlight: true,
    stroked: true,
    filled: true,
    getElevation: 0,
    getLineWidth: 0,
    onHover: (info) => {
      if (info.object) {
        const [cellId, cellInfo] = info.object;
        const { factors = {}, xy, mappings = {} } = cellInfo;
        updateStatus(makeCellStatusMessage(factors));
        updateCellsHover({
          cellId,
          mappings: { xy, ...mappings },
          uuid,
          factors,
        });
      } else {
        // Clear the currently-hovered cell info by passing null.
        updateCellsHover(null);
      }
    },
  };
}

export const DEFAULT_COLOR = [128, 128, 128];

// From http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12#type=qualitative&scheme=Paired&n=12
export const PALETTE = [
  [166, 206, 227],
  [31, 120, 180],
  [178, 223, 138],
  [51, 160, 44],
  [251, 154, 153],
  [227, 26, 28],
  [253, 191, 111],
  [255, 127, 0],
  [202, 178, 214],
  [106, 61, 154],
  [255, 255, 153],
  [177, 89, 40],
];


export function rgb(hexString) {
  return [
    parseInt(hexString.slice(1, 3), 16),
    parseInt(hexString.slice(3, 5), 16),
    parseInt(hexString.slice(5, 7), 16),
  ];
}

export function interpolateColors(zeroToOne) {
  // The lowest 25% does not have good contrast.
  return rgb((interpolatePlasma(zeroToOne / 0.75 + 0.25)));
}

// Adapted from https://github.com/feross/fromentries/blob/29b52a850bb3a47c390937631c2638edf3443942/index.js
export function fromEntries(iterable) {
  return [...iterable]
    .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {});
}
