import React from 'react';
import { COORDINATE_SYSTEM } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import {
  SETS_DATATYPE_CELL,
  HIERARCHICAL_SCHEMAS,
} from './sets/constants';
import { PRIMARY_CARD } from './classNames';

export function makeCellStatusMessage(cellInfoFactors) {
  return Object.entries(cellInfoFactors).map(
    ([factor, value]) => `${factor}: ${value}`,
  ).join('; ');
}

export function cellLayerDefaultProps(cells, updateStatus, setCellHighlight, setComponentHover) {
  return {
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    data: cells,
    pickable: true,
    autoHighlight: true,
    stroked: true,
    filled: true,
    getElevation: 0,
    onHover: (info) => {
      // Notify the parent component that its child component is
      // the "hover source".
      if (setComponentHover) {
        setComponentHover();
      }
      if (info.object) {
        const [cellId, cellInfo] = info.object;
        const { factors = {} } = cellInfo;
        if (updateStatus) {
          updateStatus(makeCellStatusMessage(factors));
        }
        if (setCellHighlight) {
          setCellHighlight(cellId);
        }
      } else if (setCellHighlight) {
        // Clear the currently-hovered cell info by passing null.
        setCellHighlight('');
      }
    },
  };
}

export const DEFAULT_DARK_COLOR = [50, 50, 50];
export const DEFAULT_LIGHT_COLOR = [200, 200, 200];

export function getDefaultColor(theme) {
  return theme === 'dark' ? DEFAULT_DARK_COLOR : DEFAULT_LIGHT_COLOR;
}

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

export function createDefaultUpdateTracksHover(componentName) {
  return hoverInfo => console.warn(`${componentName} updateTracksHover: ${hoverInfo}`);
}

export function createDefaultUpdateViewInfo(componentName) {
  return viewInfo => console.warn(`${componentName} updateViewInfo: ${viewInfo}`);
}

export function createDefaultClearPleaseWait() {
  return () => {};
}


/**
 * Copy a typed array into a new array buffer.
 * @param {Uint8Array} arr The typed array to be copied.
 * @returns {Uint8Array} The copied array.
 */
export function copyUint8Array(arr) {
  const newBuffer = new ArrayBuffer(arr.buffer.byteLength);
  const newArr = new Uint8Array(newBuffer);
  newArr.set(arr);
  return newArr;
}

export function getNextNumberedNodeName(nodes, prefix) {
  let i = 1;
  if (nodes) {
    // eslint-disable-next-line no-loop-func
    while (nodes.find(n => n.name === `${prefix}${i}`)) {
      // eslint-disable-next-line no-plusplus
      i++;
    }
  }
  return `${prefix}${i}`;
}

/**
 * Create a new selected cell set based on a cell selection.
 * @param {string[]} cellSelection An array of cell IDs.
 * @param {object[]} additionalCellSets The previous array of user-defined cell sets.
 * @param {function} setCellSetSelection The setter function for cell set selections.
 * @param {function} setAdditionalCellSets The setter function for user-defined cell sets.
 */
export function setCellSelection(cellSelection, additionalCellSets, cellSetColor, setCellSetSelection, setAdditionalCellSets, setCellSetColor, setCellColorEncoding, prefix = 'Selection ') {
  const CELL_SELECTIONS_LEVEL_ZERO_NAME = 'My Selections';

  const selectionsLevelZeroNode = additionalCellSets?.tree.find(
    n => n.name === CELL_SELECTIONS_LEVEL_ZERO_NAME,
  );
  const nextAdditionalCellSets = {
    version: HIERARCHICAL_SCHEMAS[SETS_DATATYPE_CELL].latestVersion,
    datatype: SETS_DATATYPE_CELL,
    tree: [...(additionalCellSets ? additionalCellSets.tree : [])],
  };

  const nextName = getNextNumberedNodeName(selectionsLevelZeroNode?.children, prefix);
  let colorIndex = 0;
  if (selectionsLevelZeroNode) {
    colorIndex = selectionsLevelZeroNode.children.length;
    selectionsLevelZeroNode.children.push({
      name: nextName,
      set: cellSelection.map(d => [d, null]),
    });
  } else {
    nextAdditionalCellSets.tree.push({
      name: CELL_SELECTIONS_LEVEL_ZERO_NAME,
      children: [
        {
          name: nextName,
          set: cellSelection.map(d => [d, null]),
        },
      ],
    });
  }
  setAdditionalCellSets(nextAdditionalCellSets);
  const nextPath = ['My Selections', nextName];
  setCellSetColor([
    ...(cellSetColor || []),
    {
      path: nextPath,
      color: PALETTE[colorIndex % PALETTE.length],
    },
  ]);
  setCellSetSelection([nextPath]);
  setCellColorEncoding('cellSetSelection');
}

export function mergeCellSets(cellSets, additionalCellSets) {
  return {
    version: HIERARCHICAL_SCHEMAS[SETS_DATATYPE_CELL].latestVersion,
    datatype: SETS_DATATYPE_CELL,
    tree: [
      ...(cellSets ? cellSets.tree : []),
      ...(additionalCellSets ? additionalCellSets.tree : []),
    ],
  };
}

export function createWarningComponent(props) {
  return () => {
    const {
      title,
      message,
    } = props;
    return (
      <div className={PRIMARY_CARD}>
        <h1>{title}</h1>
        <div>{message}</div>
      </div>
    );
  };
}

export function asEsModule(component) {
  return {
    __esModule: true,
    default: component,
  };
}


export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const getStatsForResolution = (loader, resolution) => {
  const { shape, labels } = loader[resolution];
  const height = shape[labels.indexOf('y')];
  const width = shape[labels.indexOf('x')];
  const depth = shape[labels.indexOf('z')];
  // eslint-disable-next-line no-bitwise
  const depthDownsampled = Math.max(1, depth >> resolution);
  // Check memory allocation limits for Float32Array (used in XR3DLayer for rendering)
  const totalBytes = 4 * height * width * depthDownsampled;
  return {
    height, width, depthDownsampled, totalBytes,
  };
};

export const canLoadResolution = (loader, resolution) => {
  const {
    totalBytes, height, width, depthDownsampled,
  } = getStatsForResolution(
    loader,
    resolution,
  );
  const maxHeapSize = window.performance?.memory
    && window.performance?.memory?.jsHeapSizeLimit / 2;
  const maxSize = maxHeapSize || (2 ** 31) - 1;
  // 2048 is a normal texture size limit although some browsers go larger.
  return (
    totalBytes < maxSize
    && height <= 2048
    && depthDownsampled <= 2048
    && width <= 2048
    && depthDownsampled > 1
  );
};
