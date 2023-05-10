import tinycolor from 'tinycolor2';
import { isEqual } from 'lodash-es';
import { PALETTE } from '@vitessce/utils';
import {
  SETS_DATATYPE_OBS,
  HIERARCHICAL_SCHEMAS,
} from './constants.js';

/**
 * Execute a callback function based on a keypress event.
 * @param {object} event The event from onKeyPress
 * @param {string} key The key identifier to match.
 * @param {Function} callback The function to execute.
 */
export function callbackOnKeyPress(event, key, callback) {
  if (event.key === key) {
    event.preventDefault();
    callback();
  }
}

/**
 * Convert an array of [r, g, b] numbers to a hex color.
 * @param {number[]} rgbArray The color [r, g, b] array.
 * @returns {string} The hex color as a string.
 */
export function colorArrayToString(rgbArray) {
  return tinycolor({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }).toHexString();
}

/**
 * Convert a string color representation to an array of [r,g,b].
 * @param {string} colorString The color as a string.
 * @returns {number[]} The color as an array.
 */
export function colorStringToArray(colorString) {
  const colorObj = tinycolor(colorString).toRgb();
  return [colorObj.r, colorObj.g, colorObj.b];
}

/**
 * Get a string of help text for coloring a particular hierarchy level.
 * @param {integer} i The level. 1 for cluster, 2 for subcluster, etc.
 * @returns {string} The tooltip text for coloring the level.
 */
export function getLevelTooltipText(i) {
  if (i === 0) return 'Color by hierarchy';
  if (i <= 2) {
    const subs = j => ('sub'.repeat(j));
    return `Color by ${subs(i - 1)}cluster`;
  }
  return `Color by cluster level ${i}`;
}

export function isEqualOrPrefix(targetPath, testPath) {
  if (targetPath.length <= testPath.length) {
    return isEqual(targetPath, testPath.slice(0, targetPath.length));
  }
  return false;
}

export function tryRenamePath(targetPath, testPath, nextTargetPath) {
  if (isEqualOrPrefix(targetPath, testPath)) {
    return [...nextTargetPath, ...testPath.slice(nextTargetPath.length)];
  }
  return testPath;
}

export const PATH_SEP = '___';

export function pathToKey(path) {
  return path.join(PATH_SEP);
}

// Moved from src/components/utils.js

export function getNextNumberedNodeName(nodes, prefix, suffix) {
  let i = 1;
  if (nodes) {
    // eslint-disable-next-line no-loop-func
    while (nodes.find(n => n.name.includes(`${prefix}${i}`))) {
      // eslint-disable-next-line no-plusplus
      i++;
    }
  }
  return `${prefix}${i}${suffix}`;
}

/**
 * Create a new selected cell set based on a cell selection.
 * @param {string[]} cellSelection An array of cell IDs.
 * @param {object[]} additionalCellSets The previous array of user-defined cell sets.
 * @param {function} setCellSetSelection The setter function for cell set selections.
 * @param {function} setAdditionalCellSets The setter function for user-defined cell sets.
 */
export function setObsSelection(cellSelection, additionalCellSets, cellSetColor, setCellSetSelection, setAdditionalCellSets, setCellSetColor, setCellColorEncoding, prefix = 'Selection ', suffix = '') {
  const CELL_SELECTIONS_LEVEL_ZERO_NAME = 'My Selections';

  const selectionsLevelZeroNode = additionalCellSets?.tree.find(
    n => n.name === CELL_SELECTIONS_LEVEL_ZERO_NAME,
  );
  const nextAdditionalCellSets = {
    version: HIERARCHICAL_SCHEMAS.latestVersion,
    datatype: SETS_DATATYPE_OBS,
    tree: [...(additionalCellSets ? additionalCellSets.tree : [])],
  };

  const nextName = getNextNumberedNodeName(selectionsLevelZeroNode?.children, prefix, suffix);

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

export function mergeObsSets(cellSets, additionalCellSets) {
  return {
    version: HIERARCHICAL_SCHEMAS.latestVersion,
    datatype: SETS_DATATYPE_OBS,
    tree: [
      ...(cellSets ? cellSets.tree : []),
      ...(additionalCellSets ? additionalCellSets.tree : []),
    ],
  };
}

export function getObsInfoFromDataWithinRange(range, data) {
  const [lowerBound, upperBound] = range;

  const cellIds = data
    .filter(item => item.value >= lowerBound && item.value <= upperBound)
    .map(item => item.cellId);

  return cellIds;
}
