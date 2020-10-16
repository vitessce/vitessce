/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import uuidv4 from 'uuid/v4';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import range from 'lodash/range';
import { DEFAULT_COLOR, PALETTE } from '../utils';
import {
  HIERARCHICAL_SCHEMAS,
} from './constants';

// Constants.
const CURRENT_SELECTION_NAME = 'Selection';
const CURRENT_UNION_NAME = 'Union';
const CURRENT_INTERSECTION_NAME = 'Intersection';
const CURRENT_COMPLEMENT_NAME = 'Complement';
const NEW_HIERARCHY_NAME = 'New hierarchy';

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
 * Set the ._state.level value for a node.
 * @param {object} currNode A node object.
 * @param {number} newLevel The level value.
 * @returns {object} The updated node.
 */
function nodeSetLevel(currNode, newLevel) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      level: newLevel,
    },
  };
}

/**
 * Append a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
function nodeAppendChild(currNode, newChild) {
  const newChildWithLevel = nodeSetLevel(newChild, currNode._state.level + 1);
  return {
    ...currNode,
    children: [...currNode.children, newChildWithLevel],
  };
}

/**
 * Prepend a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
function nodePrependChild(currNode, newChild) {
  const newChildWithLevel = nodeSetLevel(newChild, currNode._state.level + 1);
  return {
    ...currNode,
    children: [newChildWithLevel, ...currNode.children],
  };
}

/**
 * Insert a child to a parent node.
 * @param {object} currNode A node object.
 * @param {*} newChild The child node object.
 * @param {*} insertIndex The index at which to insert the child.
 * @returns {object} The updated node.
 */
function nodeInsertChild(currNode, newChild, insertIndex) {
  const newChildWithLevel = nodeSetLevel(newChild, currNode._state.level + 1);
  const newChildren = Array.from(currNode.children);
  newChildren.splice(insertIndex, 0, newChildWithLevel);
  return {
    ...currNode,
    children: newChildren,
  };
}



/**
 * Find a node object that matches a predicate function.
 * @param {object} node A node object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @returns {object|null} A node object matching the predicate, or null if none is found.
 */
function nodeFindNode(node, predicate) {
  if (predicate(node)) {
    return node;
  }
  if (!node.children) {
    return null;
  }
  const foundNodes = node.children
    .map(child => nodeFindNode(child, predicate))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}


/**
 * Find a node matching a predicate function, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
function treeFindNode(currTree, predicate) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNode(levelZeroNode, predicate))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

/**
 * Find a node with a matching key, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key for the node of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
function treeFindNodeByKey(currTree, targetKey) {
  return treeFindNode(currTree, n => (n._state.key === targetKey));
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
 * Find a node with a matching name path, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {string[]} targetNamePath The name path for the node of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
function treeFindNodeParentByNamePath(currTree, targetNamePath) {
  const parentNamePath = [...targetNamePath];
  parentNamePath.pop();
  return treeFindNodeByNamePath(currTree, parentNamePath);
}



/**
 * Find the level zero node of a descendant node, using the descendant node's key.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the descendant node.
 * @returns {object|null} A matching level zero node object, or null if none is found.
 */
function treeFindLevelZeroNodeByDescendantKey(currTree, targetKey) {
  const predicate = n => (n._state.key === targetKey);
  const foundNodes = currTree.tree
    .map(levelZeroNode => (nodeFindNode(levelZeroNode, predicate)
      ? levelZeroNode
      : null))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

/**
 * Remove a node or any node descendants that match a predicate.
 * Recursive.
 * @param {object} node A node object.
 * @param {function} predicate Predicate function, returns true if the node should be removed.
 * @returns {object|null} The updated node, or null if the node matches the predicate.
 */
function nodeRemove(node, predicate) {
  if (predicate(node)) {
    return null;
  }
  if (node.children) {
    return {
      ...node,
      children: node.children
        .map(child => nodeRemove(child, predicate))
        .filter(Boolean),
    };
  }
  return node;
}

/**
 * Remove any node matching a predicate, relative to the tree.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node to remove.
 * @param {boolean} temporary Is this a temporary removal,
 * i.e. will the calling function ensure that the node will be added
 * back into the tree afterwards (for example, when dragging and dropping)?
 * By default, false.
 * @returns {object} The updated tree.
 */
function treeNodeRemove(currTree, targetKey, temporary = false) {
  const nodeToRemove = treeFindNodeByKey(currTree, targetKey);
  const levelZeroNode = treeFindLevelZeroNodeByDescendantKey(currTree, targetKey);

  const shouldClearCheckedLevel = (
    (currTree._state.checkedLevel.levelZeroKey === nodeToRemove._state.key)
    || (currTree._state.checkedLevel.levelZeroKey === levelZeroNode._state.key
      && currTree._state.checkedLevel.levelIndex === nodeToRemove._state.level));

  return {
    ...currTree,
    tree: currTree.tree
      .map(node => nodeRemove(node, n => n._state.key === targetKey))
      .filter(Boolean),
    _state: {
      ...currTree._state,
      checkedKeys: (temporary
        ? currTree._state.checkedKeys
        : currTree._state.checkedKeys.filter(k => k !== targetKey)),
      visibleKeys: (temporary
        ? currTree._state.checkedKeys
        : currTree._state.visibleKeys.filter(k => k !== targetKey)),
      checkedLevel: (
        !temporary && shouldClearCheckedLevel
          ? { levelZeroKey: null, levelIndex: null }
          : currTree._state.checkedLevel
      ),
    },
  };
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
 * Transform a node of interest, relative to the tree.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key for the node of interest.
 * @param {function} transform Takes the node of interest as input,
 * returns a transformed version of the node.
 * @returns {object} The updated tree.
 */
function treeTransformNodeByKey(currTree, targetKey, transform) {
  return {
    ...currTree,
    tree: currTree.tree
      .map(node => nodeTransform(
        node,
        n => (n._state.key === targetKey),
        transform,
      )),
  };
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
 * Respond to a node drag-and-drop interaction.
 * @param {object} currTree A tree object.
 * @param {string} dropKey The key of the node that the dragged node was dropped
 * onto or beside.
 * @param {string} dragKey The key of the node that was dragged.
 * @param {number} dropPosition The index at which to insert the dragged node,
 * if it was dropped beside the drop node.
 * @param {boolean} dropToGap Was the dragged node dropped onto the drop node?
 * @returns {object} The updated tree.
 */
/* TODO: re-implement using node paths rather than keys.
function treeOnDropNode(currTree, dropKey, dragKey, dropPosition, dropToGap) {
  // Get drop node.
  const dropNode = treeFindNodeByKey(currTree, dropKey);
  const dropNodeLevel = dropNode._state.level;
  const dropNodeIsLevelZero = dropNodeLevel === 0;
  const dropNodeIsLevelZeroEmpty = (dropNodeIsLevelZero && (
    !dropNode.children || dropNode.children.length === 0));
  const dropNodeHeight = nodeToHeight(dropNode);
  // Get drag node.
  const dragNode = treeFindNodeByKey(currTree, dragKey);
  const dragNodeHeight = nodeToHeight(dragNode);

  // Only allow dragging if:
  // - dropping between nodes, and both drag and drop node have same height, OR
  // - dropping the dragNode into the dropNode,
  //   where the dragNode has one less level than the dropNode.
  // - dropping the dragNode into the dropNode,
  //   where the dropNode is an _empty_ level zero node.
  const isAllowed = (dropToGap && dropNodeHeight === dragNodeHeight)
   || (!dropToGap && dropNodeHeight - 1 === dragNodeHeight) || dropNodeIsLevelZeroEmpty;

  if (!isAllowed) {
    return currTree;
  }

  let dropParentNode;
  let dropParentKey;
  let dropNodeCurrIndex;

  if (!dropNodeIsLevelZero) {
    dropParentNode = treeFindNodeParentByKey(currTree, dropKey);
    dropParentKey = dropParentNode._state.key;
    dropNodeCurrIndex = dropParentNode.children.findIndex(c => c._state.key === dropKey);
  } else {
    dropNodeCurrIndex = currTree.tree.findIndex(lzn => lzn._state.key === dropKey);
  }

  // Further, only allow dragging if the dragged node will have a unique
  // name among its new siblings.
  let hasSiblingNameConflict;
  const dragNodeName = dragNode.name;
  if (!dropNodeIsLevelZero) {
    hasSiblingNameConflict = dropParentNode.children
      .find(c => c.name === dragNodeName && c._state.key !== dragKey);
  } else if (dropNodeIsLevelZero && !dropToGap) {
    hasSiblingNameConflict = dropNode.children
      .find(c => c.name === dragNodeName && c._state.key !== dragKey);
  } else {
    hasSiblingNameConflict = currTree.tree
      .find(lzn => lzn.name === dragNodeName && lzn._state.key !== dragKey);
  }

  if (hasSiblingNameConflict) {
    return currTree;
  }

  // Remove the dragged object from its current position.
  const newTree = treeNodeRemove(currTree, dragKey, true);

  // Update index values after temporarily removing the dragged node.
  if (!dropNodeIsLevelZero) {
    dropNodeCurrIndex = dropParentNode.children.findIndex(c => c._state.key === dropKey);
  } else {
    dropNodeCurrIndex = currTree.tree.findIndex(lzn => lzn._state.key === dropKey);
  }

  // Append the dragNode to dropNode's children if dropping _onto_ the dropNode.
  if (!dropToGap) {
    // Set dragNode as the last child of dropNode.
    return treeTransformNodeByKey(newTree, dropKey, n => nodeAppendChild(n, dragNode));
  }

  // Prepend or insert the dragNode if dropping _between_ (above or below dropNode).
  if (!dropNodeIsLevelZero) {
    // The dropNode is at a level greater than zero,
    // so it has a parent.
    if (dropPosition === -1) {
      // Set dragNode as first child of dropParentNode.
      return treeTransformNodeByKey(
        newTree,
        dropParentKey,
        n => nodePrependChild(n, dragNode),
      );
    }
    // Set dragNode before or after dropNode.
    const insertIndex = dropNodeCurrIndex + (dropPosition > dropNodeCurrIndex ? 1 : 0);
    return treeTransformNodeByKey(
      newTree,
      dropParentKey,
      n => nodeInsertChild(n, dragNode, insertIndex),
    );
  }
  // We need to drop the dragNode to level zero,
  // and level zero nodes do not have parents.
  const newDragNode = nodeSetLevel(dragNode, 0);
  if (dropPosition === -1) {
    // Set dragNode as first level zero node of the tree.
    return {
      ...newTree,
      tree: [newDragNode, ...newTree.tree],
    };
  }
  // Set dragNode before or after dropNode in level zero.
  const insertIndex = dropNodeCurrIndex + (dropPosition > dropNodeCurrIndex ? 1 : 0);
  const newLevelZero = Array.from(newTree.tree);
  newLevelZero.splice(insertIndex, 0, newDragNode);
  return {
    ...newTree,
    tree: newLevelZero,
  };
}
*/

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
    //isLeaf: !node.children,
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
      const nodeColor = cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color || DEFAULT_COLOR;
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
