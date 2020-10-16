/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import React, { useState, useMemo } from 'react';
import isEqual from 'lodash/isEqual';
import Tree from './Tree';
import TreeNode from './TreeNode';
import { PlusButton, SetOperationButtons } from './SetsManagerButtons';
import { nodeToRenderProps, nodeToSet } from './reducer';
import { PALETTE, DEFAULT_COLOR } from '../utils';

function processNode(node, level, prevPath, setColor, siblingIndex) {
  const nodePath = [...prevPath, node.name];
  return {
    ...node,
    ...(node.children ? ({
      children: node.children
        .map((c, siblingIndex) => processNode(c, level + 1, nodePath, setColor, siblingIndex)),
    }) : {}),
    _state: {
      path: nodePath,
      nodeKey: pathToKey(nodePath),
      level,
      size: nodeToSet(node).length,
      color: setColor?.find(d => isEqual(d.path, nodePath))?.color || DEFAULT_COLOR,
      isLeaf: !node.children,
    }
  };
}

function processSets(sets, setColor) {
  // TODO
  return {
    ...sets,
    tree: sets ? sets.tree.map((lzn, siblingIndex) => processNode(lzn, 0, [], setColor, siblingIndex)) : [],
  }
}

function getAllKeys(node) {
  if(!node) {
    return [null];
  }
  if(node.children) {
    return [node._state.nodeKey, ...node.children.flatMap(getAllKeys)];
  } else {
    return [node._state.nodeKey];
  }
}

function pathToKey(path) {
  return path.join("___");
}

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
    sets,
    additionalSets,
    setColor,  // TODO: use this
    levelSelection: checkedLevel,
    setSelection,
    setExpansion,

    datatype,
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
    onNodeCheckNewName,
    onNodeRemove,
    onNodeView,
    onImportTree,
    onCreateLevelZeroNode,
    onExportLevelZeroNodeJSON,
    onExportLevelZeroNodeTabular,
    onExportSetJSON,
    onUnion,
    onIntersection,
    onComplement,
    hasCheckedSetsToUnion,
    hasCheckedSetsToIntersect,
    hasCheckedSetsToComplement,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isEditingNodeName, setIsEditingNodeName] = useState(null);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const processedSets = useMemo(() => {
    return processSets(sets, setColor);
  }, [sets, setColor]);

  const processedAdditionalSets = useMemo(() => {
    return processSets(additionalSets, setColor);
  }, [additionalSets, setColor]);

  const additionalSetKeys = (processedAdditionalSets ? processedAdditionalSets.tree.flatMap(getAllKeys) : []);

  const allSetSelectionKeys = (setSelection ? setSelection : []).map(pathToKey);
  const allSetExpansionKeys = (setExpansion ? setExpansion : []).map(pathToKey);

  const setSelectionKeys = allSetSelectionKeys.filter(k => !additionalSetKeys.includes(k));
  const setExpansionKeys = allSetExpansionKeys.filter(k => !additionalSetKeys.includes(k));

  const additionalSetSelectionKeys = allSetSelectionKeys.filter(k => additionalSetKeys.includes(k));
  const additionalSetExpansionKeys = allSetExpansionKeys.filter(k => additionalSetKeys.includes(k));



  /**
   * Recursively render TreeNode components.
   * @param {object[]} nodes An array of node objects.
   * @returns {TreeNode[]|null} Array of TreeNode components or null.
   */
  function renderTreeNodes(nodes, readOnly) {
    if (!nodes) {
      return null;
    }
    return nodes.map(node => (
      <TreeNode
        key={pathToKey(node._state.path)}
        {...nodeToRenderProps(node)}

        isEditing={isEqual(isEditingNodeName, node._state.path)}

        datatype={datatype}
        draggable={draggable && !readOnly}
        editable={editable && !readOnly}
        checkable={checkable}
        expandable={expandable}
        exportable={exportable}

        isChecking={isChecking}
        checkedLevelPath={checkedLevel ? checkedLevel.levelZeroPath : null}
        checkedLevelIndex={checkedLevel ? checkedLevel.levelIndex : null}

        onCheckNode={onCheckNode}
        onCheckLevel={onCheckLevel}
        onNodeView={onNodeView}
        onNodeSetColor={onNodeSetColor}
        onNodeSetName={(targetPath, name) => {
          onNodeSetName(targetPath, name);
          setIsEditingNodeName(null);
        }}
        onNodeCheckNewName={onNodeCheckNewName}
        onNodeSetIsEditing={setIsEditingNodeName}
        onNodeRemove={onNodeRemove}
        onExportLevelZeroNodeJSON={onExportLevelZeroNodeJSON}
        onExportLevelZeroNodeTabular={onExportLevelZeroNodeTabular}
        onExportSetJSON={onExportSetJSON}

        disableTooltip={isDragging}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        {renderTreeNodes(node.children, readOnly)}
      </TreeNode>
    ));
  }

  return (
    <div className="sets-manager">
      <div className="sets-manager-tree">
        <Tree
          draggable={false}
          checkable={checkable}

          checkedKeys={setSelectionKeys}
          expandedKeys={setExpansionKeys}
          autoExpandParent={autoExpandParent}

          onCheck={(checkedKeys, info) => onCheckNode(
            info.node.props.nodeKey,
            info.checked,
          )}
          onExpand={(expandedKeys, info) => onExpandNode(
            expandedKeys,
            info.node.props.nodeKey,
            info.expanded,
          )}
        >
          {renderTreeNodes(processedSets.tree, true)}
        </Tree>
        <Tree
          draggable={draggable}
          checkable={checkable}

          checkedKeys={additionalSetSelectionKeys}
          expandedKeys={additionalSetExpansionKeys}
          autoExpandParent={autoExpandParent}

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
          {renderTreeNodes(processedAdditionalSets.tree, false)}
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
      {isChecking ? (
        <div className="set-operation-buttons">
          <SetOperationButtons
            onUnion={onUnion}
            onIntersection={onIntersection}
            onComplement={onComplement}
            operatable={operatable}

            hasCheckedSetsToUnion={hasCheckedSetsToUnion}
            hasCheckedSetsToIntersect={hasCheckedSetsToIntersect}
            hasCheckedSetsToComplement={hasCheckedSetsToComplement}
          />
        </div>
      ) : null}
    </div>
  );
}
