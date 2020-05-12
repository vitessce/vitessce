/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import uuidv4 from 'uuid/v4';
import some from 'lodash/some';
import intersection from 'lodash/intersection';
import range from 'lodash/range';
import { version } from '../../../package.json';
import { DEFAULT_COLOR, PALETTE, fromEntries } from '../utils';

// Constants
const CURRENT_SET_NAME = 'Current selection';
const UPDATE_VISIBLE_ON_EXPAND = false;
const ALLOW_SIDE_EFFECTS = true;

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
  return Math.max(...childrenHeights, 0);
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

function nodeSetIsChecking(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isChecking: v,
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
  return {
    ...currNode,
    children: [...currNode.children, newChild],
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
    color: currNode.color || DEFAULT_COLOR,
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
      isChecking: false,
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
  return nodeFindNode(node, n => (n._state.level === 0 && n._state.isForTools));
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

function treeFindLevelZeroNodeByDescendantKey(currTree, targetKey) {
  const predicate = n => (n._state.key === targetKey);
  const foundNodes = currTree.tree
    .map(levelZeroNode => (nodeFindNode(levelZeroNode, predicate) ? levelZeroNode : null))
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
      children: node.children.map(child => nodeRemove(child, predicate)).filter(Boolean),
    };
  }
  return node;
}

function treeNodeRemove(currTree, targetKey) {
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
      checkedKeys: currTree._state.checkedKeys.filter(k => k !== targetKey),
      visibleKeys: currTree._state.visibleKeys.filter(k => k !== targetKey),
      checkedLevel: (
        shouldClearCheckedLevel
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

function nodeTransformDescendants(node, transform) {
  if (!node.children) {
    return transform(node);
  }
  const newNode = transform(node);
  return {
    ...newNode,
    children: newNode.children.map(child => nodeTransformDescendants(child, transform)),
  };
}

function nodeTransformChildOrAppendChild(node,
  ancestorPredicate, descendantPredicate, transform, descendant) {
  if (node.children && ancestorPredicate(node)) {
    if (some(node.children.map(descendantPredicate))) {
      return {
        ...node,
        children: node.children.map(child => nodeTransform(child, descendantPredicate, transform)),
      };
    }
    return nodeAppendChild(node, descendant);
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(child => nodeTransformChildOrAppendChild(
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

function treeSetCurrentSet(currTree, cellIds) {
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
      node => nodeSetSet(node, cellIds),
      nodeWithState({ name: CURRENT_SET_NAME, set: cellIds }, 1, { isCurrent: true }),
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

function treeNodeGetClosedDescendants(currTree, targetKey) {
  const node = treeFindNodeByKey(currTree, targetKey);
  if (node._state.isLeaf || !currTree._state.expandedKeys.includes(targetKey)) {
    return [targetKey];
  }
  return node.children.flatMap(c => treeNodeGetClosedDescendants(currTree, c._state.key));
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
    },
  };
}

function treeOnCheckNode(currTree, targetKey) {
  const currCheckedKeys = currTree._state.checkedKeys;
  let newCheckedKeys;
  if (currCheckedKeys.includes(targetKey)) {
    newCheckedKeys = currCheckedKeys.filter(k => k !== targetKey);
  } else {
    newCheckedKeys = [...currCheckedKeys, targetKey];
  }
  const newTree = treeOnCheckNodes(currTree, newCheckedKeys);

  // Set .isChecking on all nodes within this level zero node.
  const levelZeroNode = treeFindLevelZeroNodeByDescendantKey(newTree, targetKey);
  const newLevelZeroNode = nodeTransformDescendants(
    levelZeroNode,
    n => nodeSetIsChecking(n, true),
  );

  return {
    ...newTree,
    tree: newTree.tree.map(n => (
      n._state.key === levelZeroNode._state.key ? newLevelZeroNode : n
    )),
  };
}

// eslint-disable-next-line no-unused-vars
function treeOnDropNode(currTree, dropKey, dragKey, dropPosition, dropToGap) {
  // TODO: re-implement dragRearrange function
  return currTree;
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

function treeNodeViewDescendants(currTree, targetKey, level, shouldInvalidateCheckedLevel = true) {
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
    tree: currTree.map(node => nodeClearState(node)),
    _state: undefined,
  };
}

/**
 * Get an empty tree, with a default tree state.
 * @param {string} datatype
 * @returns {object} Empty tree.
 */
export function treeInitialize(datatype) {
  const treeKey = generateKey();
  return {
    version,
    datatype,
    tree: [],
    _state: {
      key: treeKey,
      items: (ALLOW_SIDE_EFFECTS ? true : []),
      checkedKeys: [],
      visibleKeys: [],
      checkedLevel: { levelZeroKey: null, levelIndex: null },
      expandedKeys: [], // used by ant-tree
      autoExpandParent: true, // used by ant-tree
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
    isChecking: node._state.isChecking,
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
  REMOVE_NODE: 'removeNode',
  VIEW_NODE: 'viewNode',
  VIEW_NODE_DESCENDANTS: 'viewNodeDescendants',
  CREATE_LEVEL_ZERO_NODE: 'createLevelZeroNode',
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
  [ACTION.CHECK_NODE]: (state, action) => treeOnCheckNode(
    state,
    action.targetKey,
  ),
  [ACTION.CHECK_NODES]: (state, action) => treeOnCheckNodes(
    state,
    action.checkedKeys,
  ),
  [ACTION.CHECK_LEVEL]: (state, action) => {
    const newTree = treeOnCheckLevel(state, action.levelZeroKey, action.levelIndex);
    return treeNodeViewDescendants(newTree, action.levelZeroKey, action.levelIndex - 1, false);
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
  [ACTION.CREATE_LEVEL_ZERO_NODE]: (state) => treeCreateLevelZeroNode(
    state
  ),
});

export default reducer;
