/* eslint-disable */
import uuidv4 from 'uuid/v4';
import { version } from '../../../package.json';
import { DEFAULT_COLOR, PALETTE, fromEntries } from '../utils';
import some from 'lodash/some';
import intersection from 'lodash/intersection';

const CURRENT_SET_NAME = "Current selection";

const ALLOW_SIDE_EFFECTS = true;
const globalSets = {};
const globalItems = {};

const UPDATE_VISIBLE_ON_EXPAND = false;



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
  if(ALLOW_SIDE_EFFECTS) {
    globalSets[currNode._state.key] = newSet;
  }
  return {
    ...currNode,
    set: (ALLOW_SIDE_EFFECTS ? true : newSet)
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
  const nodeKey = generateKey();
  if(ALLOW_SIDE_EFFECTS && !currNode.children) {
    globalSets[nodeKey] = currNode.set || [];
  }
  return {
    name: currNode.name,
    color: currNode.color || DEFAULT_COLOR,
    ...(currNode.children ? {
      children: currNode.children.map(childNode => nodeFillIn(childNode, level+1, stateOverrides)),
    } : {
      set: (ALLOW_SIDE_EFFECTS ? true : (currNode.set || []))
    }),
    _state: {
      key: nodeKey,
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
  if(ALLOW_SIDE_EFFECTS) {
    globalItems[currTree._state.key] = cellIds;
  }
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      items: (ALLOW_SIDE_EFFECTS ? true : cellIds)
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

function treeFindNode(currTree, predicate) {
  for(let levelZeroNode of currTree.tree) {
    const foundNode = nodeFindNode(levelZeroNode, predicate);
    if(foundNode) {
      return foundNode;
    }
  }
  return null;
}

function treeFindNodeByKey(currTree, targetKey) {
  return treeFindNode(currTree, n => (n._state.key === targetKey));
}

function treeFindLevelZeroNodeByDescendantKey(currTree, targetKey) {
  for(let levelZeroNode of currTree.tree) {
    const foundNode = nodeFindNode(levelZeroNode, n => (n._state.key === targetKey));
    if(foundNode) {
      return levelZeroNode;
    }
  }
  return null;
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
      children: node.children.map(child => nodeRemove(child, predicate)).filter(Boolean)
    };
  }
  return node;
}

function treeNodeRemove(currTree, targetKey) {
  const node = treeFindNodeByKey(currTree, targetKey);
  const levelZeroNode = treeFindLevelZeroNodeByDescendantKey(currTree, targetKey);

  const shouldClearCheckedLevel = (
    (currTree._state.checkedLevel.levelZeroKey === node._state.key)
    || (currTree._state.checkedLevel.levelZeroKey === levelZeroNode._state.key && currTree._state.checkedLevel.levelIndex === node._state.level));

  return {
    ...currTree,
    tree: currTree.tree.map(node => nodeRemove(node, n => n._state.key === targetKey)).filter(Boolean),
    _state: {
      ...currTree._state,
      checkedKeys: currTree._state.checkedKeys.filter(k => k !== targetKey),
      visibleKeys: currTree._state.visibleKeys.filter(k => k !== targetKey),
      checkedLevel: (shouldClearCheckedLevel ? { levelZeroKey: null, levelIndex: null } : currTree._state.checkedLevel),
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

function nodeTransformDescendants(node, transform) {
  if(!node.children) {
    return transform(node);
  }
  const newNode = transform(node);
  return {
    ...newNode,
    children: newNode.children.map(child => nodeTransformDescendants(child, transform))
  };
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
    toolsNode = newTree.tree.find(nodeFindIsForToolsNode);
  }

  const currExpandedKeys = newTree._state.expandedKeys;
  const newExpandedKeys = (currExpandedKeys.includes(toolsNode._state.key) ? currExpandedKeys : [...currExpandedKeys, toolsNode._state.key]);

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

  const currentSetNode = treeFindNode(newTree, n => n._state.isCurrent);
  newTree = {
    ...newTree,
    _state: {
      ...newTree._state,
      visibleKeys: [currentSetNode._state.key],
      expandedKeys: newExpandedKeys,
    }
  };
  return newTree;
}

function treeTransformNodeByKey(currTree, targetKey, transform) {
  return {
    ...currTree,
    tree: currTree.tree.map(node => nodeTransform(node, n => (n._state.key === targetKey), transform))
  };
}

function treeNodeSetColor(currTree, targetKey, color) {
  return treeTransformNodeByKey(currTree, targetKey, node => nodeSetColor(node, color));
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
  }
  return treeTransformNodeByKey(currTree, targetKey, transformName);
}

function treeImport(currTree, treeToImport) {
  if (!treeToImport || treeToImport.length === 0) {
    return currTree;
  }
  let newChildren = treeToImport.map(child => nodeFillIn(child));

  // Set colors of new nodes.
  newChildren = newChildren.map(child => {
    const height = nodeToHeight(child);
    let newChild = child;
    for(let level = 0; level < height; level++) {
      const descendentKeys = nodeToDescendantsFlat(child, level).map(d => d._state.key);
      for(let i = 0; i < descendentKeys.length; i++) {
        newChild = nodeTransform(newChild, n => n._state.key === descendentKeys[i], n => nodeSetColor(n, PALETTE[i % PALETTE.length]));
      }
    }
    return newChild;
  });

  const newTree = treeAppendChildren(currTree, newChildren);
  return newTree;
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
  const treeKey = generateKey();
  return {
    version,
    datatype,
    tree: [],
    _state: {
      key: treeKey,
      items: (ALLOW_SIDE_EFFECTS ? true : []), // for complement operations
      checkedKeys: [],
      visibleKeys: [],
      checkedLevel: { levelZeroKey: null, levelIndex: null },
      expandedKeys: [], // used by ant-tree
      autoExpandParent: true, // used by ant-tree
    }
  };
}

function treeOnCheckLevel(currTree, levelZeroKey, levelIndex) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedLevel: { levelZeroKey, levelIndex }
    }
  };
}

function treeNodeGetClosedDescendants(currTree, targetKey) {
  const node = treeFindNodeByKey(currTree, targetKey);
  if(node._state.isLeaf || !currTree._state.expandedKeys.includes(targetKey)) {
    return [targetKey];
  }
  return node.children.flatMap(c => treeNodeGetClosedDescendants(currTree, c._state.key));
}

function treeOnExpand(currTree, expandedKeys, targetKey, expanded) {
  // Upon an expansion interaction, we always want autoExpandParent to be false
  // to allow a parent with expanded children to collapse.

  let newTree = {
    ...currTree,
    _state: {
      ...currTree._state,
      expandedKeys,
      autoExpandParent: false,
    }
  };

  if(UPDATE_VISIBLE_ON_EXPAND) {
    // When expanding a node, if it was previously visible, replace its key in .visibleKeys with the keys of its closed descendants.
  // When collapsing a node, if all of its open or leaf descendants were previously visible, we want to replace those keys with itself.
    const currClosedKeys = treeNodeGetClosedDescendants(currTree, targetKey);
    const newClosedKeys = treeNodeGetClosedDescendants(newTree, targetKey);

    let visibleKeys = currTree._state.visibleKeys;
    if(expanded && visibleKeys.includes(targetKey)) {
      visibleKeys = visibleKeys.filter(k => k !== targetKey);
      visibleKeys = [...visibleKeys, ...newClosedKeys];
    } else if(!expanded && intersection(visibleKeys, currClosedKeys).length === currClosedKeys.length) {
      visibleKeys = visibleKeys.filter(k => !currClosedKeys.includes(k));
      visibleKeys = [...visibleKeys, targetKey];
    }
    return {
      ...newTree,
      _state: {
        ...newTree._state,
        visibleKeys,
      }
    };
  }
  return newTree;
}

function treeOnCheck(currTree, checkedKeys) {
  return {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedKeys
    }
  };
}

function treeOnCheckNode(currTree, nodeKey) {
  const currCheckedKeys = currTree._state.checkedKeys;
  let newCheckedKeys;
  if(currCheckedKeys.includes(nodeKey)) {
    newCheckedKeys = currCheckedKeys.filter(k => k !== nodeKey);
  } else {
    newCheckedKeys = [...currCheckedKeys, nodeKey];
  }
  const newTree = {
    ...currTree,
    _state: {
      ...currTree._state,
      checkedKeys: newCheckedKeys,
    }
  };

  // Set .isChecking on all nodes within this level zero node.
  const levelZeroNode = treeFindLevelZeroNodeByDescendantKey(newTree, nodeKey);
  const newLevelZeroNode = nodeTransformDescendants(levelZeroNode, n => nodeSetIsChecking(n, true));

  return {
    ...newTree,
    tree: newTree.tree.map(n => (n._state.key === levelZeroNode._state.key ? newLevelZeroNode : n))
  }
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

function treeNodeView(currTree, targetKey) {
  // If the targetKey is an open node, then use the colors of the closed and leaf descendants.
  // If the targetKey is a closed node, then use the one color associated with that node.
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
  const descendentKeys = nodeToDescendantsFlat(node, level).map(d => d._state.key);
  return treeSetVisibleKeys(currTree, descendentKeys, shouldInvalidateCheckedLevel);
}

function nodeToSet(node) {
  if(!node.children) {
    return (ALLOW_SIDE_EFFECTS ? globalSets[node._state.key] : (node.set || []));
  }
  return node.children.flatMap(c => nodeToSet(c));
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

function treeToVisibleCells(currTree) {
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


export default {
  nodeToRenderProps,
  treeGetEmpty,
  treeImport,
  treeSetItems,
  treeSetCurrentSet,
  treeExport,
  treeOnExpand,
  treeOnCheck,
  treeOnCheckNode,
  treeOnCheckLevel,
  treeOnDrop,
  treeNodeSetColor,
  treeNodeSetName,
  treeNodeRemove,
  treeNodeView,
  treeNodeViewDescendants,
  treeToVisibleCells,
};