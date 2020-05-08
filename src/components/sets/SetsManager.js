/* eslint-disable no-underscore-dangle */
import React from 'react';
import Tree from './Tree';
import TreeNode from './TreeNode';
import { nodeToRenderProps } from './reducer';

/**
 * A generic hierarchical set manager component.
 * @prop {SetsTree} tree An object representing set hierarchies
 * @prop {string} datatype The data type for sets (e.g. "cell")
 * @prop {function} clearPleaseWait A callback to signal that loading is complete.
 * @prop {boolean} checkable Whether to show checkboxes for selecting multiple sets.
 * @prop {boolean} editable Whether to show rename, delete, color options.
 * @prop {boolean} expandable Whether to allow hierarchies to be expanded
 * to show the list or tree of sets contained.
 * @prop {boolean} operatable Whether to enable union, intersection,
 * and complement operations. If true, checkable also must be true.
 */
export default function SetsManager(props) {
  const {
    tree,
    clearPleaseWait,
    draggable = false,
    checkable = true,
    editable = true,
    expandable = true,
    operatable = true,
    onCheckNode,
    onCheckNodes,
    onExpandNode,
    onDropNode,
    onCheckLevel,
    onNodeSetColor,
    onNodeSetName,
    onNodeRemove,
    onNodeView,
  } = props;

  // eslint-disable-next-line no-console
  console.assert(
    !operatable || (operatable && checkable && expandable),
    'Must be checkable and expandable in order to be operatable.',
  );

  if (clearPleaseWait && tree) {
    clearPleaseWait('cell_sets');
  }

  function renderTreeNodes(nodes) {
    if (!nodes) {
      return null;
    }
    return nodes.map(node => (
      <TreeNode
        key={node._state.key}
        tree={tree}
        {...nodeToRenderProps(node)}
        onCheckNode={onCheckNode}
        onCheckLevel={onCheckLevel}
        onNodeView={onNodeView}
        onNodeSetColor={onNodeSetColor}
        onNodeSetName={onNodeSetName}
        onNodeRemove={onNodeRemove}

        editable={editable}
        checkable={checkable}
        expandable={expandable}
      >
        {renderTreeNodes(node.children)}
      </TreeNode>
    ));
  }

  return (
    <div className="sets-manager">
      <Tree
        draggable={draggable}
        checkable={checkable}

        onExpand={(expandedKeys, info) => onExpandNode(
          expandedKeys,
          info.node.props.nodeKey,
          info.expanded,
        )}
        expandedKeys={tree._state.expandedKeys}
        autoExpandParent={tree._state.autoExpandParent}

        onCheck={onCheckNodes}
        checkedKeys={tree._state.checkedKeys}

        onDrop={(info) => {
          const { eventKey: dropKey } = info.node.props;
          const { eventKey: dragKey } = info.dragNode.props;
          const { dropToGap, dropPosition } = info;
          onDropNode(dropKey, dragKey, dropPosition, dropToGap);
        }}
      >
        {renderTreeNodes(tree.tree)}
      </Tree>
    </div>
  );
}
