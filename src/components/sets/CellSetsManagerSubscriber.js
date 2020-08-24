/* eslint-disable */
import React, {
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import PubSub from 'pubsub-js';
import packageJson from '../../../package.json';
import {
  STATUS_WARN,
} from '../../events';
import { useCoordination } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import reducer, {
  treeInitialize, ACTION, treeToVisibleCells,
  treeExportLevelZeroNode, treeExportSet,
  treeHasCheckedSetsToView,
  treeHasCheckedSetsToUnion,
  treeHasCheckedSetsToIntersect,
  treeHasCheckedSetsToComplement,
  treeToVisibleSetNames,
} from './reducer';
import {
  tryUpgradeTreeToLatestSchema,
  handleExportJSON, downloadForUser,
  handleExportTabular,
} from './io';
import {
  FILE_EXTENSION_JSON,
  FILE_EXTENSION_TABULAR,
} from './constants';
import { useUrls, useReady } from '../utils';
import { useCellsData, useCellSetsData } from '../data-hooks';
import { isEqual } from 'lodash';

const SETS_DATATYPE_CELL = 'cell';
const initialTree = treeInitialize(SETS_DATATYPE_CELL);

const CELL_SETS_DATA_TYPES = ['cells', 'cell-sets'];


/**
 * A subscriber wrapper around the SetsManager component
 * for the 'cell' datatype.
 * @param {object} props
 * @param {function} removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {function} onReady The function to call when the component has finished
 * initializing (subscribing to relevant events, etc).
 * @param {boolean} initEmit Should an event be emitted upon initialization,
 * so that cells are colored by some heuristic (e.g. the first clustering in the cell_sets tree)?
 */
export default function CellSetsManagerSubscriber(props) {
  const {
    loaders,
    coordinationScopes,
    removeGridComponent,
    initEmit = true,
    theme,
  } = props;

  const [{
    dataset,
    cellSelection,
    cellSetSelection,
    cellColorEncoding,
  }, {
    setCellSelection,
    setCellSetSelection,
    setCellColorEncoding,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSets, coordinationScopes);


  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    CELL_SETS_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(loaders, dataset, setItemIsReady, addUrl, true);

  const [tree, dispatch] = useReducer(reducer, initialTree);

  useEffect(() => {
    dispatch({ type: ACTION.SET, tree: cellSets });
  }, [cellSets]);

  // Publish the updated tree when the tree changes.
  useEffect(() => {
    if (!loaders[dataset] || !tree) {
      return;
    }
    if (loaders[dataset].loaders['cell-sets']) {
      loaders[dataset].loaders['cell-sets'].publish(tree);
    }
    const visibleSetNames = treeToVisibleSetNames(tree);
    if(!isEqual(visibleSetNames, cellSetSelection)) {
      setCellSetSelection(visibleSetNames);
    }
  }, [tree]);

  const setCellSetColorEncoding = useCallback(() => {
    setCellColorEncoding('cellSetSelection');
  });

  useEffect(() => {
    if(!tree || !cellSelection) {
      return;
    }
    dispatch({ type: ACTION.SET_CURRENT_SET, cellIds: cellSelection });
  }, [cellSelection]);

  // Callback functions
  function onCheckLevel(levelZeroKey, levelIndex) {
    dispatch({ type: ACTION.CHECK_LEVEL, levelZeroKey, levelIndex });
    setCellSetColorEncoding();
  }

  function onCheckNode(targetKey, checked) {
    dispatch({ type: ACTION.CHECK_NODE, targetKey, checked });
    setCellSetColorEncoding();
  }

  function onExpandNode(expandedKeys, targetKey, expanded) {
    dispatch({
      type: ACTION.EXPAND_NODE, expandedKeys, targetKey, expanded,
    });
  }

  function onDropNode(dropKey, dragKey, dropPosition, dropToGap) {
    dispatch({
      type: ACTION.DROP_NODE, dropKey, dragKey, dropPosition, dropToGap,
    });
  }

  function onNodeSetColor(targetKey, color) {
    dispatch({ type: ACTION.SET_NODE_COLOR, targetKey, color });
  }

  function onNodeSetName(targetKey, name, stopEditing) {
    dispatch({
      type: ACTION.SET_NODE_NAME, targetKey, name, stopEditing,
    });
  }

  function onNodeSetIsEditing(targetKey, value) {
    dispatch({
      type: ACTION.SET_NODE_IS_EDITING, targetKey, value,
    });
  }

  function onNodeRemove(targetKey) {
    dispatch({ type: ACTION.REMOVE_NODE, targetKey });
  }

  function onNodeView(targetKey) {
    dispatch({ type: ACTION.VIEW_NODE, targetKey });
    setCellSetColorEncoding();
  }

  function onCreateLevelZeroNode() {
    dispatch({ type: ACTION.CREATE_LEVEL_ZERO_NODE });
  }

  function onUnion() {
    dispatch({ type: ACTION.UNION_CHECKED });
    setCellSetColorEncoding();
  }

  function onIntersection() {
    dispatch({ type: ACTION.INTERSECTION_CHECKED });
    setCellSetColorEncoding();
  }

  function onComplement() {
    dispatch({ type: ACTION.COMPLEMENT_CHECKED });
    setCellSetColorEncoding();
  }

  function onView() {
    dispatch({ type: ACTION.VIEW_CHECKED });
    setCellSetColorEncoding();
  }

  function onImportTree(treeToImport) {
    dispatch({ type: ACTION.IMPORT, levelZeroNodes: treeToImport.tree });
  }

  function onExportLevelZeroNodeJSON(nodeKey) {
    const { treeToExport, nodeName } = treeExportLevelZeroNode(tree, nodeKey);
    downloadForUser(
      handleExportJSON(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-hierarchy.${FILE_EXTENSION_JSON}`,
    );
  }

  function onExportLevelZeroNodeTabular(nodeKey) {
    const { treeToExport, nodeName } = treeExportLevelZeroNode(tree, nodeKey);
    downloadForUser(
      handleExportTabular(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-hierarchy.${FILE_EXTENSION_TABULAR}`,
    );
  }

  function onExportSetJSON(nodeKey) {
    const { setToExport, nodeName } = treeExportSet(tree, nodeKey);
    downloadForUser(
      handleExportJSON(setToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-set.${FILE_EXTENSION_JSON}`,
      FILE_EXTENSION_JSON,
    );
  }

  // Subscribe to cell set import events.
  // Subscribe to cell import and selection events.
  /*useEffect(() => {
    const cellSetsAddToken = PubSub.subscribe(CELL_SETS_ADD,
      (msg, { data: treeToImport, url }) => {
        const actionType = (initEmit ? ACTION.IMPORT_AND_VIEW : ACTION.IMPORT);
        const newTreeToImport = tryUpgradeTreeToLatestSchema(treeToImport, SETS_DATATYPE_CELL);
        setUrls((prevUrls) => {
          const newUrls = [...prevUrls].concat({ url, name: 'Cells Sets' });
          return newUrls;
        });
        dispatch({ type: actionType, levelZeroNodes: newTreeToImport.tree });
      });
    const cellsAddToken = PubSub.subscribe(CELLS_ADD, (msg, { data: cells, url }) => {
      setUrls((prevUrls) => {
        const newUrls = [...prevUrls].concat({ url, name: 'Cells' });
        return newUrls;
      });
      dispatch({ type: ACTION.SET_TREE_ITEMS, cellIds: Object.keys(cells) });
    });
    const cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, (msg, cellIds) => {
      dispatch({ type: ACTION.SET_CURRENT_SET, cellIds: Array.from(cellIds) });
    });
    const resetToken = PubSub.subscribe(RESET, () => {
      setUrls([]);
      dispatch({ type: ACTION.RESET });
    });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(cellSetsAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(resetToken);
    };
  }, [onReadyCallback, initEmit]);*/

  // Publish cell visibility and color changes when the tree changes.
  // Publish the updated tree when the tree changes.
  /*useEffect(() => {
    const [cellIds, cellColors] = treeToVisibleCells(tree);
    PubSub.publish(CELLS_COLOR, cellColors);
    PubSub.publish(CELL_SETS_VIEW, new Set(cellIds));
    PubSub.publish(CELL_SETS_CHANGE, tree);
  }, [tree]);*/

  return (
    <TitleInfo
      title="Cell Sets"
      isScroll
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <SetsManager
        tree={tree}
        datatype={SETS_DATATYPE_CELL}
        onError={err => PubSub.publish(STATUS_WARN, err)}
        onCheckNode={onCheckNode}
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
        onExportLevelZeroNodeJSON={onExportLevelZeroNodeJSON}
        onExportLevelZeroNodeTabular={onExportLevelZeroNodeTabular}
        onExportSetJSON={onExportSetJSON}
        onUnion={onUnion}
        onIntersection={onIntersection}
        onComplement={onComplement}
        onView={onView}
        hasCheckedSetsToView={treeHasCheckedSetsToView(tree)}
        hasCheckedSetsToUnion={treeHasCheckedSetsToUnion(tree)}
        hasCheckedSetsToIntersect={treeHasCheckedSetsToIntersect(tree)}
        hasCheckedSetsToComplement={treeHasCheckedSetsToComplement(tree)}
      />
    </TitleInfo>
  );
}
