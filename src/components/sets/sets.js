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

function nodeSetName(currNode, newName) {
  return {
    ...currNode,
    name: newName
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

function nodeRemove(node, predicate) {
  if(predicate(node)) {
    return null;
  }
  if(node.children) {
    return {
      ...node,
      children: node.children.map(child => nodeRemove(child, predicate, newNode)).filter(Boolean)
    };
  }
  return node;
}

function treeRemoveNodeByKey(currTree, targetKey) {
  return {
    ...currTree,
    tree: currTree.map(node => nodeRemove(node, n => n._state.key === targetKey)).filter(Boolean),
    _state: {
      ...currTree._state,
      checkedKeys: currTree._state.checkedKeys.filter(k => k !== targetKey),
      visibleKeys: currTree._State.visibleKeys.filter(k => k !== targetKey),
      // TODO: figure out if the _state.checkedLevel is for this node or a descendant, and if so, reset
    }
  };
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

function treeTransformNodeByKey(currTree, targetKey, transform) {
  return {
    ...currTree,
    tree: currTree.map(node => nodeTransform(node, n => n._state.key === targetKey), transform)
  };
}

function treeNodeSetColor(currTree, targetKey, color) {
  return treeTransformNodeByKey(currTree, targetKey, node => nodeSetColor(node, color));
}

function treeNodeSetName(currTree, targetKey, name) {
  return treeTransformNodeByKey(currTree, targetKey, node => nodeSetName(node, name));
}




function treeImport(currTree, treeToImport) {
  if (!treeToImport || treeToImport.length === 0) {
    return currTree;
  }
  const newChildren = treeToImport.map(child => nodeFillIn(child));
  return treeAppendChildren(currTree, newChildren);
}

function nodeClearState(currNode) {
  return {
    ...currNode,
    _state: undefined
  };
}

function treeExport(currTree) {
  return {
    ...currTree,
    tree: currTree.map(node => nodeClearState(node)),
    _state: undefined
  };
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
      expandedKeys: [], // used by ant-tree
      autoExpandParent: true, // used by ant-tree
    }
  };
}

function treeOnCheckLevel(currTree, levelZeroKey, levelIndex) {
  // Upon an expansion interaction, we always want autoExpandParent to be false
  // to allow a parent with expanded children to collapse.
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedLevel: { levelZeroKey, levelIndex }
    }
  };
}

function treeOnExpand(currTree, expandedKeys) {
  // Upon an expansion interaction, we always want autoExpandParent to be false
  // to allow a parent with expanded children to collapse.
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      expandedKeys,
      autoExpandParent: false,
    }
  };
}

function treeOnCheck(currTree, checkedKeys) {
  // Upon an expansion interaction, we always want autoExpandParent to be false
  // to allow a parent with expanded children to collapse.
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedKeys
    }
  };
}


function treeOnDrop(currTree) {
  // TODO: port tree dragRearrange function
  return currTree;
}

function treeSetVisibleKeys(currTree, visibleKeys, shouldInvalidateCheckedLevel = true) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      visibleKeys,
      ...(shouldInvalidateCheckedLevel ? {
        checkedLevel: { levelZeroKey: null, levelIndex: null }
      } : {})
    }
  };
}

function treeOnViewSet(currTree, targetKey) {
  return treeSetVisibleKeys(currTree, [targetKey]);
}

function treeOnViewSetDescendants(currTree, targetKey, level, shouldInvalidateCheckedLevel = true) {
  // TODO
  const node = this.findNode(setKey);
  const descendentsOfInterest = node.getDescendantsFlat(level);
  return treeSetVisibleKeys(currTree, descendentsOfInterest.map(d => d.key), shouldInvalidateCheckedLevel);
}

function nodeToSet(node) {
  // TODO: recursively obtain the set if not a leaf node.
  return node.set || [];
}

function nodeToHeight(node, level = 0) {
  if(!node.children) {
    return level;
  } else {
    const childrenHeights = node.children.map(c => nodeToHeight(c, level + 1));
    return Math.max(...childrenHeights, 0);
  }
}

function nodeToRenderProps(node) {
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


export default {
  nodeToRenderProps,
  treeGetEmpty,
  treeImport,
  treeSetItems,
  treeSetCurrentSet,
  treeExport,
  treeOnExpand,
  treeOnCheck,
  treeOnCheckLevel,
  treeOnDrop,
  treeNodeSetColor,
  treeNodeSetName,
  treeOnViewSet,
  treeOnViewSetDescendants,
};