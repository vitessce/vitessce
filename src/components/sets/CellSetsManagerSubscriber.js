/* eslint-disable */
import React, {
  useEffect,
  useReducer,
  useState,
} from 'react';
import PubSub from 'pubsub-js';
import isEqual from 'lodash/isEqual';
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
  treeToSetNamesByKeys,
} from './reducer';
import {
  handleExportJSON, downloadForUser,
  handleExportTabular,
} from './io';
import {
  FILE_EXTENSION_JSON,
  FILE_EXTENSION_TABULAR,
} from './constants';
import { useUrls, useReady } from '../hooks';
import { useCellsData, useCellSetsData } from '../data-hooks';

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
 * @param {boolean} initializeSelection Should an event be emitted upon initialization,
 * so that cells are colored by some heuristic (e.g. the first clustering in the cell_sets tree)?
 */
export default function CellSetsManagerSubscriber(props) {
  const {
    loaders,
    coordinationScopes,
    removeGridComponent,
    initializeSelection = true,
    theme,
  } = props;

  // Get "props" from the coordination space.
  const [{
    dataset,
    cellSelection,
    cellSetSelection,
  }, {
    setCellSelection,
    setCellSetSelection,
    setCellColorEncoding,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSets, coordinationScopes);


  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    CELL_SETS_DATA_TYPES,
  );

  const [autoSetSelections, setAutoSetSelections] = useState([]);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(loaders, dataset, setItemIsReady, addUrl, true, (data) => {
    if(data && data.tree.length >= 1) {
      const newAutoSetSelectionKeys = data.tree[0].children.map(node => node._state.key);
      const newAutoSetSelections = treeToSetNamesByKeys(data, newAutoSetSelectionKeys);
      setAutoSetSelections(newAutoSetSelections);
    }
  });

  const [tree, dispatch] = useReducer(reducer, initialTree);

  // Set the tree in the reducer when it loads initially.
  useEffect(() => {
    if (cellSets) {
      dispatch({ type: ACTION.SET, tree: cellSets });
    }
    if (cellSets && cells) {
      dispatch({ type: ACTION.SET_TREE_ITEMS, cellIds: Object.keys(cells) });
    }
  }, [cellSets, cells]);


  // Publish the updated tree when the tree changes.
  useEffect(() => {
    if (!loaders[dataset] || !tree || (tree && tree._state && tree._state.publish === false)) {
      return;
    }
    if (loaders[dataset].loaders['cell-sets']) {
      loaders[dataset].loaders['cell-sets'].publish(tree);
    }
    // Create cell set selections using the names of the "visible" sets.
    const visibleSetNames = treeToVisibleSetNames(tree);
    if (!isEqual(visibleSetNames, cellSetSelection)) {
      setCellSetSelection(visibleSetNames);
      // Create a cell selection consisting of all cells in the "visible" sets.
      const [visibleCells] = treeToVisibleCells(tree);
      if(!isEqual(visibleCells, cellSelection)) {
        setCellSelection(visibleCells);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  // Try to set up the selected sets array automatically if null or undefined.
  useEffect(() => {
    if(isReady && !cellSetSelection && initializeSelection) {
      setCellSetSelection(autoSetSelections);
    }
  }, [autoSetSelections, isReady, cellSetSelection, setCellSetSelection, initializeSelection]);

  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  function setCellSetColorEncoding() {
    setCellColorEncoding('cellSetSelection');
  }

  // Listen for changes to `cellSelection`, and create a new
  // set when there is a new selection available.
  useEffect(() => {
    if (!cellSelection) {
      return;
    }
    // Only create a new set if the new set is different than the current selection.
    const [visibleCells] = treeToVisibleCells(tree);
    // Do not create a new set if the selected cells are the same as the currently visible cells.
    if(!isEqual(visibleCells, cellSelection)) {
      dispatch({ type: ACTION.SET_CURRENT_SET, cellIds: cellSelection });
    }
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
