/* eslint-disable */
import React, { useCallback } from 'react';
import { Tree as AntTree } from 'antd';
import TreeNode from './TreeNode';
import sets from './sets';

/**
 * A generic hierarchical set manager component.
 * @prop {SetsTree} tree An object representing set hierarchies
 * @prop {string} datatype The data type for sets (e.g. "cell")
 * @prop {function} clearPleaseWait A callback to signal that loading is complete.
 * @prop {boolean} checkable Whether to show checkboxes for selecting multiple sets.
 * @prop {boolean} editable Whether to show rename, delete, color options.
 * @prop {boolean} expandable Whether to allow hierarchies to be expanded to show the list or tree of sets contained.
 * @prop {boolean} operatable Whether to enable union, intersection, and complement operations. If true, checkable also must be true.
 */
export default function SetsManager(props) {
  const {
    tree,
    onUpdateTree = (newTree) => console.log(newTree),
    datatype,
    clearPleaseWait,
    checkable = true,
    editable = true,
    expandable = true,
    operatable = true,
  } = props;

  console.assert(!operatable || (operatable && checkable && expandable), "Must be checkable and expandable in order to be operatable.");

  if (clearPleaseWait && tree) {
    clearPleaseWait('cell_sets');
  }

  const onCheck = useCallback((checkedKeys) => {
    const newTree = sets.treeOnCheck(tree, checkedKeys);
    onUpdateTree(newTree);
  }, [tree, onUpdateTree]);

  const onExpand = useCallback((expandedKeys) => {
    const newTree = sets.treeOnExpand(tree, expandedKeys);
    onUpdateTree(newTree);
  }, [tree, onUpdateTree]);

  const onDrop = useCallback((info) => {
    const { eventKey: dropKey } = info.node.props;
    const { eventKey: dragKey } = info.dragNode.props;
    const { dropToGap, dropPosition } = info;

    // Update the tree based on the drag event.
    const newTree = sets.treeOnDrop(tree, dropKey, dragKey, dropPosition, dropToGap);
    onUpdateTree(newTree);
  }, [tree, onUpdateTree]);

  const onCheckLevel = useCallback((levelZeroKey, levelIndex) => {
    let newTree = sets.treeOnCheckLevel(nodeKey, newLevel);
    newTree = sets.treeOnViewSetDescendants(nodeKey, newLevel-1, false);
    onUpdateTree(newTree);
  }, [tree, onUpdateTree]);


  function renderTreeNodes(nodes) {
    if (!nodes) {
      return null;
    }
    return nodes.map(node => (
      <TreeNode
        key={node._state.key}
        tree={tree}
        {...sets.nodeToRenderProps(node)}
        onCheckLevel={onCheckLevel}
      >
        {renderTreeNodes(node.children)}
      </TreeNode>
    ));
  };

  return (
    <div className="sets-manager">
      <AntTree
        draggable={false}
        checkable
        blockNode
        onExpand={onExpand}
        expandedKeys={tree._state.expandedKeys}
        autoExpandParent={tree._state.autoExpandParent}
        onCheck={onCheck}
        checkedKeys={tree._state.checkedKeys}
        onDrop={onDrop}
        prefixCls="rc-tree"
      >
        {renderTreeNodes(tree.tree)}
      </AntTree>
    </div>
  );
}
