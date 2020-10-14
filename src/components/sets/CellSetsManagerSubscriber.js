/* eslint-disable */
import React, {
  useEffect,
  useReducer,
  useState,
  useMemo,
} from 'react';
import isEqual from 'lodash/isEqual';
import packageJson from '../../../package.json';
import {
  useCoordination,
  useLoaders,
  useSetWarning,
} from '../../app/state/hooks';
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
  treeCheckNameConflictsByKey,
  treeToExpectedCheckedLevel,
  nodeToLevelDescendantNamePaths,
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
import { setCellSelection, mergeCellSets } from '../utils';
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
    coordinationScopes,
    removeGridComponent,
    initializeSelection = true,
    theme,
  } = props;

  const loaders = useLoaders();
  const setWarning = useSetWarning();

  // Get "props" from the coordination space.
  const [{
    dataset,
    cellSetSelection,
    cellSetColor,
    additionalCellSets,
  }, {
    setCellSetSelection,
    setCellColorEncoding,
    setCellSetColor,
    setAdditionalCellSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSets, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    CELL_SETS_DATA_TYPES,
  );

  const [tree, dispatch] = useReducer(reducer, initialTree);
  const [autoSetSelections, setAutoSetSelections] = useState({});

  const [cellSetExpansion, setCellSetExpansion] = useState([]);

  console.log(cellSetColor)

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    setAutoSetSelections({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(loaders, dataset, setItemIsReady, addUrl, true,
    (data) => {
      if (data && data.tree.length >= 1) {
        // eslint-disable-next-line no-underscore-dangle
        const newAutoSetSelectionParentName = data.tree[0].name;
        const newAutoSetSelections = data.tree[0].children.map(node => ([newAutoSetSelectionParentName, node.name]));
        setAutoSetSelections(prev => ({
          [dataset]: [
            ...(prev[dataset] || []),
            ...newAutoSetSelections,
          ],
        }));
      } else {
        setAutoSetSelections(prev => ({ [dataset]: (prev[dataset] || []) }));
      }
    });
  
  //console.log(cellSets?.tree, additionalCellSets);

  // Try to set up the selected sets array automatically if undefined.
  useEffect(() => {
    // Only initialize cell sets if the value of `cellSetSelection` is `null`
    // and the `initializeSelection` prop is `true`.
    if (
      isReady
      && initializeSelection
      && autoSetSelections[dataset]
      && !cellSetSelection
    ) {
      setCellSetSelection(autoSetSelections[dataset]);
    }
  }, [dataset, autoSetSelections, isReady, cellSetSelection,
    setCellSetSelection, initializeSelection]);

  // Set the tree in the reducer when it loads initially.
  useEffect(() => {
    if (cellSets) {
      dispatch({ type: ACTION.SET, tree: cellSets });
    }
    if (cellSets && cells) {
      dispatch({ type: ACTION.SET_TREE_ITEMS, cellIds: Object.keys(cells) });
    }
  }, [cellSets, cells]);

  // We want the "checked level" radio button to be initialized even when
  // the tree object may not explicitly have the `._state.checkedLevel` set up.
  const checkedLevel = useMemo(() => {
    if (cellSetSelection && tree) {
      return treeToExpectedCheckedLevel(tree, cellSetSelection);
    }
    return null;
  }, [cellSetSelection, tree]);

  // Get an array of all cell IDs to use for set complement operations.
  const allCellIds = useMemo(() => {
    return (cells ? Object.keys(cells) : []);
  }, [cells]);


  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  function setCellSetColorEncoding() {
    setCellColorEncoding('cellSetSelection');
  }

  // Merged cell sets are only to be used for convenience when READING
  // (if WRITING: update either `cellSets` _or_ `additionalCellSets`).
  const mergedCellSets = mergeCellSets(cellSets, additionalCellSets);

  // Callback functions
  function onCheckLevel(levelZeroName, levelIndex) {
    // TODO: set cell
    const lzn = mergedCellSets.tree.find(n => n.name === levelZeroName);
    if(lzn) {
      const newCellSetSelection = nodeToLevelDescendantNamePaths(lzn, levelIndex - 1, [], true)
      console.log(newCellSetSelection);
      setCellSetSelection(newCellSetSelection);
      setCellSetColorEncoding();
    }
  }

  function onCheckNode(targetKey, checked) {
    const targetPath = targetKey.split("___");
    if(!targetKey) {
      return;
    }
    if(checked) {
      setCellSetSelection([...cellSetSelection, targetPath]);
    } else {
      setCellSetSelection(cellSetSelection.filter(d => !isEqual(d, targetPath)));
    }
    setCellSetColorEncoding();
  }

  function onExpandNode(expandedKeys, targetKey, expanded) {
    setCellSetExpansion(expandedKeys.map(d => d.split("___")));
  }

  function onDropNode(dropKey, dragKey, dropPosition, dropToGap) {
    // dispatch({ type: ACTION.DROP_NODE, dropKey, dragKey, dropPosition, dropToGap });
  }

  function onNodeSetColor(targetPath, color) {
    // Replace the color if an array element for this path already exists.
    const prevNodeColor = cellSetColor?.find(d => isEqual(d.path, targetPath));
    if(!prevNodeColor) {
      setCellSetColor([
        ...(cellSetColor ? cellSetColor : []),
        {
          path: targetPath,
          color
        }
      ]);
    } else {
      setCellSetColor([
        ...cellSetColor.filter(d => !isEqual(d.path, targetPath)),
        {
          path: targetPath,
          color
        }
      ]);
    }
  }

  function onNodeSetName(targetKey, name, stopEditing) {
    // dispatch({ type: ACTION.SET_NODE_NAME, targetKey, name, stopEditing });
  }

  function onNodeCheckNewName(targetKey, name) {
    return treeCheckNameConflictsByKey(tree, name, targetKey);
  }

  function onNodeSetIsEditing(targetKey, value) {
    // dispatch({ type: ACTION.SET_NODE_IS_EDITING, targetKey, value });
  }

  function onNodeRemove(targetKey) {
    // dispatch({ type: ACTION.REMOVE_NODE, targetKey });
  }

  function onNodeView(targetKey) {
    // dispatch({ type: ACTION.VIEW_NODE, targetKey });
    setCellSetColorEncoding();
  }

  function onCreateLevelZeroNode() {
    // dispatch({ type: ACTION.CREATE_LEVEL_ZERO_NODE });
  }

  function onUnion() {
    // dispatch({ type: ACTION.UNION_CHECKED });
    setCellSetColorEncoding();
  }

  function onIntersection() {
    // dispatch({ type: ACTION.INTERSECTION_CHECKED });
    setCellSetColorEncoding();
  }

  function onComplement() {
    // dispatch({ type: ACTION.COMPLEMENT_CHECKED });
    setCellSetColorEncoding();
  }

  function onView() {
    // dispatch({ type: ACTION.VIEW_CHECKED });
    setCellSetColorEncoding();
  }

  function onImportTree(treeToImport) {
    // dispatch({ type: ACTION.IMPORT, levelZeroNodes: treeToImport.tree });
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
        setColor={cellSetColor}
        sets={cellSets}
        additionalSets={additionalCellSets}
        levelSelection={checkedLevel}
        setSelection={cellSetSelection}
        setExpansion={cellSetExpansion}

        setSetExpansion={setCellSetExpansion}

        datatype={SETS_DATATYPE_CELL}
        onError={setWarning}
        onCheckNode={onCheckNode}
        onExpandNode={onExpandNode}
        onDropNode={onDropNode}
        onCheckLevel={onCheckLevel}
        onNodeSetColor={onNodeSetColor}
        onNodeSetName={onNodeSetName}
        onNodeCheckNewName={onNodeCheckNewName}
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
        //hasCheckedSetsToView={treeHasCheckedSetsToView(tree)}
        //hasCheckedSetsToUnion={treeHasCheckedSetsToUnion(tree)}
        //hasCheckedSetsToIntersect={treeHasCheckedSetsToIntersect(tree)}
        //hasCheckedSetsToComplement={treeHasCheckedSetsToComplement(tree)}
        hasCheckedSetsToView={true}
        hasCheckedSetsToUnion={true}
        hasCheckedSetsToIntersect={true}
        hasCheckedSetsToComplement={true}
      />
    </TitleInfo>
  );
}
