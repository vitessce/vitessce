/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import uuidv4 from 'uuid/v4';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import intersection from 'lodash/intersection';
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
 * If the following variable is true, the expand node interaction
 * will also update the array of visible nodes
 * (see the `treeOnExpand` function).
 */
const UPDATE_VISIBLE_ON_EXPAND = false;

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
 * Avoids switch statements.
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
 * Set the ._state.isForTools value for a node.
 * @param {object} currNode A node object.
 * @param {boolean} v The value.
 * @returns {object} The updated node.
 */
function nodeSetIsForTools(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isForTools: v,
    },
  };
}

/**
 * Set the ._state.isEditing value for a node.
 * @param {object} currNode A node object.
 * @param {boolean} v The value.
 * @returns {object} The updated node.
 */
function nodeSetIsEditing(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isEditing: v,
    },
  };
}

/**
 * Set the ._state.isCurrent value for a node.
 * @param {object} currNode A node object.
 * @param {boolean} v The value.
 * @returns {object} The updated node.
 */
function nodeSetIsCurrent(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isCurrent: v,
    },
  };
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
 * Set the name for a node.
 * @param {object} currNode A node object.
 * @param {string} newName The name value.
 * @returns {object} The updated node.
 */
function nodeSetName(currNode, newName) {
  return {
    ...currNode,
    name: newName,
  };
}

/**
 * Set the set associated with a node.
 * @param {object} currNode A node object.
 * @param {array} newSet The set value, as an array.
 * @returns {object} The updated node.
 */
function nodeSetSet(currNode, newSet) {
  return {
    ...currNode,
    set: newSet,
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
 * Set the color for a node.
 * @param {object} currNode A node object.
 * @param {number[]} newColor The color as an [r, g, b] array.
 * @returns {object} The updated node.
 */
function nodeSetColor(currNode, newColor) {
  return {
    ...currNode,
    color: newColor,
  };
}

/**
 * Initialize the ._state property for a node object.
 * @param {object} currNode A node object,
 * potentially with an undefined ._state property.
 * @param {number} level The level for the node. By default, 0.
 * @param {object} stateOverrides Pre-defined state values to use. Optional.
 * @param {boolean} useDefaultColor Should a default color be used if none is provided?
 * @returns {object} The node object, with a filled-in ._state property.
 */
function nodeWithState(currNode, level = 0, stateOverrides = {}, useDefaultColor = true) {
  const nodeKey = generateKey();
  return {
    name: currNode.name,
    color: (level > 0
      ? currNode.color || (useDefaultColor ? DEFAULT_COLOR : undefined)
      : undefined),
    ...(currNode.children ? {
      children: currNode.children.map(childNode => nodeWithState(
        childNode,
        level + 1,
        stateOverrides,
        useDefaultColor,
      )),
    } : {
      set: (currNode.set || []),
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

/**
 * Append a level zero node child.
 * @param {object} currTree A tree object.
 * @param {object} node A node object.
 * @returns {object} The updated tree.
 */
function treeAppendChild(currTree, node) {
  return {
    ...currTree,
    tree: [...currTree.tree, node],
  };
}

/**
 * Append multiple level zero node children.
 * @param {object} currTree A tree object.
 * @param {object} node A node object.
 * @returns {object} The updated tree.
 */
function treeAppendChildren(currTree, nodes) {
  return {
    ...currTree,
    tree: [...currTree.tree, ...nodes],
  };
}

/**
 * Set the .items array associated with a tree,
 * used when computing the complement operation.
 * @param {object} currTree A tree object.
 * @param {array} cellIds The set of all cell IDs that the tree
 * should know about.
 * @returns {object} The updated tree.
 */
function treeSetItems(currTree, cellIds) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      items: cellIds,
    },
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
 * Find a node object that matches a predicate function.
 * @param {object} node A node object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @returns {object|null} A node object matching the predicate, or null if none is found.
 */
function nodeFindNodePath(node, predicate, path) {
  if (predicate(node)) {
    return path;
  }
  if (!node.children) {
    return null;
  }
  const foundNodes = node.children
    .map(child => nodeFindNodePath(child, predicate, [...path, child]))
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
function treeFindNodePath(currTree, predicate) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNodePath(levelZeroNode, predicate, [levelZeroNode]))
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
function treeFindNodePathByKey(currTree, targetKey) {
  return treeFindNodePath(currTree, n => (n._state.key === targetKey));
}

/**
 * Find the level zero node flagged as .isForTools,
 * i.e. new sets created by the lasso/rectangle selection tools
 * should be placed as children of this node.
 * @param {object} node A node object.
 * @returns {object|null} A matching level zero node object, or null if none is found.
 */
function nodeFindIsForToolsNode(node) {
  return nodeFindNode(
    node,
    n => (n._state.level === 0 && n._state.isForTools),
  );
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
function treeFindNodeByNamePath(currTree, targetNamePath) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNodeByNamePath(levelZeroNode, targetNamePath, 0))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

/**
 * Find the parent of a child node, using the child node's key.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the child node.
 * @returns {object|null} A matching parent node object, or null if none is found.
 */
function treeFindNodeParentByKey(currTree, targetKey) {
  return treeFindNode(
    currTree,
    n => n.children && n.children.map(c => c._state.key).includes(targetKey),
  );
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
 * Add a new level zero node, with the ._state.isForTools flag
 * set to true.
 * @param {object} currTree A tree object.
 * @returns {object} The updated tree.
 */
function treeAddForToolsNode(currTree) {
  const newNode = nodeWithState({
    name: 'My Selections',
    children: [],
  }, 0);
  const newForToolsNode = nodeSetIsForTools(newNode, true);
  return treeAppendChild(currTree, newForToolsNode);
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
 * Find a parent node of interest that matches an ancestorPredicate function.
 * If that parent node contains a descendant that matches the descendantPredicate function,
 * then use the transform function to transform the child node.
 * If that parent node does _not_ contain any descendant that matches the descendantPredicate
 * function, then append the provided descendant node as a new child of the parent node of interest.
 * @param {object} node A node object.
 * @param {function} ancestorPredicate Returns true for the ancestor node of interest.
 * @param {function} descendantPredicate Returns true for the descendant node of interest.
 * @param {function} transform The function used to transform the descendant node, if it is found.
 * @param {object} descendant The child node to append, if no node matching the descendantPredicate
 * function is found.
 * @returns {object} The updated node.
 */
function nodeTransformChildOrAppendChild(node,
  ancestorPredicate, descendantPredicate, transform, descendant) {
  if (node.children && ancestorPredicate(node)) {
    if (node.children.some(descendantPredicate)) {
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

/**
 * Check whether a new potential node name already exists in the node
 * or its descendants.
 * @param {object} node A tree node.
 * @param {string[]} potentialNamePath The new name to check.
 * @param {number} currLevelIndex The level of the path currently
 * being checked.
 * @param {string} fromKey A key to ignore (never creates conflict). Optional.
 * @returns {boolean} Returns true if there are conflicts, false otherwise.
 */
function nodeCheckNamePathConflicts(node, potentialNamePath, currLevelIndex, fromKey = null) {
  if (fromKey !== null && node._state.key === fromKey) {
    return false;
  }
  const potentialNodeName = potentialNamePath[currLevelIndex];
  if (node.name === potentialNodeName) {
    if (currLevelIndex === potentialNamePath.length - 1) {
      return true;
    }
    if (node.children) {
      const childrenHaveConflicts = node.children
        .map(child => nodeCheckNamePathConflicts(
          child, potentialNamePath, currLevelIndex + 1, fromKey,
        ));
      return childrenHaveConflicts.some(x => x);
    }
  }
  return false;
}

/**
 * Check whether a new potential node name already exists in the tree.
 * @param {object} currTree A tree object.
 * @param {string[]} potentialNamePath The new name to check.
 * @param {string} fromKey A key to ignore (never creates conflict). Optional.
 * @returns {boolean} Returns true if there are conflicts, false otherwise.
 */
function treeCheckNamePathConflicts(currTree, potentialNamePath, fromKey = null) {
  const levelZeroNodesHaveConflicts = currTree.tree
    .map(levelZeroNode => nodeCheckNamePathConflicts(levelZeroNode, potentialNamePath, 0, fromKey));
  return levelZeroNodesHaveConflicts.some(x => x);
}

/**
 * Set the set associated with the node flagged as ._state.isCurrent,
 * under the level zero node flagged as ._state.isForTools.
 * If no .isForTools level zero node exists, then this function will add one.
 * If no .isCurrent node exists under the .isForTools node,
 * then this function will add one.
 * @param {object} currTree A tree object.
 * @param {array} cellIds The new set value.
 * @param {string} name The name for the .isCurrent node. Optional.
 * By default, 'Current selection'.
 * @returns {object} The updated tree.
 */
function treeSetCurrentSet(currTree, cellIds, potentialName = CURRENT_SELECTION_NAME) {
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

  const numToolsNodeChildren = toolsNode.children.length;
  const nextCurrentSetColor = PALETTE[numToolsNodeChildren % PALETTE.length];

  const cellIdsWithProb = cellIds.map(cellId => ([cellId, null]));

  const nameParts = [potentialName, 1];
  while (treeCheckNamePathConflicts(currTree, [toolsNode.name, nameParts.join(' ')])) {
    // eslint-disable-next-line no-plusplus
    nameParts[1]++;
  }
  const name = nameParts.join(' ');

  newTree = {
    ...newTree,
    tree: newTree.tree.map(levelZeroNode => nodeTransformChildOrAppendChild(
      levelZeroNode,
      node => (node._state.isForTools && node._state.level === 0),
      node => (node._state.isCurrent && node._state.level === 1),
      node => nodeSetName(nodeSetSet(node, cellIdsWithProb), name),
      nodeWithState(
        { name, set: cellIdsWithProb, color: nextCurrentSetColor },
        1, { isCurrent: true },
      ),
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
 * Set a node's color, relative to the tree.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node of interest.
 * @param {number[]} color The color as an [r, g, b] array.
 * @returns {object} The updated tree.
 */
function treeNodeSetColor(currTree, targetKey, color) {
  return treeTransformNodeByKey(
    currTree,
    targetKey,
    node => nodeSetColor(node, color),
  );
}

/**
 * Set a node's name, relative to the tree.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node of interest.
 * @param {string} name The new name to set for the node.
 * @param {boolean} stopEditing Should the ._state.isEditing flag
 * also be set to false?
 * @returns {object} The updated tree.
 */
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
 * Set a node's ._state.isEditing flag, relative to the tree.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node of interest.
 * @param {boolean} value The value.
 * @returns {object} The updated tree.
 */
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
 * Set a particular level of the tree as "checked".
 * @param {object} currTree A tree object.
 * @param {string} levelZeroKey The key of the level zero node of interest.
 * @param {number} levelIndex The index of the level of interest.
 * @returns {object} The updated tree.
 */
function treeOnCheckLevel(currTree, levelZeroKey, levelIndex) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedLevel: { levelZeroKey, levelIndex },
    },
  };
}

/**
 * Get an array representing the union of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the union of the sets of checked nodes.
 */
function treeToUnion(currTree) {
  const { checkedKeys } = currTree._state;
  const nodes = checkedKeys.map(key => treeFindNodeByKey(currTree, key));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => a.concat(h.filter(hEl => !a.includes(hEl))), nodeSets[0] || []);
}

/**
 * Get an array representing the intersection of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the intersection of the sets of checked nodes.
 */
function treeToIntersection(currTree) {
  const { checkedKeys } = currTree._state;
  const nodes = checkedKeys.map(key => treeFindNodeByKey(currTree, key));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => h.filter(hEl => a.includes(hEl)), nodeSets[0] || []);
}

/**
 * Get an array of all possible set values.
 * Necessary to be able to perform complement operations.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing all possible set values.
 */
function treeToItems(currTree) {
  return currTree._state.items || [];
}

/**
 * Get an array representing the complement of the union of the sets of checked nodes.
 * @param {object} currTree
 * @returns {array} An array representing the complement of the
 * union of the sets of checked nodes.
 */
function treeToComplement(currTree) {
  const primaryUnion = treeToUnion(currTree);
  const items = treeToItems(currTree);
  return items.filter(el => !primaryUnion.includes(el));
}

function treeClearCheckedKeys(currTree) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedKeys: [],
    },
  };
}

/**
 * Perform the union set operation, updating the current set.
 * TODO: Decide whether this function should also clear the array of "checked" nodes,
 * from a usability perspective.
 * @param {object} currTree
 * @returns {object} The updated tree.
 */
function treeOnUnion(currTree) {
  const checkedUnion = treeToUnion(currTree);
  const newTree = treeSetCurrentSet(currTree, checkedUnion, CURRENT_UNION_NAME);
  return treeClearCheckedKeys(newTree);
}

/**
 * Perform the intersection set operation, updating the current set.
 * TODO: Decide whether this function should also clear the array of "checked" nodes,
 * from a usability perspective.
 * @param {object} currTree
 * @returns {object} The updated tree.
 */
function treeOnIntersection(currTree) {
  const checkedIntersection = treeToIntersection(currTree);
  const newTree = treeSetCurrentSet(currTree, checkedIntersection, CURRENT_INTERSECTION_NAME);
  return treeClearCheckedKeys(newTree);
}

/**
 * Perform the complement set operation, updating the current set.
 * TODO: Decide whether this function should also clear the array of "checked" nodes,
 * from a usability perspective.
 * @param {object} currTree
 * @returns {object} The updated tree.
 */
function treeOnComplement(currTree) {
  const checkedComplement = treeToComplement(currTree);
  const newTree = treeSetCurrentSet(currTree, checkedComplement, CURRENT_COMPLEMENT_NAME);
  return treeClearCheckedKeys(newTree);
}

/**
 * Get a list of keys corresponding to all descendant nodes
 * of the tree that are collapsed _or_ are leaf nodes.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node of interest.
 * @returns {string[]} The keys of all descendant nodes that are not
 * currently expanded or are leaf nodes.
 */
function treeNodeGetClosedDescendants(currTree, targetKey) {
  const node = treeFindNodeByKey(currTree, targetKey);
  if (node._state.isLeaf || !currTree._state.expandedKeys.includes(targetKey)) {
    return [targetKey];
  }
  return node.children
    .flatMap(c => treeNodeGetClosedDescendants(currTree, c._state.key));
}

/**
 * Respond to a node expand or collapse interaction.
 * @param {object} currTree A tree object.
 * @param {string[]} expandedKeys The keys of all nodes that should be expanded
 * after the interaction.
 * @param {string} targetKey The key of the node targeted by the expand interaction.
 * @param {boolean} expanded Was it expanded (true) or collapsed (false)?
 * @returns {object} The updated tree.
 */
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

  // See description of the UPDATE_VISIBLE_ON_EXPAND constant at the top of this file.
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

/**
 * Get an flattened array of descendants.
 * @param {object} node A node object.
 * @returns {object[]} An array of descendants.
 */
function nodeToDescendantsFlat(node) {
  if (!node.children) {
    return [];
  }
  return [
    ...node.children,
    ...node.children.flatMap(c => nodeToDescendantsFlat(c)),
  ];
}

/**
 * Get all ancestors of a node.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node of interestt.
 * @returns {object[]} The ancestor nodes.
 */
function treeFindNodeAncestorsByKey(currTree, targetKey) {
  const ancestors = [];
  let curr = treeFindNodeParentByKey(currTree, targetKey);
  do {
    ancestors.push(curr);
    curr = treeFindNodeParentByKey(currTree, curr._state.key);
  } while (curr);
  return ancestors.filter(Boolean);
}

/**
 * Respond to a node checkbox interaction (check or un-check).
 * @param {object} currTree A tree object.
 * @param {string} targetKey The target of the check or un-check interaction.
 * @param {boolean} checked Is this a check (true) or uncheck (false) interaction?
 * @returns {object} The updated tree.
 */
function treeOnCheckNode(currTree, targetKey, checked) {
  const currCheckedKeys = currTree._state.checkedKeys;
  // Add or remove the target node's key from the tree's list of checked keys.
  const node = treeFindNodeByKey(currTree, targetKey);
  const nodeAndDescendantsFlat = [node, ...nodeToDescendantsFlat(node)];
  const targetKeys = nodeAndDescendantsFlat.map(n => n._state.key);
  let newCheckedKeys;
  if (checked) {
    // The target node was checked.
    newCheckedKeys = Array.from(new Set([...currCheckedKeys, ...targetKeys]));
  } else {
    // The target node was un-checked.
    newCheckedKeys = currCheckedKeys.filter(k => !targetKeys.includes(k));
    // Filter out all ancestor keys if un-checking.
    const ancestorKeys = treeFindNodeAncestorsByKey(currTree, targetKey)
      .map(n => n._state.key);
    newCheckedKeys = newCheckedKeys.filter(k => !ancestorKeys.includes(k));
  }
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedKeys: newCheckedKeys,
      isChecking: true,
    },
  };
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

/**
 * Set the array of nodes whose sets should currently be visible.
 * @param {object} currTree A tree object.
 * @param {string[]} visibleKeys The keys of nodes to set as visible.
 * @param {boolean} shouldInvalidateCheckedLevel Should the checkedLevel state be
 * reset? By default, true.
 * @returns {object} The updated tree.
 */
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

/**
 * Get an flattened array of leaf nodes.
 * @param {object} node A node object.
 * @returns {object[]} An array of leaf nodes.
 */
function nodeToLeavesFlat(node) {
  if (!node.children) {
    return [node];
  }
  return node.children.flatMap(c => nodeToLeavesFlat(c));
}

/**
 * Copy the currently-checked keys to the currently-visible keys.
 * @param {object} currTree A tree object.
 * @returns {object} The updated tree.
 */
function treeSetVisibleKeysToCheckedKeys(currTree) {
  // TODO: figure out how to alert the user if their checked sets intersect
  // or span across multiple level zero nodes.

  // If any checkedKeys correspond to levelZero nodes,
  // replace with the keys of all descendants
  // (this is beacuse we do not want level zero nodes to be check-able,
  // but rc-tree will roll all descendants up and replace with the ancestor
  // if all of the ancestor's descendants are checked).
  let newVisibleKeys = currTree._state.checkedKeys;
  newVisibleKeys = newVisibleKeys.flatMap((k) => {
    const node = treeFindNodeByKey(currTree, k);
    if (node._state.level === 0) {
      return nodeToLeavesFlat(node).map(n => n._state.key);
    }
    return [k];
  });

  return treeSetVisibleKeys(currTree, newVisibleKeys);
}

/**
 * View a closed/leaf node, or view an open node's closed/leaf descendants.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node targeted by the interaction.
 * @returns {object} The updated tree.
 */
function treeNodeView(currTree, targetKey) {
  // If the targetKey is an open node, then use the colors
  // of the closed and leaf descendants.
  // If the targetKey is a closed node, then use the one color
  // associated with that node.
  const visibleKeys = treeNodeGetClosedDescendants(currTree, targetKey);
  return treeSetVisibleKeys(currTree, visibleKeys);
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
export function nodeToLevelDescendantsFlat(node, level, stopEarly = false) {
  if (!node.children) {
    if (!stopEarly) {
      return [];
    }
    return [node];
  }
  if (level === 0) {
    return node.children;
  }
  return node.children.flatMap(c => nodeToLevelDescendantsFlat(c, level - 1, stopEarly));
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
    return [...prevPath, node.name];
  }
  if (level === 0) {
    return node.children.map(n => ([...prevPath, n.name]));
  }
  return node.children
    .flatMap(c => nodeToLevelDescendantNamePaths(c, level - 1, [...prevPath, node.name], stopEarly))
    .filter(Boolean);
}

/**
 * View a node's descendants at a particular level relative to the target node's level.
 * @param {object} currTree A tree object.
 * @param {string} targetKey The key of the node targeted by the interaction.
 * @param {number} level The level of interest, relative to the target node.
 * @param {boolean} shouldInvalidateCheckedLevel Should the checkedLevel state be
 * reset? By default, true.
 * @returns {object} The updated tree.
 */
function treeNodeViewDescendants(
  currTree, targetKey, level, shouldInvalidateCheckedLevel = true,
) {
  const node = treeFindNodeByKey(currTree, targetKey);
  const descendantKeys = nodeToLevelDescendantsFlat(node, level, true)
    .map(d => d._state.key);
  return treeSetVisibleKeys(currTree, descendantKeys, shouldInvalidateCheckedLevel);
}

/**
 * Create and append a new level zero node to the tree.
 * @param {object} currTree A tree object.
 * @returns {object} The updated tree.
 */
function treeCreateLevelZeroNode(currTree) {
  const newLevelZeroNode = nodeWithState({
    name: NEW_HIERARCHY_NAME,
    children: [],
  }, 0, { isEditing: true });
  return treeAppendChild(currTree, newLevelZeroNode);
}

/**
 * Return whether it makes sense to show a "view checked sets"
 * button.
 * @param {object} currTree A tree object.
 * @returns {boolean} Does it make sense?
 */
export function treeHasCheckedSetsToView(currTree) {
  return currTree && currTree._state && currTree._state.checkedKeys.length > 0;
}

/**
 * Return whether it makes sense to show a "complement checked sets"
 * button.
 * @param {object} currTree A tree object.
 * @returns {boolean} Does it make sense?
 */
export function treeHasCheckedSetsToComplement(currTree) {
  return (
    currTree
    && currTree._state
    && currTree._state.checkedKeys.length > 0
    && treeToComplement(currTree).length > 0
  );
}

/**
 * Return whether it makes sense to show a "intersect checked sets"
 * button.
 * @param {object} currTree A tree object.
 * @returns {boolean} Does it make sense?
 */
export function treeHasCheckedSetsToIntersect(currTree) {
  return (
    currTree
    && currTree._state
    && currTree._state.checkedKeys.length > 1
    && treeToIntersection(currTree).length > 0
  );
}

/**
 * Return whether it makes sense to show a "union checked sets"
 * button.
 * @param {object} currTree A tree object.
 * @returns {boolean} Does it make sense?
 */
export function treeHasCheckedSetsToUnion(currTree) {
  return (
    currTree
    && currTree._state
    && currTree._state.checkedKeys.length > 1
    && treeToUnion(currTree).length > 0
  );
}

/**
 * Import an array of level zero nodes by filling in
 * with state and appending to the current tree.
 * @param {object} currTree A tree object.
 * @param {object[]} levelZeroNodes Array of level zero nodes to append.
 * @param {boolean} readOnly Should the imported nodes be read-only or read-write?
 * @returns {object} The tree with the new level nodes appended.
 */
export function treeImport(currTree, levelZeroNodes, readOnly = true) {
  if (!levelZeroNodes || levelZeroNodes.length === 0) {
    return currTree;
  }
  let newChildren = levelZeroNodes.map(child => nodeWithState(child, 0, {}, false));

  // Set colors of new nodes.
  newChildren = newChildren.map((child) => {
    const height = nodeToHeight(child);
    let newChild = child;
    range(height).forEach((level) => {
      const descendantKeys = nodeToLevelDescendantsFlat(child, level)
        .map(d => d._state.key);
      descendantKeys.forEach((descendantKey, i) => {
        newChild = nodeTransform(
          newChild,
          n => n._state.key === descendantKey,
          n => nodeSetColor(n, n.color || PALETTE[i % PALETTE.length]),
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
 * @param {object} currTree A tree object.
 * @returns {object} Tree object with tree and node state removed.
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
 * @param {object} currTree A tree object.
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
 * @param {object} currTree A tree object.
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { setToExport, nodeName } The set as an array.
 */
export function treeExportSet(currTree, nodeKey) {
  const node = treeFindNodeByKey(currTree, nodeKey);
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
export function treeToVisibleCells(currTree) {
  let cellColorsArray = [];
  currTree._state.visibleKeys.forEach((setKey) => {
    const node = treeFindNodeByKey(currTree, setKey);
    if (node) {
      const nodeSet = nodeToSet(node);
      cellColorsArray = [
        ...cellColorsArray,
        ...nodeSet.map(([cellId, prob]) => [
          cellId,
          (isNil(prob) ? node.color : colorMixWithUncertainty(node.color, prob)),
        ]),
      ];
    }
  });
  const cellIds = cellColorsArray.map(c => c[0]);
  const cellColors = new Map(cellColorsArray);
  return [cellIds, cellColors];
}

/**
 * Given a tree with state, get the cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToCellColorsBySetNames(currTree, selectedNamePaths) {
  let cellColorsArray = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      cellColorsArray = [
        ...cellColorsArray,
        ...nodeSet.map(([cellId, prob]) => [
          cellId,
          (isNil(prob) ? node.color : colorMixWithUncertainty(node.color, prob)),
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
export function treeToSetSizesBySetNames(currTree, selectedNamePaths) {
  const sizes = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      sizes.push({
        key: node._state.key,
        name: node.name,
        size: nodeSet.length,
        color: node.color,
      });
    }
  });
  return sizes;
}

export function initializeSets(rawData) {
  const setsType = rawData.datatype;
  const initialTree = treeInitialize(setsType);
  return treeImport(initialTree, rawData.tree);
}

export function treeToSetNamesByKeys(currTree, keys) {
  const namePaths = [];
  keys.forEach((setKey) => {
    const nodePath = treeFindNodePathByKey(currTree, setKey);
    if (nodePath) {
      const namePath = nodePath.map(node => node.name);
      namePaths.push(namePath);
    }
  });
  return namePaths;
}

export function treeToVisibleSetNames(currTree) {
  return treeToSetNamesByKeys(currTree, currTree._state.visibleKeys);
}

/**
 *
 * @param {object} currTree
 * @param {string} potentialNewName The potential new name for the node.
 * @param {string} nodeKey The unique key of the node to check.
 */
export function treeCheckNameConflictsByKey(currTree, potentialNewName, nodeKey) {
  const namePath = treeFindNodePathByKey(currTree, nodeKey).map(node => node.name);
  namePath.pop();
  return treeCheckNamePathConflicts(currTree, [...namePath, potentialNewName], nodeKey);
}

export function treeToExpectedCheckedLevel(currTree, visibleNamePaths) {
  let result = null;
  if (currTree) {
    currTree.tree.forEach((lzn) => {
      const levelZeroPath = [lzn.name];
      const height = nodeToHeight(lzn);
      range(height).forEach((i) => {
        const levelIndex = i + 1;
        const levelNodePaths = nodeToLevelDescendantNamePaths(lzn, levelIndex - 1, [], true);
        if (isEqual(levelNodePaths, visibleNamePaths)) {
          result = { levelZeroPath, levelIndex };
        }
      });
    });
  }
  return result;
}

export function treeToCheckedLevel(currTree) {
  if (currTree) {
    return currTree._state.checkedLevel;
  }
  return null;
}


/**
 * Constants for reducer action type strings.
 */
export const ACTION = Object.freeze({
  SET: 'set',
  IMPORT: 'import',
  SET_TREE_ITEMS: 'setTreeItems',
  SET_CURRENT_SET: 'setCurrentSet',
  EXPAND_NODE: 'expandNode',
  CHECK_NODE: 'checkNode',
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
  [ACTION.SET]: (state, action) => action.tree,
  [ACTION.IMPORT]: (state, action) => treeImport(
    state,
    action.levelZeroNodes,
  ),
  [ACTION.SET_TREE_ITEMS]: (state, action) => treeSetItems(
    state,
    action.cellIds,
  ),
  [ACTION.SET_CURRENT_SET]: (state, action) => {
    return treeSetCurrentSet(
      state,
      action.cellIds,
    );
  },
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
      action.checked,
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
