/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import Tree from './Tree';
import TreeNode from './TreeNode';
import { PlusButton, SetOperationButtons } from './SetsManagerButtons';
import { nodeToRenderProps } from './reducer';

/**
 * A generic hierarchical set manager component.
 * @prop {object} tree An object representing set hierarchies.
 * @prop {string} datatype The data type for sets (e.g. "cell")
 * @prop {function} clearPleaseWait A callback to signal that loading is complete.
 * @prop {boolean} draggable Whether tree nodes can be rearranged via drag-and-drop.
 * By default, true.
 * @prop {boolean} checkable Whether to show the "Check" menu button
 * and checkboxes for selecting multiple sets. By default, true.
 * @prop {boolean} editable Whether to show rename, delete, color, or create options.
 * By default, true.
 * @prop {boolean} expandable Whether to allow hierarchies to be expanded
 * to show the list or tree of sets contained. By default, true.
 * @prop {boolean} operatable Whether to enable union, intersection,
 * and complement operations on checked sets. By default, true.
 * @prop {boolean} exportable Whether to enable exporting hierarchies and sets to files.
 * By default, true.
 * @prop {boolean} importable Whether to enable importing hierarchies from files.
 * By default, true.
 * @prop {function} onError Function to call with error messages (failed import validation, etc).
 * @prop {function} onCheckNode Function to call when a single node has been checked or un-checked.
 * @prop {function} onExpandNode Function to call when a node has been expanded.
 * @prop {function} onDropNode Function to call when a node has been dragged-and-dropped.
 * @prop {function} onCheckLevel Function to call when an entire hierarchy level has been selected,
 * via the "Color by cluster" and "Color by subcluster" buttons below collapsed level zero nodes.
 * @prop {function} onNodeSetColor Function to call when a new node color has been selected.
 * @prop {function} onNodeSetName Function to call when a node has been renamed.
 * @prop {function} onNodeSetIsEditing Function to call when a user clicks the "Rename" menu button
 * to start editing the node name in a text input.
 * @prop {function} onNodeRemove Function to call when the user clicks the "Delete" menu button
 * to remove a node.
 * @prop {function} onNodeView Function to call when the user wants to view the set associated
 * with a particular node.
 * @prop {function} onImportTree Function to call when a tree has been imported
 * using the "plus" button.
 * @prop {function} onCreateLevelZeroNode Function to call when a user clicks the "Create hierarchy"
 * menu option using the "plus" button.
 * @prop {function} onExportLevelZeroNode Function to call when a user wants to
 * export an entire hierarchy via the "Export hierarchy" menu button for a
 * particular level zero node.
 * @prop {function} onExportSet Function to call when a user wants to export a set associated with
 * a particular node via the "Export set" menu button.
 * @prop {function} onUnion Function to call when a user wants to create a new set from the union
 * of the sets associated with the currently-checked nodes.
 * @prop {function} onIntersection Function to call when a user wants to create a new set from the
 * intersection of the sets associated with the currently-checked nodes.
 * @prop {function} onComplement Function to call when a user wants to create a new set from the
 * complement of the (union of the) sets associated with the currently-checked nodes.
 * @prop {function} onView Function to call when a user wants to view the sets
 * associated with the currently-checked nodes.
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
    exportable = true,
    importable = true,
    onError,
    onCheckNode,
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

  if (clearPleaseWait && tree) {
    clearPleaseWait('cell_sets');
  }

  const [isDragging, setIsDragging] = useState(false);

  /**
   * Recursively render TreeNode components.
   * @param {object[]} nodes An array of node objects.
   * @returns {TreeNode[]|null} Array of TreeNode components or null.
   */
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
        exportable={exportable}

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
      <div className="sets-manager-tree">
        <Tree
          draggable={draggable}
          checkable={checkable}

          checkedKeys={tree._state.checkedKeys}
          expandedKeys={tree._state.expandedKeys}
          autoExpandParent={tree._state.autoExpandParent}

          onCheck={(checkedKeys, info) => onCheckNode(
            info.node.props.nodeKey,
            info.checked,
          )}
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
          importable={importable}
          editable={editable}
        />
      </div>
      {tree._state.isChecking ? (
        <div className="set-operation-buttons">
          <SetOperationButtons
            onUnion={onUnion}
            onIntersection={onIntersection}
            onComplement={onComplement}
            onView={onView}
            operatable={operatable}
          />
        </div>
      ) : null}
    </div>
  );
}
