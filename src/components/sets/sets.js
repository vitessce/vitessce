/* eslint-disable */
import uuidv4 from 'uuid/v4';
import { version } from '../../../package.json';
import { DEFAULT_COLOR, PALETTE, fromEntries } from '../utils';
import some from 'lodash/some';

const CURRENT_SET_NAME = "Current selection";

/**
 * Like .find but can return the truthy value rather than returning the element.
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The callback function, should return truthy or null.
 * @returns {any} The first return value for which callback returns true.
 */
function findValue(array, callback) {
  // eslint-disable-next-line no-restricted-syntax
  for (const el of array) {
    const callbackResult = callback(el);
    if (callbackResult) {
      return callbackResult;
    }
  }
  return null;
}

/**
 * Remove all instances of a value from an array,
 * based on the result of a test function.
 * @param {Array} array The array to iterate over.
 * @param {Function} shouldRemove The test function. Returns boolean.
 * @returns {Array} The array after removing items.
 */
function removeValue(array, shouldRemove) {
  return array.reduce((a, h) => (shouldRemove(h) ? a : [...a, h]), []);
}

function generateKey() {
  return uuidv4();
}

function nodeSetIsForTools(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isForTools: v
    }
  }
}

function nodeSetIsChecking(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isChecking: v
    }
  }
}

function nodeSetIsEditing(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isEditing: v
    }
  }
}

function nodeSetIsCurrent(currNode, v) {
  return {
    ...currNode,
    _state: {
      ...currNode._state,
      isCurrent: v
    }
  }
}

function nodeSetSet(currNode, newSet) {
  return {
    ...currNode,
    set: newSet
  }
}

function nodeAppendChild(currNode, newChild) {
  return {
    ...currNode,
    children: [...currNode.children, newChild]
  }
}

function nodeSetChildren(currNode, newChildren) {
  return {
    ...currNode,
    children: newChildren
  }
}

function nodeSetColor(currNode, newColor) {
  return {
    ...currNode,
    color: newColor
  }
}

function nodeFillIn(currNode, level = 0, stateOverrides = {}) {
  return {
    name: currNode.name,
    color: currNode.color || DEFAULT_COLOR,
    ...(currNode.children ? {
      children: currNode.children.map(childNode => nodeFillIn(childNode, level+1, stateOverrides)),
    } : {
      set: currNode.set || [],
    }),
    _state: {
      key: generateKey(),
      level,
      isEditing: false,
      isCurrent: false,
      isChecking: false,
      isForTools: false,
      ...stateOverrides
    },
  };
}

function treeAppendChild(currTree, node) {
  return {
    ...currTree,
    tree: [...currTree.tree, node]
  };
}


function treeAppendChildren(currTree, nodes) {
  return {
    ...currTree,
    tree: [...currTree.tree, ...nodes]
  };
}

function treeSetItems(currTree, cellIds) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      items: cellIds
    }
  };
}

function nodeFindNode(node, predicate) {
  if(predicate(node)) {
    return node;
  }
  if(!node.children) {
    return null;
  }
  for(let child of node.children) {
    const foundNode = nodeFindNode(child, predicate);
    if(foundNode) {
      return foundNode;
    }
  }
  return null;
}

function nodeFindIsCurrentNode(node) {
  return nodeFindNode(node, n => n._state.isCurrent);
}

function nodeFindIsForToolsNode(node) {
  return nodeFindNode(node, n => (n._state.level === 0 && n._state.isForTools));
}


function treeAddForToolsNode(currTree) {
  const newNode = nodeFillIn({
    name: "My Selections",
    children: [],
  }, 0);
  const newForToolsNode = nodeSetIsForTools(newNode, true);
  return treeAppendChild(currTree, newForToolsNode);
}

function nodeReplace(node, predicate, newNode) {
  if(predicate(node)) {
    return newNode;
  }
  if(node.children) {
    return {
      ...node,
      children: node.children.map(child => nodeReplace(child, predicate, newNode))
    };
  }
  return node;
}

function nodeTransform(node, predicate, transform) {
  if(predicate(node)) {
    return transform(node);
  }
  if(node.children) {
    return {
      ...node,
      children: node.children.map(child => nodeTransform(child, predicate, transform))
    };
  }
  return node;
}

function nodeTransformChildOrAppendChild(node, ancestorPredicate, descendantPredicate, transform, descendant) {
  if(node.children && ancestorPredicate(node)) {
    if(some(node.children.map(descendantPredicate))) {
      return {
        ...node,
        children: node.children.map(child => nodeTransform(child, descendantPredicate, transform))
      };
    } else {
      return {
        ...node,
        children: [...node.children, descendant]
      };
    }
  }
  if(node.children) {
    return {
      ...node,
      children: node.children.map(child => nodeTransformChildOrAppendChild(child, ancestorPredicate, descendantPredicate, transform, descendant))
    };
  }
  return node;
}

function treeSetCurrentSet(currTree, cellIds) {
  let newTree = currTree;
  let toolsNode = newTree.tree.find(nodeFindIsForToolsNode);
  if(!toolsNode) {
    newTree = treeAddForToolsNode(currTree);
  }

  newTree = {
    ...newTree,
    tree: newTree.tree.map(levelZeroNode =>
      nodeTransformChildOrAppendChild(
        levelZeroNode,
        node => (node._state.isForTools && node._state.level === 0),
        node => (node._state.isCurrent && node._state.level === 1),
        node => nodeSetSet(node, cellIds),
        nodeFillIn({ name: CURRENT_SET_NAME, set: cellIds }, 1, { isCurrent: true })
      )
    )
  };
  return newTree;
}

function treeImport(currTree, treeToImport) {
  if (!treeToImport || treeToImport.length === 0) {
    return currTree;
  }
  const newChildren = treeToImport.map(child => nodeFillIn(child));
  return treeAppendChildren(currTree, newChildren);
}

function treeGetEmpty(datatype) {
  return {
    version,
    datatype,
    tree: [],
    _state: {
      items: [], // for complement operations
      checkedKeys: [],
      visibleKeys: [],
      checkedLevel: { levelZeroKey: null, levelIndex: null },
    }
  };
}


export default {
  treeGetEmpty,
  treeImport,
  treeSetItems,
  treeSetCurrentSet
};