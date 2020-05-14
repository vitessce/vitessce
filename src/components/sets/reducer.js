/* eslint-disable no-underscore-dangle */
import uuidv4 from 'uuid/v4';
import some from 'lodash/some';
import intersection from 'lodash/intersection';
import range from 'lodash/range';
import { DEFAULT_COLOR, PALETTE, fromEntries } from '../utils';
import { HIERARCHICAL_SETS_SCHEMA_VERSION } from './io';

// Constants
const CURRENT_SET_NAME = 'Current selection';
const UPDATE_VISIBLE_ON_EXPAND = false;
const ALLOW_SIDE_EFFECTS = false;

// Global state variables, only used when ALLOW_SIDE_EFFECTS is true.
const globalSets = {};
const globalItems = {};

/**
 * Alias for the uuidv4 function to make code more readable.
 * @returns {string} UUID.
 */
function generateKey() {
  return uuidv4();
}

/**
* Helper function for constructing a reducer
* from an object mapping action types to handler functions.
* See https://redux.js.org/recipes/reducing-boilerplate#reducers
* @param {object} handlers Keys are action type strings, values are handler functions.
* @returns {function} The reducer function.
*/
function createReducer(handlers) {
  return function reducer(state, action) {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

function nodeToSet(node) {
  if (!node.children) {
    return (ALLOW_SIDE_EFFECTS ? globalSets[node._state.key] : (node.set || []));
  }
  return node.children.flatMap(c => nodeToSet(c));
}

function nodeToHeight(node, level = 0) {
  if (!node.children) {
    return level;
  }
  const childrenHeights = node.children.map(c => nodeToHeight(c, level + 1));
  return Math.max(...childrenHeights, 1);
}

function nodeSetIsForTools(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isForTools: v,
    },
  };
}

function nodeSetIsEditing(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isEditing: v,
    },
  };
}

function nodeSetIsCurrent(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isCurrent: v,
    },
  };
}

function nodeSetLevel(currNode, newLevel) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      level: newLevel,
    },
  };
}

function nodeSetName(currNode, newName) {
  return {
    ...currNode,
    name: newName,
  };
}

function nodeSetSet(currNode, newSet) {
  if (ALLOW_SIDE_EFFECTS) {
    globalSets[currNode._state.key] = newSet;
  }
  return {
    ...currNode,
    set: (ALLOW_SIDE_EFFECTS ? true : newSet),
  };
}

function nodeAppendChild(currNode, newChild) {
  const newChildWithLevel = nodeSetLevel(newChild, currNode._state.level + 1);
  return {
    ...currNode,
    children: [...currNode.children, newChildWithLevel],
  };
}

function nodePrependChild(currNode, newChild) {
  const newChildWithLevel = nodeSetLevel(newChild, currNode._state.level + 1);
  return {
    ...currNode,
    children: [newChildWithLevel, ...currNode.children],
  };
}

function nodeInsertChild(currNode, newChild, insertIndex) {
  const newChildWithLevel = nodeSetLevel(newChild, currNode._state.level + 1);
  const newChildren = Array.from(currNode.children);
  newChildren.splice(insertIndex, 0, newChildWithLevel);
  return {
    ...currNode,
    children: newChildren,
  };
}

function nodeSetColor(currNode, newColor) {
  return {
    ...currNode,
    color: newColor,
  };
}

function nodeWithState(currNode, level = 0, stateOverrides = {}) {
  const nodeKey = generateKey();
  if (ALLOW_SIDE_EFFECTS && !currNode.children) {
    globalSets[nodeKey] = currNode.set || [];
  }
  return {
    name: currNode.name,
    color: (level > 0 ? currNode.color || DEFAULT_COLOR : undefined),
    ...(currNode.children ? {
      children: currNode.children.map(childNode => nodeWithState(
        childNode,
        level + 1,
        stateOverrides,
      )),
    } : {
      set: (ALLOW_SIDE_EFFECTS ? true : (currNode.set || [])),
    }),
    _state: {
      key: nodeKey,
      level,
      isEditing: false,
      isCurrent: false,
      isForTools: false,
      ...stateOverrides,
    },
  };
}

function treeAppendChild(currTree, node) {
  return {
    ...currTree,
    tree: [...currTree.tree, node],
  };
}


function treeAppendChildren(currTree, nodes) {
  return {
    ...currTree,
    tree: [...currTree.tree, ...nodes],
  };
}

function treeSetItems(currTree, cellIds) {
  if (ALLOW_SIDE_EFFECTS) {
    globalItems[currTree._state.key] = cellIds;
  }
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      items: (ALLOW_SIDE_EFFECTS ? true : cellIds),
    },
  };
}

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

function nodeFindIsForToolsNode(node) {
  return nodeFindNode(
    node,
    n => (n._state.level === 0 && n._state.isForTools),
  );
}

function treeFindNode(currTree, predicate) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNode(levelZeroNode, predicate))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

function treeFindNodeByKey(currTree, targetKey) {
  return treeFindNode(currTree, n => (n._state.key === targetKey));
}

function treeFindNodeParentByKey(currTree, targetKey) {
  return treeFindNode(
    currTree,
    n => n.children && n.children.map(c => c._state.key).includes(targetKey),
  );
}

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


function treeAddForToolsNode(currTree) {
  const newNode = nodeWithState({
    name: 'My Selections',
    children: [],
  }, 0);
  const newForToolsNode = nodeSetIsForTools(newNode, true);
  return treeAppendChild(currTree, newForToolsNode);
}

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

function nodeTransform(node, predicate, transform) {
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

function nodeTransformChildOrAppendChild(node,
  ancestorPredicate, descendantPredicate, transform, descendant) {
  if (node.children && ancestorPredicate(node)) {
    if (some(node.children.map(descendantPredicate))) {
      return {
        ...node,
        children: node.children
          .map(child => nodeTransform(child, descendantPredicate, transform)),
      };
    }
    return nodeAppendChild(node, descendant);
  }
  if (node.children) {
    return {
      ...node,
      children:
        node.children.map(child => nodeTransformChildOrAppendChild(
          child,
          ancestorPredicate,
          descendantPredicate,
          transform,
          descendant,
        )),
    };
  }
  return node;
}

function treeSetCurrentSet(currTree, cellIds, name = CURRENT_SET_NAME) {
  let newTree = currTree;
  let toolsNode = newTree.tree.find(nodeFindIsForToolsNode);
  if (!toolsNode) {
    newTree = treeAddForToolsNode(currTree);
    toolsNode = newTree.tree.find(nodeFindIsForToolsNode);
  }

  const currExpandedKeys = newTree._state.expandedKeys;
  const newExpandedKeys = (currExpandedKeys.includes(toolsNode._state.key)
    ? currExpandedKeys
    : [...currExpandedKeys, toolsNode._state.key]
  );

  newTree = {
    ...newTree,
    tree: newTree.tree.map(levelZeroNode => nodeTransformChildOrAppendChild(
      levelZeroNode,
      node => (node._state.isForTools && node._state.level === 0),
      node => (node._state.isCurrent && node._state.level === 1),
      node => nodeSetName(nodeSetSet(node, cellIds), name),
      nodeWithState({ name, set: cellIds }, 1, { isCurrent: true }),
    )),
  };

  const currentSetNode = treeFindNode(newTree, n => n._state.isCurrent);
  newTree = {
    ...newTree,
    _state: {
      ...newTree._state,
      visibleKeys: [currentSetNode._state.key],
      expandedKeys: newExpandedKeys,
    },
  };
  return newTree;
}

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

function treeNodeSetColor(currTree, targetKey, color) {
  return treeTransformNodeByKey(
    currTree,
    targetKey,
    node => nodeSetColor(node, color),
  );
}

function treeNodeSetName(currTree, targetKey, name, stopEditing) {
  const transformName = (node) => {
    let newNode = nodeSetName(node, name);
    if (stopEditing) {
      newNode = nodeSetIsEditing(newNode, false);
    }
    if (node._state.isCurrent) {
      newNode = nodeSetIsCurrent(newNode, false);
    }
    return newNode;
  };
  return treeTransformNodeByKey(currTree, targetKey, transformName);
}

function treeNodeSetIsEditing(currTree, targetKey, value) {
  return treeTransformNodeByKey(
    currTree,
    targetKey,
    node => nodeSetIsEditing(node, value),
  );
}


/**
 * Clear node state.
 * Recursive.
 * @param {object} currNode
 * @returns {object} Node with state removed.
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

function treeOnCheckLevel(currTree, levelZeroKey, levelIndex) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedLevel: { levelZeroKey, levelIndex },
    },
  };
}

function treeToUnion(currTree) {
  const { checkedKeys } = currTree._state;
  const nodes = checkedKeys.map(key => treeFindNodeByKey(currTree, key));
  const nodeSets = nodes.map(node => nodeToSet(node));
  return nodeSets
    .reduce((a, h) => a.concat(h.filter(hEl => !a.includes(hEl))), nodeSets[0] || []);
}

function treeToIntersection(currTree) {
  const { checkedKeys } = currTree._state;
  const nodes = checkedKeys.map(key => treeFindNodeByKey(currTree, key));
  const nodeSets = nodes.map(node => nodeToSet(node));
  return nodeSets
    .reduce((a, h) => h.filter(hEl => a.includes(hEl)), nodeSets[0] || []);
}

function treeToItems(currTree) {
  return (ALLOW_SIDE_EFFECTS
    ? globalItems[currTree._state.key]
    : currTree._state.items) || [];
}

function treeToComplement(currTree) {
  const primaryUnion = treeToUnion(currTree);
  const items = treeToItems(currTree);
  return items.filter(el => !primaryUnion.includes(el));
}

/**
 * Perform the union set operation, updating the current set.
 */
function treeOnUnion(currTree) {
  const checkedUnion = treeToUnion(currTree);
  return treeSetCurrentSet(currTree, checkedUnion, 'Current union');
}

/**
 * Perform the intersection set operation, updating the current set.
 */
function treeOnIntersection(currTree) {
  const checkedIntersection = treeToIntersection(currTree);
  return treeSetCurrentSet(currTree, checkedIntersection, 'Current intersection');
}

/**
 * Perform the complement set operation, updating the current set.
 */
function treeOnComplement(currTree) {
  const checkedComplement = treeToComplement(currTree);
  return treeSetCurrentSet(currTree, checkedComplement, 'Current complement');
}


function treeNodeGetClosedDescendants(currTree, targetKey) {
  const node = treeFindNodeByKey(currTree, targetKey);
  if (node._state.isLeaf || !currTree._state.expandedKeys.includes(targetKey)) {
    return [targetKey];
  }
  return node.children
    .flatMap(c => treeNodeGetClosedDescendants(currTree, c._state.key));
}

function treeOnExpand(currTree, expandedKeys, targetKey, expanded) {
  // Upon an expansion interaction, we always want autoExpandParent to be false
  // to allow a parent with expanded children to collapse.

  const newTree = {
    ...currTree,
    _state: {
      ...currTree._state,
      expandedKeys,
      autoExpandParent: false,
    },
  };

  if (UPDATE_VISIBLE_ON_EXPAND) {
    // When expanding a node, if it was previously visible,
    // replace its key in .visibleKeys with the keys of its closed descendants.
    // When collapsing a node, if all of its open or leaf descendants
    // were previously visible, we want to replace those keys with itself.
    const currClosedKeys = treeNodeGetClosedDescendants(currTree, targetKey);
    const newClosedKeys = treeNodeGetClosedDescendants(newTree, targetKey);

    let { visibleKeys } = currTree._state;
    const visibleKeysEqualCurrClosedKeys = (
      intersection(visibleKeys, currClosedKeys).length === currClosedKeys.length
    );
    if (expanded && visibleKeys.includes(targetKey)) {
      visibleKeys = visibleKeys.filter(k => k !== targetKey);
      visibleKeys = [...visibleKeys, ...newClosedKeys];
    } else if (!expanded && visibleKeysEqualCurrClosedKeys) {
      visibleKeys = visibleKeys.filter(k => !currClosedKeys.includes(k));
      visibleKeys = [...visibleKeys, targetKey];
    }
    return {
      ...newTree,
      _state: {
        ...newTree._state,
        visibleKeys,
      },
    };
  }
  return newTree;
}

function treeOnCheckNodes(currTree, checkedKeys) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedKeys,
      isChecking: true,
    },
  };
}

function treeOnCheckNode(currTree, targetKey) {
  const currCheckedKeys = currTree._state.checkedKeys;
  // Add or remove the target node's key from the tree's list of checked keys.
  let newCheckedKeys;
  if (currCheckedKeys.includes(targetKey)) {
    newCheckedKeys = currCheckedKeys.filter(k => k !== targetKey);
  } else {
    newCheckedKeys = [...currCheckedKeys, targetKey];
  }
  return treeOnCheckNodes(currTree, newCheckedKeys);
}

function treeOnDropNode(currTree, dropKey, dragKey, dropPosition, dropToGap) {
  // Get drop node.
  const dropNode = treeFindNodeByKey(currTree, dropKey);
  const dropNodeLevel = dropNode._state.level;
  const dropNodeIsLevelZero = dropNodeLevel === 0;
  const dropNodeIsLevelZeroEmpty = (dropNodeIsLevelZero && (
    !dropNode.children || dropNode.children.length === 0));
  const dropNodeHeight = nodeToHeight(dropNode, 0);
  // Get drag node.
  const dragNode = treeFindNodeByKey(currTree, dragKey);
  const dragNodeHeight = nodeToHeight(dragNode, 0);

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

  // Remove the dragged object from its current position.
  const newTree = treeNodeRemove(currTree, dragKey, true);

  // Update index values after deleting the child node.

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

function treeSetVisibleKeys(currTree, visibleKeys, shouldInvalidateCheckedLevel = true) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      visibleKeys,
      ...(shouldInvalidateCheckedLevel ? {
        checkedLevel: { levelZeroKey: null, levelIndex: null },
      } : {}),
    },
  };
}

function treeSetVisibleKeysToCheckedKeys(currTree) {
  // TODO: figure out how to alert the user if their checked sets intersect
  // or span across multiple level zero nodes.
  return treeSetVisibleKeys(currTree, currTree._state.checkedKeys);
}

function treeNodeView(currTree, targetKey) {
  // If the targetKey is an open node, then use the colors
  // of the closed and leaf descendants.
  // If the targetKey is a closed node, then use the one color
  // associated with that node.
  const visibleKeys = treeNodeGetClosedDescendants(currTree, targetKey);
  return treeSetVisibleKeys(currTree, visibleKeys);
}

function nodeToDescendantsFlat(node, level) {
  if (!node.children) {
    return [];
  }
  if (level === 0) {
    return node.children;
  }
  return node.children.flatMap(c => nodeToDescendantsFlat(c, level - 1));
}

function treeNodeViewDescendants(
  currTree, targetKey, level, shouldInvalidateCheckedLevel = true,
) {
  const node = treeFindNodeByKey(currTree, targetKey);
  const descendantKeys = nodeToDescendantsFlat(node, level).map(d => d._state.key);
  return treeSetVisibleKeys(currTree, descendantKeys, shouldInvalidateCheckedLevel);
}

function treeCreateLevelZeroNode(currTree) {
  const newLevelZeroNode = nodeWithState({
    name: 'New hierarchy',
    children: [],
  }, 0, { isEditing: true });
  return treeAppendChild(currTree, newLevelZeroNode);
}

/**
 * Import an array of level zero nodes by filling in
 * with state and appending to the current tree.
 * @param {object} currTree
 * @param {object[]} levelZeroNodes Array of level zero nodes to append.
 * @returns {object} The tree with the new level nodes appended.
 */
export function treeImport(currTree, levelZeroNodes) {
  if (!levelZeroNodes || levelZeroNodes.length === 0) {
    return currTree;
  }
  let newChildren = levelZeroNodes.map(child => nodeWithState(child));

  // Set colors of new nodes.
  newChildren = newChildren.map((child) => {
    const height = nodeToHeight(child);
    let newChild = child;
    range(height).forEach((level) => {
      const descendantKeys = nodeToDescendantsFlat(child, level)
        .map(d => d._state.key);
      descendantKeys.forEach((descendantKey, i) => {
        newChild = nodeTransform(
          newChild,
          n => n._state.key === descendantKey,
          n => nodeSetColor(n, PALETTE[i % PALETTE.length]),
        );
      });
    });
    return newChild;
  });

  const newTree = treeAppendChildren(currTree, newChildren);
  return newTree;
}

/**
 * Export the tree by clearing tree state and all node states.
 * @param {object} currTree
 * @returns {object} Tree with state removed.
 */
export function treeExport(currTree) {
  return {
    ...currTree,
    tree: currTree.tree.map(node => nodeClearState(node)),
    _state: undefined,
  };
}

/**
 * Export the tree by clearing tree state and all node states,
 * and filter so that only the level zero node of interest is included.
 * @param {object} currTree
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { treeToExport, nodeName }
 * Tree with one level zero node, and with state removed.
 */
export function treeExportLevelZeroNode(currTree, nodeKey) {
  const node = treeFindNodeByKey(currTree, nodeKey);
  const treeWithOneLevelZeroNode = {
    ...currTree,
    tree: currTree.tree.filter(n => n._state.key === nodeKey),
  };
  return {
    treeToExport: treeExport(treeWithOneLevelZeroNode),
    nodeName: node.name,
  };
}

/**
 * Prepare the set of a node of interest for export.
 * @param {object} currTree
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { setToExport, nodeName } The set as an array.
 */
export function treeExportSet(currTree, nodeKey) {
  const node = treeFindNodeByKey(currTree, nodeKey);
  return { setToExport: nodeToSet(node), nodeName: node.name };
}

/**
 * Get an empty tree, with a default tree state.
 * @param {string} datatype
 * @returns {object} Empty tree.
 */
export function treeInitialize(datatype) {
  const treeKey = generateKey();
  return {
    version: HIERARCHICAL_SETS_SCHEMA_VERSION,
    datatype,
    tree: [],
    _state: {
      key: treeKey,
      items: (ALLOW_SIDE_EFFECTS ? true : []),
      checkedKeys: [],
      visibleKeys: [],
      checkedLevel: { levelZeroKey: null, levelIndex: null },
      expandedKeys: [],
      autoExpandParent: true,
      // Hide checkboxes until the user has
      // clicked "Select" in a node dropdown.
      isChecking: false,
    },
  };
}

/**
 * For convenience, get an object with information required
 * to render a node as a component.
 * @param {object} node
 * @returns {object}
 */
export function nodeToRenderProps(node) {
  return {
    title: node.name,
    nodeKey: node._state.key,
    size: nodeToSet(node).length,
    color: node.color,
    level: node._state.level,
    isEditing: node._state.isEditing,
    isCurrentSet: node._state.isCurrent,
    isForTools: node._state.isForTools,
    isLeaf: !node.children,
    height: nodeToHeight(node, node._state.level),
  };
}

/**
 * Given a tree with state, get the cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {*} currTree
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToVisibleCells(currTree) {
  let cellColorsArray = [];
  currTree._state.visibleKeys.forEach((setKey) => {
    const node = treeFindNodeByKey(currTree, setKey);
    if (node) {
      const nodeSet = nodeToSet(node);
      cellColorsArray = [
        ...cellColorsArray,
        ...nodeSet.map(cellId => [cellId, node.color]),
      ];
    }
  });
  const cellIds = cellColorsArray.map(c => c[0]);
  const cellColors = fromEntries(cellColorsArray);
  return [cellIds, cellColors];
}

export const ACTION = Object.freeze({
  IMPORT: 'import',
  SET_TREE_ITEMS: 'setTreeItems',
  SET_CURRENT_SET: 'setCurrentSet',
  EXPAND_NODE: 'expandNode',
  CHECK_NODE: 'checkNode',
  CHECK_NODES: 'checkNodes',
  CHECK_LEVEL: 'checkLevel',
  DROP_NODE: 'dropNode',
  SET_NODE_COLOR: 'setNodeColor',
  SET_NODE_NAME: 'setNodeName',
  SET_NODE_IS_EDITING: 'setNodeIsEditing',
  REMOVE_NODE: 'removeNode',
  VIEW_NODE: 'viewNode',
  VIEW_NODE_DESCENDANTS: 'viewNodeDescendants',
  CREATE_LEVEL_ZERO_NODE: 'createLevelZeroNode',
  UNION_CHECKED: 'unionChecked',
  INTERSECTION_CHECKED: 'intersectionChecked',
  COMPLEMENT_CHECKED: 'complementChecked',
  VIEW_CHECKED: 'viewChecked',
});

const reducer = createReducer({
  [ACTION.IMPORT]: (state, action) => treeImport(
    state,
    action.levelZeroNodes,
  ),
  [ACTION.SET_TREE_ITEMS]: (state, action) => treeSetItems(
    state,
    action.cellIds,
  ),
  [ACTION.SET_CURRENT_SET]: (state, action) => treeSetCurrentSet(
    state,
    action.cellIds,
  ),
  [ACTION.EXPAND_NODE]: (state, action) => treeOnExpand(
    state,
    action.expandedKeys,
    action.targetKey,
    action.expanded,
  ),
  [ACTION.CHECK_NODE]: (state, action) => {
    const newTree = treeOnCheckNode(
      state,
      action.targetKey,
    );
    return treeSetVisibleKeysToCheckedKeys(newTree);
  },
  [ACTION.CHECK_NODES]: (state, action) => {
    const newTree = treeOnCheckNodes(
      state,
      action.checkedKeys,
    );
    return treeSetVisibleKeysToCheckedKeys(newTree);
  },
  [ACTION.CHECK_LEVEL]: (state, action) => {
    const newTree = treeOnCheckLevel(state, action.levelZeroKey, action.levelIndex);
    return treeNodeViewDescendants(
      newTree,
      action.levelZeroKey,
      action.levelIndex - 1,
      false,
    );
  },
  [ACTION.DROP_NODE]: (state, action) => treeOnDropNode(
    state,
    action.dropKey,
    action.dragKey,
    action.dropPosition,
    action.dropToGap,
  ),
  [ACTION.SET_NODE_COLOR]: (state, action) => treeNodeSetColor(
    state,
    action.targetKey,
    action.color,
  ),
  [ACTION.SET_NODE_NAME]: (state, action) => treeNodeSetName(
    state,
    action.targetKey,
    action.name,
    action.stopEditing,
  ),
  [ACTION.SET_NODE_IS_EDITING]: (state, action) => treeNodeSetIsEditing(
    state,
    action.targetKey,
    action.value,
  ),
  [ACTION.REMOVE_NODE]: (state, action) => treeNodeRemove(
    state,
    action.targetKey,
  ),
  [ACTION.VIEW_NODE]: (state, action) => treeNodeView(
    state,
    action.targetKey,
  ),
  [ACTION.VIEW_NODE_DESCENDANTS]: (state, action) => treeNodeViewDescendants(
    state,
    action.targetKey,
    action.level,
    action.shouldInvalidateCheckedLevel,
  ),
  [ACTION.CREATE_LEVEL_ZERO_NODE]: state => treeCreateLevelZeroNode(
    state,
  ),
  [ACTION.UNION_CHECKED]: state => treeOnUnion(state),
  [ACTION.INTERSECTION_CHECKED]: state => treeOnIntersection(state),
  [ACTION.COMPLEMENT_CHECKED]: state => treeOnComplement(state),
  [ACTION.VIEW_CHECKED]: state => treeSetVisibleKeysToCheckedKeys(state),
});

export default reducer;
