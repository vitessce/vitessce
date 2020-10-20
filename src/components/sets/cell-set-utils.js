/* eslint-disable no-underscore-dangle */
import uuidv4 from 'uuid/v4';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import range from 'lodash/range';
import { DEFAULT_COLOR } from '../utils';
import {
  HIERARCHICAL_SCHEMAS,
} from './constants';

/**
 * Alias for the uuidv4 function to make code more readable.
 * @returns {string} UUID.
 */
function generateKey() {
  return uuidv4();
}

/**
 * Get the set associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {array} The array representing the set associated with the node.
 */
export function nodeToSet(currNode) {
  if (!currNode.children) {
    return (currNode.set || []);
  }
  return currNode.children.flatMap(c => nodeToSet(c));
}

/**
 * Get the height of a node (the number of levels to reach a leaf).
 * @param {object} currNode A node object.
 * @param {number} level The level that the height will be computed relative to. By default, 0.
 * @returns {number} The height. If the node has a .children property,
 * then the minimum value returned is 1.
 */
function nodeToHeight(currNode, level = 0) {
  if (!currNode.children) {
    return level;
  }
  const childrenHeights = currNode.children.map(c => nodeToHeight(c, level + 1));
  return Math.max(...childrenHeights, 1);
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
 * Transform a node object using a transform function.
 * @param {object} node A node object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @param {function} transform Takes the node matching the predicate as input, returns
 * a transformed version of the node.
 * @returns {object} The updated node.
 */
export function nodeTransform(node, predicate, transform) {
  if (predicate(node)) {
    return transform(node);
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(child => nodeTransform(child, predicate, transform)),
    };
  }
  return node;
}

/**
 * Clear node state.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {object} Node with state removed (for itself and all descendants).
 */
function nodeClearState(currNode) {
  return {
    ...currNode,
    children: (currNode.children
      ? currNode.children.map(nodeClearState)
      : undefined
    ),
    _state: undefined,
  };
}

/**
 * Get an array representing the union of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the union of the sets of checked nodes.
 */
export function treeToUnion(currTree, checkedPaths) {
  const nodes = checkedPaths.map(path => treeFindNodeByNamePath(currTree, path));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => a.concat(h.filter(hEl => !a.includes(hEl))), nodeSets[0] || []);
}

/**
 * Get an array representing the intersection of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the intersection of the sets of checked nodes.
 */
export function treeToIntersection(currTree, checkedPaths) {
  const nodes = checkedPaths.map(path => treeFindNodeByNamePath(currTree, path));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => h.filter(hEl => a.includes(hEl)), nodeSets[0] || []);
}

/**
 * Get an array representing the complement of the union of the sets of checked nodes.
 * @param {object} currTree
 * @returns {array} An array representing the complement of the
 * union of the sets of checked nodes.
 */
export function treeToComplement(currTree, checkedPaths, items) {
  const primaryUnion = treeToUnion(currTree, checkedPaths);
  return items.filter(el => !primaryUnion.includes(el));
}

/**
 * Get an flattened array of descendants at a particular relative
 * level of interest.
 * @param {object} node A node object.
 * @param {number} level The relative level of interest.
 * 0 for this node's children, 1 for grandchildren, etc.
 * @param {boolean} stopEarly Should a node be returned early if no children exist?
 * @returns {object[]} An array of descendants at the specified level,
 * where the level is relative to the node.
 */
export function nodeToLevelDescendantNamePaths(node, level, prevPath, stopEarly = false) {
  if (!node.children) {
    if (!stopEarly) {
      return null;
    }
    return [[...prevPath, node.name]];
  }
  if (level === 0) {
    return [[...prevPath, node.name]];
  }
  return node.children
    .flatMap(c => nodeToLevelDescendantNamePaths(c, level - 1, [...prevPath, node.name], stopEarly))
    .filter(Boolean);
}

/**
 * Return whether it makes sense to show a "complement checked sets"
 * button.
 * @param {object} currTree A tree object.
 * @returns {boolean} Does it make sense?
 */
export function treeHasCheckedSetsToComplement(currTree, checkedPaths, items) {
  return (
    currTree
    && checkedPaths
    && checkedPaths.length > 0
    && treeToComplement(currTree, checkedPaths, items).length > 0
  );
}

/**
 * Return whether it makes sense to show a "intersect checked sets"
 * button.
 * @param {object} currTree A tree object.
 * @returns {boolean} Does it make sense?
 */
export function treeHasCheckedSetsToIntersect(currTree, checkedPaths) {
  return (
    currTree
    && checkedPaths
    && checkedPaths.length > 1
    && treeToIntersection(currTree, checkedPaths).length > 0
  );
}

/**
 * Return whether it makes sense to show a "union checked sets"
 * button.
 * @param {object} currTree A tree object.
 * @returns {boolean} Does it make sense?
 */
export function treeHasCheckedSetsToUnion(currTree, checkedPaths) {
  return (
    currTree
    && checkedPaths
    && checkedPaths.length > 1
    && treeToUnion(currTree, checkedPaths).length > 0
  );
}


/**
 * Export the tree by clearing tree state and all node states.
 * @param {object} currTree A tree object.
 * @returns {object} Tree object with tree and node state removed.
 */
export function treeExport(currTree, datatype) {
  return {
    version: HIERARCHICAL_SCHEMAS[datatype].latestVersion,
    datatype,
    tree: currTree.tree.map(node => nodeClearState(node)),
    _state: undefined,
  };
}

/**
 * Export the tree by clearing tree state and all node states,
 * and filter so that only the level zero node of interest is included.
 * @param {object} currTree A tree object.
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { treeToExport, nodeName }
 * Tree with one level zero node, and with state removed.
 */
export function treeExportLevelZeroNode(currTree, nodePath, datatype) {
  const node = treeFindNodeByNamePath(currTree, nodePath);
  const treeWithOneLevelZeroNode = {
    ...currTree,
    tree: currTree.tree.filter(n => n.name === nodePath[0]),
  };
  return {
    treeToExport: treeExport(treeWithOneLevelZeroNode, datatype),
    nodeName: node.name,
  };
}

/**
 * Prepare the set of a node of interest for export.
 * @param {object} currTree A tree object.
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { setToExport, nodeName } The set as an array.
 */
export function treeExportSet(currTree, nodePath) {
  const node = treeFindNodeByNamePath(currTree, nodePath);
  return { setToExport: nodeToSet(node), nodeName: node.name };
}

/**
 * Get an empty tree, with a default tree state.
 * @param {string} datatype The type of sets that this tree contains.
 * @returns {object} Empty tree.
 */
export function treeInitialize(datatype) {
  return {
    version: HIERARCHICAL_SCHEMAS[datatype].latestVersion,
    datatype,
    tree: [],
  };
}

/**
 * For convenience, get an object with information required
 * to render a node as a component.
 * @param {object} node A node to be rendered.
 * @returns {object} An object containing properties required
 * by the TreeNode render functions.
 */
export function nodeToRenderProps(node) {
  return {
    title: node.name,
    nodeKey: node._state.nodeKey,
    path: node._state.path,
    size: node._state.size,
    color: node._state.color,
    level: node._state.level,
    isLeaf: node._state.isLeaf,

    isEditing: node._state.isEditing,
    isCurrentSet: node._state.isCurrent,
    isForTools: node._state.isForTools,
    // isLeaf: !node.children,
    height: nodeToHeight(node),
  };
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
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToCellColorsBySetNames(currTree, selectedNamePaths, cellSetColor) {
  let cellColorsArray = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || DEFAULT_COLOR
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
 * Given a tree with state, get the sizes of the
 * sets currently marked as "visible".
 * @param {object} currTree A tree object.
 * @returns {object[]} Array of objects
 * with the properties `name` and `size`.
 */
export function treeToSetSizesBySetNames(currTree, selectedNamePaths, setColor) {
  const sizes = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = setColor.find(d => isEqual(d.path, setNamePath))?.color || DEFAULT_COLOR;
      sizes.push({
        key: generateKey(),
        name: node.name,
        size: nodeSet.length,
        color: nodeColor,
      });
    }
  });
  return sizes;
}

export function treeToExpectedCheckedLevel(currTree, checkedPaths) {
  let result = null;
  if (currTree) {
    currTree.tree.forEach((lzn) => {
      const levelZeroPath = [lzn.name];
      const height = nodeToHeight(lzn);
      range(height).forEach((i) => {
        const levelIndex = i + 1;
        const levelNodePaths = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
        if (isEqual(levelNodePaths, checkedPaths)) {
          result = { levelZeroPath, levelIndex };
        }
      });
    });
  }
  return result;
}


export function treeToCheckedSetOperations(currTree, checkedPaths, items) {
  const hasCheckedSetsToUnion = treeHasCheckedSetsToUnion(currTree, checkedPaths);
  const hasCheckedSetsToIntersect = treeHasCheckedSetsToIntersect(currTree, checkedPaths);
  const hasCheckedSetsToComplement = treeHasCheckedSetsToComplement(currTree, checkedPaths, items);

  return {
    hasCheckedSetsToUnion,
    hasCheckedSetsToIntersect,
    hasCheckedSetsToComplement,
  };
}


export function treesConflict(cellSets, testCellSets) {
  const paths = [];
  const testPaths = [];
  let hasConflict = false;

  function getPaths(node, prevPath) {
    paths.push([...prevPath, node.name]);
    if (node.children) {
      node.children.forEach(c => getPaths(c, [...prevPath, node.name]));
    }
  }
  cellSets.tree.forEach(lzn => getPaths(lzn, []));

  function getTestPaths(node, prevPath) {
    testPaths.push([...prevPath, node.name]);
    if (node.children) {
      node.children.forEach(c => getPaths(c, [...prevPath, node.name]));
    }
  }
  testCellSets.tree.forEach(lzn => getTestPaths(lzn, []));

  testPaths.forEach((testPath) => {
    if (paths.find(p => isEqual(p, testPath))) {
      hasConflict = true;
    }
  });
  return hasConflict;
}
