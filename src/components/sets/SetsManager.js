/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import Tree from './Tree';
import TreeNode from './TreeNode';
import { PlusButton, SetOperationButtons } from './SetsManagerButtons';
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
    datatype,
    clearPleaseWait,
    draggable = true,
    checkable = true,
    editable = true,
    expandable = true,
    operatable = true,
    onError,
    onCheckNode,
    onCheckNodes,
    onExpandNode,
    onDropNode,
    onCheckLevel,
    onNodeSetColor,
    onNodeSetName,
    onNodeSetIsEditing,
    onNodeRemove,
    onNodeView,
    onImportTree,
    onCreateLevelZeroNode,
    onExportLevelZeroNode,
    onExportSet,
    onUnion,
    onIntersection,
    onComplement,
    onView,
  } = props;

  // eslint-disable-next-line no-console
  console.assert(
    !operatable || (operatable && checkable && expandable),
    'Must be checkable and expandable in order to be operatable.',
  );

  if (clearPleaseWait && tree) {
    clearPleaseWait('cell_sets');
  }

  const [isDragging, setIsDragging] = useState(false);

  function renderTreeNodes(nodes) {
    if (!nodes) {
      return null;
    }
    return nodes.map(node => (
      <TreeNode
        key={node._state.key}
        {...nodeToRenderProps(node)}
        datatype={datatype}
        draggable={draggable}
        checkable={checkable}
        editable={editable}
        expandable={expandable}

        isChecking={tree._state.isChecking}
        checkedLevelKey={tree._state.checkedLevel.levelZeroKey}
        checkedLevelIndex={tree._state.checkedLevel.levelIndex}

        onCheckNode={onCheckNode}
        onCheckLevel={onCheckLevel}
        onNodeView={onNodeView}
        onNodeSetColor={onNodeSetColor}
        onNodeSetName={onNodeSetName}
        onNodeSetIsEditing={onNodeSetIsEditing}
        onNodeRemove={onNodeRemove}
        onExportLevelZeroNode={onExportLevelZeroNode}
        onExportSet={onExportSet}

        disableTooltip={isDragging}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
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

        checkedKeys={tree._state.checkedKeys}
        expandedKeys={tree._state.expandedKeys}
        autoExpandParent={tree._state.autoExpandParent}

        onCheck={onCheckNodes}
        onExpand={(expandedKeys, info) => onExpandNode(
          expandedKeys,
          info.node.props.nodeKey,
          info.expanded,
        )}
        onDrop={(info) => {
          const { eventKey: dropKey } = info.node.props;
          const { eventKey: dragKey } = info.dragNode.props;
          const { dropToGap, dropPosition } = info;
          onDropNode(dropKey, dragKey, dropPosition, dropToGap);
        }}
      >
        {renderTreeNodes(tree.tree)}
      </Tree>
      <PlusButton
        datatype={datatype}
        onError={onError}
        onImportTree={onImportTree}
        onCreateLevelZeroNode={onCreateLevelZeroNode}
      />
      {tree._state.isChecking ? (
        <SetOperationButtons
          onUnion={onUnion}
          onIntersection={onIntersection}
          onComplement={onComplement}
          onView={onView}
        />
      ) : null}
    </div>
  );
}
