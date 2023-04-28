/* eslint-disable no-restricted-globals */
// Cannot import from @vitessce/sets-utils due to JSON.
// import { treeToCellColorsBySetNames } from '@vitessce/sets-utils';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';

/**
 * Get the set associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {array} The array representing the set associated with the node.
 */
export function nodeToSet(currNode) {
  if (!currNode) {
    return [];
  }
  if (!currNode.children) {
    return (currNode.set || []);
  }
  return currNode.children.flatMap(c => nodeToSet(c));
}


/**
 * Find a node with a matching name path, relative to a particular node.
 * @param {object} node A node object.
 * @param {string[]} path The name path for the node of interest.
 * @param {number} currLevelIndex The index of the current hierarchy level.
 * @returns {object|null} A matching node object, or null if none is found.
 */
function nodeFindNodeByNamePath(node, path, currLevelIndex) {
  const currNodeName = path[currLevelIndex];
  if (node.name === currNodeName) {
    if (currLevelIndex === path.length - 1) {
      return node;
    }
    if (node.children) {
      const foundNodes = node.children
        .map(child => nodeFindNodeByNamePath(child, path, currLevelIndex + 1))
        .filter(Boolean);
      if (foundNodes.length === 1) {
        return foundNodes[0];
      }
    }
  }
  return null;
}

/**
 * Find a node with a matching name path, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {string[]} targetNamePath The name path for the node of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
export function treeFindNodeByNamePath(currTree, targetNamePath) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNodeByNamePath(levelZeroNode, targetNamePath, 0))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

/**
 * Using a color and a probability, mix the color with an "uncertainty" color,
 * for example, gray.
 * Reference: https://github.com/bgrins/TinyColor/blob/80f7225029c428c0de0757f7d98ac15f497bee57/tinycolor.js#L701
 * @param {number[]} originalColor The color assignment for the class.
 * @param {number} p The mixing amount, or level certainty in the originalColor classification,
 * between 0 and 1.
 * @param {number[]} mixingColor The color with which to mix. By default, [128, 128, 128] gray.
 * @returns {number[]} Returns the color after mixing.
 */
function colorMixWithUncertainty(originalColor, p, mixingColor = [128, 128, 128]) {
  return [
    ((originalColor[0] - mixingColor[0]) * p) + mixingColor[0],
    ((originalColor[1] - mixingColor[1]) * p) + mixingColor[1],
    ((originalColor[2] - mixingColor[2]) * p) + mixingColor[2],
  ];
}

/**
 * Given a tree with state, get the cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 *  @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} cellSetColor Array of objects with the
 * properties `path` and `color`.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToCellColorsBySetNames(
  currTree, selectedNamePaths, cellSetColor, defaultColor,
) {
  let cellColorsArray = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || defaultColor
      );
      cellColorsArray = [
        ...cellColorsArray,
        ...nodeSet.map(([cellId, prob]) => [
          cellId,
          (isNil(prob) ? nodeColor : colorMixWithUncertainty(nodeColor, prob)),
        ]),
      ];
    }
  });
  return new Map(cellColorsArray);
}


/**
 * Map a gene expression matrix onto multiple square array tiles,
 * taking into account the ordering/selection of cells.
 * @param {object} params
 * @param {string} params.curr The current task uuid.
 * @param {Map} params.cellColors
 * @param {ArrayBuffer} params.data The array buffer.
 * Need to transfer back to main thread when done.
 * @returns {array} [message, transfers]
 */
function getColors({
  curr,
  cellSetSelection,
  cellSets,
  cellSetColor,
  defaultColor,
  data,
}) {
  let cellColors = new Map();
  if (cellSetSelection && cellSets && cellSetColor && defaultColor) {
    // Cell sets can potentially lack set colors since the color property
    // is not a required part of the schema.
    // The `initializeSets` function fills in any empty colors
    // with defaults and returns the processed tree object.
    cellColors = treeToCellColorsBySetNames(
      cellSets, cellSetSelection, cellSetColor, defaultColor,
    );
  }
  // TODO: always fill the entire array with the default color,
  // to clear any previous color settings.
  const { size } = cellColors;
  if (typeof size === 'number') {
    const cellIds = cellColors.keys();
    const view = new Uint8Array(data);
    /*
    // TODO: do this in the main thread.
    data = new Uint8Array(color.height * color.width * 3).fill(
      defaultColor[0],
    );
    */
    // 0th cell id is the empty space of the image i.e black color.
    view[0] = 0;
    view[1] = 0;
    view[2] = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const id of cellIds) {
      if (id > 0) {
        const cellColor = cellColors.get(id);
        if (cellColor) {
          view.set(cellColor.slice(0, 3), Number(id) * 3);
        }
      }
    }
  }
  return [{ buffer: data, curr, cellColors }, [data]];
}

/**
 * Worker message passing logic.
 */
if (typeof self !== 'undefined') {
  const nameToFunction = {
    getColors,
  };

  self.addEventListener('message', (event) => {
    try {
      if (Array.isArray(event.data)) {
        const [name, args] = event.data;
        const [message, transfers] = nameToFunction[name](args);
        self.postMessage(message, transfers);
      }
    } catch (e) {
      console.warn(e);
    }
  });
}
