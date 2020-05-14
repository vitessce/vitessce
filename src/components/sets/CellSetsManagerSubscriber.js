import React, { useCallback, useEffect, useReducer } from 'react';
import PubSub from 'pubsub-js';
import pkg from '../../../package.json';
import {
  CELL_SETS_VIEW, CELLS_SELECTION,
  CELLS_ADD, STATUS_WARN, CELLS_COLOR, CELL_SETS_ADD,
  CELL_SETS_CHANGE, CLEAR_PLEASE_WAIT,
} from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import reducer, {
  treeInitialize, ACTION, treeToVisibleCells,
  treeExportLevelZeroNode, treeExportSet,
} from './reducer';
import { handleExportJSON, downloadJSON, FILE_EXTENSION_JSON } from './io';

const SETS_DATATYPE_CELL = 'cell';
const initialTree = treeInitialize(SETS_DATATYPE_CELL);

/**
 * A subscriber wrapper around the SetsManager component
 * for the 'cell' datatype.
 * @param {object} props
 * @param {function} removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {function} onReady The function to call when the component has finished
 * initializing (subscribing to relevant events, etc).
 */
export default function CellSetsManagerSubscriber(props) {
  const {
    removeGridComponent,
    onReady,
  } = props;

  const onReadyCallback = useCallback(onReady, []);
  const [tree, dispatch] = useReducer(reducer, initialTree);

  function onImportTree(treeToImport) {
    dispatch({ type: ACTION.IMPORT, levelZeroNodes: treeToImport.tree });
  }

  function onExportLevelZeroNode(nodeKey) {
    const { treeToExport, nodeName } = treeExportLevelZeroNode(tree, nodeKey);
    downloadJSON(
      handleExportJSON(treeToExport),
      `${nodeName}_${pkg.name}-${SETS_DATATYPE_CELL}-hierarchy`,
      FILE_EXTENSION_JSON,
    );
  }

  function onExportSet(nodeKey) {
    const { setToExport, nodeName } = treeExportSet(tree, nodeKey);
    downloadJSON(
      handleExportJSON(setToExport),
      `${nodeName}_${pkg.name}-${SETS_DATATYPE_CELL}-set`,
      FILE_EXTENSION_JSON,
    );
  }

  // Subscribe to cell set import events.
  // Subscribe to cell import and selection events.
  useEffect(() => {
    const cellSetsAddToken = PubSub.subscribe(CELL_SETS_ADD,
      (msg, treeToImport) => {
        onImportTree(treeToImport);
      });
    const cellsAddToken = PubSub.subscribe(CELLS_ADD, (msg, cells) => {
      dispatch({ type: ACTION.SET_TREE_ITEMS, cellIds: Object.keys(cells) });
    });
    const cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, (msg, cellIds) => {
      dispatch({ type: ACTION.SET_CURRENT_SET, cellIds: Array.from(cellIds) });
    });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(cellSetsAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsSelectionToken);
    };
  }, [onReadyCallback]);

  // Publish cell visibility and color changes when the tree changes.
  // Publish the updated tree when the tree changes.
  useEffect(() => {
    const [cellIds, cellColors] = treeToVisibleCells(tree);
    PubSub.publish(CELLS_COLOR, cellColors);
    PubSub.publish(CELL_SETS_VIEW, new Set(cellIds));
    PubSub.publish(CELL_SETS_CHANGE, tree);
  }, [tree]);

  // Callback functions
  const onCheckNodes = useCallback((checkedKeys) => {
    dispatch({ type: ACTION.CHECK_NODES, checkedKeys });
  }, []);

  const onCheckNode = useCallback((targetKey) => {
    dispatch({ type: ACTION.CHECK_NODE, targetKey });
  }, []);

  const onExpandNode = useCallback((expandedKeys, targetKey, expanded) => {
    dispatch({
      type: ACTION.EXPAND_NODE, expandedKeys, targetKey, expanded,
    });
  }, []);

  const onDropNode = useCallback((dropKey, dragKey, dropPosition, dropToGap) => {
    dispatch({
      type: ACTION.DROP_NODE, dropKey, dragKey, dropPosition, dropToGap,
    });
  }, []);

  const onCheckLevel = useCallback((levelZeroKey, levelIndex) => {
    dispatch({ type: ACTION.CHECK_LEVEL, levelZeroKey, levelIndex });
  }, []);

  const onNodeSetColor = useCallback((targetKey, color) => {
    dispatch({ type: ACTION.SET_NODE_COLOR, targetKey, color });
  }, []);

  const onNodeSetName = useCallback((targetKey, name, stopEditing) => {
    dispatch({
      type: ACTION.SET_NODE_NAME, targetKey, name, stopEditing,
    });
  }, []);

  const onNodeSetIsEditing = useCallback((targetKey, value) => {
    dispatch({
      type: ACTION.SET_NODE_IS_EDITING, targetKey, value,
    });
  }, []);

  const onNodeRemove = useCallback((targetKey) => {
    dispatch({ type: ACTION.REMOVE_NODE, targetKey });
  }, []);

  const onNodeView = useCallback((targetKey) => {
    dispatch({ type: ACTION.VIEW_NODE, targetKey });
  }, []);

  const onCreateLevelZeroNode = useCallback(() => {
    dispatch({ type: ACTION.CREATE_LEVEL_ZERO_NODE });
  }, []);

  const onUnion = useCallback(() => {
    dispatch({ type: ACTION.UNION_CHECKED });
  }, []);

  const onIntersection = useCallback(() => {
    dispatch({ type: ACTION.INTERSECTION_CHECKED });
  }, []);

  const onComplement = useCallback(() => {
    dispatch({ type: ACTION.COMPLEMENT_CHECKED });
  }, []);

  const onView = useCallback(() => {
    dispatch({ type: ACTION.VIEW_CHECKED });
  }, []);

  return (
    <TitleInfo
      title="Cell Sets"
      isScroll
      removeGridComponent={removeGridComponent}
    >
      <SetsManager
        tree={tree}
        datatype={SETS_DATATYPE_CELL}
        clearPleaseWait={
          layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
        }
        onError={err => PubSub.publish(STATUS_WARN, err)}
        onCheckNode={onCheckNode}
        onCheckNodes={onCheckNodes}
        onExpandNode={onExpandNode}
        onDropNode={onDropNode}
        onCheckLevel={onCheckLevel}
        onNodeSetColor={onNodeSetColor}
        onNodeSetName={onNodeSetName}
        onNodeSetIsEditing={onNodeSetIsEditing}
        onNodeRemove={onNodeRemove}
        onNodeView={onNodeView}
        onImportTree={onImportTree}
        onCreateLevelZeroNode={onCreateLevelZeroNode}
        onExportLevelZeroNode={onExportLevelZeroNode}
        onExportSet={onExportSet}
        onUnion={onUnion}
        onIntersection={onIntersection}
        onComplement={onComplement}
        onView={onView}
      />
    </TitleInfo>
  );
}
