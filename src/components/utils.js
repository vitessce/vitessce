import { useRef, useState, useEffect } from 'react';
// eslint-disable-next-line vitessce-rules/prevent-pubsub-import
import PubSub from 'pubsub-js';
import debounce from 'lodash/debounce';
import { COORDINATE_SYSTEM } from 'deck.gl';
import { GRID_RESIZE } from '../events';

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
        const { factors = {} } = cellInfo;
        updateStatus(makeCellStatusMessage(factors));
        updateCellsHover({
          cellId,
          uuid,
        });
      } else {
        // Clear the currently-hovered cell info by passing null.
        updateCellsHover(null);
      }
    },
  };
}

export const DEFAULT_COLOR = [128, 128, 128];

// From https://personal.sron.nl/~pault/#sec:qualitative
export const PALETTE = [
  [68, 119, 170],
  [136, 204, 238],
  [68, 170, 153],
  [17, 119, 51],
  [153, 153, 51],
  [221, 204, 119],
  [204, 102, 119],
  [136, 34, 85],
  [170, 68, 153],
];

export const VIEWER_PALETTE = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 255, 255],
  [255, 128, 0],
  [255, 0, 0],
];

// Adapted from https://github.com/feross/fromentries/blob/29b52a850bb3a47c390937631c2638edf3443942/index.js
export function fromEntries(iterable) {
  return [...iterable]
    .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {});
}

export function range(length) {
  return [...Array(length).keys()];
}

export const COLORMAP_OPTIONS = [
  'viridis',
  'greys',
  'magma',
  'jet',
  'hot',
  'bone',
  'copper',
  'summer',
  'density',
  'inferno',
];

export const DEFAULT_GL_OPTIONS = { webgl2: true };

export function createDefaultUpdateStatus(componentName) {
  return message => console.warn(`${componentName} updateStatus: ${message}`);
}

export function createDefaultUpdateCellsSelection(componentName) {
  return cellsSelection => console.warn(`${componentName} updateCellsSelection: ${cellsSelection}`);
}

export function createDefaultUpdateCellsHover(componentName) {
  return hoverInfo => console.warn(`${componentName} updateCellsHover: ${hoverInfo.cellId}`);
}

export function createDefaultUpdateGenesHover(componentName) {
  return hoverInfo => console.warn(`${componentName} updateGenesHover: ${hoverInfo.geneId}`);
}

export function createDefaultUpdateViewInfo(componentName) {
  return viewInfo => console.warn(`${componentName} updateViewInfo: ${viewInfo}`);
}

export function createDefaultClearPleaseWait(componentName) {
  return layer => console.warn(`${componentName} "clearPleaseWait" not provided; layer: ${layer}`);
}

/**
 * Custom hook, subscribes to GRID_RESIZE and window resize events.
 * @returns {array} `[width, height, containerRef]` where width and height
 * are numbers and containerRef is a React ref.
 */
export function useGridItemSize(selector = null) {
  const containerRef = useRef();

  const [height, setHeight] = useState();
  const [width, setWidth] = useState();

  useEffect(() => {
    function onResize() {
      if (!containerRef.current) return;
      const container = (selector
        ? containerRef.current.querySelector(selector)
        : containerRef.current
      );
      const containerRect = container.getBoundingClientRect();
      setHeight(containerRect.height);
      setWidth(containerRect.width);
    }
    const onResizeDebounced = debounce(onResize, 100, { trailing: true });
    const gridResizeToken = PubSub.subscribe(GRID_RESIZE, onResize);
    window.addEventListener('resize', onResizeDebounced);
    onResize();
    return () => {
      PubSub.unsubscribe(gridResizeToken);
      window.removeEventListener('resize', onResizeDebounced);
    };
  }, [selector]);

  return [width, height, containerRef];
}

export function pluralize(word, count = null) {
  return `${word}${(count === 1 ? '' : 's')}`;
}

export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
