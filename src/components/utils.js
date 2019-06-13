import { COORDINATE_SYSTEM } from 'deck.gl';
import { interpolatePlasma } from 'd3-scale-chromatic';

export function cellLayerDefaultProps(cells, updateStatus, updateCellsHover, uuid) {
  return {
    coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
    data: Object.entries(cells),
    pickable: true,
    autoHighlight: true,
    stroked: true,
    filled: true,
    getElevation: 0,
    getLineWidth: 0,
    onHover: (info) => {
      if (info.object) {
        updateStatus(
          Object.entries(info.object[1].factors).map(
            ([factor, value]) => `${factor}: ${value}`,
          ).join('; '),
        );
        updateCellsHover({
          cellId: info.object[0],
          x: info.x,
          y: info.y,
          mappings: { xy: info.object[1].xy, ...info.object[1].mappings },
          uuid,
          status: Object.entries(info.object[1].factors).map(
            ([factor, value]) => `${factor}: ${value}`,
          ).join('; '),
        });
      } else {
        // Clear the currently-hovered cell info by passing null
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
