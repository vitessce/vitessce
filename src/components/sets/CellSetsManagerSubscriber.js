import React, {
  useEffect,
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
import {
  treeExportLevelZeroNode,
  treeExportSet,
  treeToExpectedCheckedLevel,
  nodeToLevelDescendantNamePaths,
  treeToCheckedSetOperations,
  treeToIntersection,
  treeToUnion,
  treeToComplement,
  treeFindNodeByNamePath,
  treesConflict,
} from './reducer';
import {
  isEqualOrPrefix,
  tryRenamePath,
} from './utils';
import {
  downloadForUser,
  handleExportJSON,
  handleExportTabular,
} from './io';
import {
  FILE_EXTENSION_JSON,
  FILE_EXTENSION_TABULAR,
} from './constants';
import { useUrls, useReady } from '../hooks';
import {
  setCellSelection,
  mergeCellSets,
  initializeCellSetColor,
  getNextNumberedNodeName,
} from '../utils';
import { useCellsData, useCellSetsData } from '../data-hooks';

const SETS_DATATYPE_CELL = 'cell';
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
    initializeColor = true,
    theme,
  } = props;

  const loaders = useLoaders();
  const setWarning = useSetWarning();

  // Get "props" from the coordination space.
  const [{
    dataset,
    cellSetSelection,
    cellSetColor,
    cellColorEncoding,
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

  const [autoSetSelections, setAutoSetSelections] = useState({});
  const [autoSetColors, setAutoSetColors] = useState({});

  const [cellSetExpansion, setCellSetExpansion] = useState([]);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    setAutoSetSelections({});
    setAutoSetColors({});
    setCellSetExpansion([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(loaders, dataset, setItemIsReady, addUrl, true,
    (data) => {
      if (data && data.tree.length >= 1) {
        // eslint-disable-next-line no-underscore-dangle
        const newAutoSetSelectionParentName = data.tree[0].name;
        const newAutoSetSelections = data.tree[0].children
          .map(node => ([newAutoSetSelectionParentName, node.name]));
        setAutoSetSelections(prev => ({
          [dataset]: [
            ...(prev[dataset] || []),
            ...newAutoSetSelections,
          ],
        }));

        const newAutoSetColors = initializeCellSetColor(data, cellSetColor);
        setAutoSetColors(prev => ({
          [dataset]: [
            ...(prev[dataset] || []),
            ...newAutoSetColors,
          ],
        }));
      } else {
        setAutoSetSelections(prev => ({ [dataset]: (prev[dataset] || []) }));
        setAutoSetColors(prev => ({ [dataset]: (prev[dataset] || []) }));
      }
    });

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

  // Try to set up the colored sets array automatically if undefined.
  useEffect(() => {
    // Only initialize cell sets if the value of `cellSetColor` is `null`
    // and the `initializeColor` prop is `true`.
    if (
      isReady
      && initializeColor
      && autoSetColors[dataset]
      && !cellSetColor
    ) {
      setCellSetColor(autoSetColors[dataset]);
    }
  }, [dataset, autoSetColors, isReady, setCellSetColor, initializeColor, cellSetColor]);

  // Get an array of all cell IDs to use for set complement operations.
  const allCellIds = useMemo(() => (cells ? Object.keys(cells) : []), [cells]);

  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  function setCellSetColorEncoding() {
    setCellColorEncoding('cellSetSelection');
  }

  // Merged cell sets are only to be used for convenience when reading
  // (if writing: update either `cellSets` _or_ `additionalCellSets`).
  const mergedCellSets = mergeCellSets(cellSets, additionalCellSets);

  // Infer the state of the "checked level" radio button based on the selected cell sets.
  const checkedLevel = useMemo(() => {
    if (cellColorEncoding === 'cellSetSelection'
    && cellSetSelection && cellSetSelection.length > 0
    && mergedCellSets) {
      return treeToExpectedCheckedLevel(mergedCellSets, cellSetSelection);
    }
    return null;
  }, [cellSetSelection, mergedCellSets, cellColorEncoding]);

  // Determine which of the set operation buttons should be enabled/disabled
  // based on the currently selected sets.
  const {
    hasCheckedSetsToUnion = false,
    hasCheckedSetsToIntersect = false,
    hasCheckedSetsToComplement = false,
  } = useMemo(() => {
    if (cellSetSelection && mergedCellSets) {
      return treeToCheckedSetOperations(mergedCellSets, cellSetSelection, allCellIds);
    }
    return {};
  }, [cellSetSelection, mergedCellSets, allCellIds]);

  // Callback functions

  // The user wants to select all nodes at a particular hierarchy level.
  function onCheckLevel(levelZeroName, levelIndex) {
    const lzn = mergedCellSets.tree.find(n => n.name === levelZeroName);
    if (lzn) {
      const newCellSetSelection = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
      setCellSetSelection(newCellSetSelection);
      setCellSetColorEncoding();
    }
  }

  // The user wants to check or uncheck a cell set node.
  function onCheckNode(targetKey, checked) {
    const targetPath = (Array.isArray(targetKey) ? targetKey : targetKey.split('___'));
    if (!targetKey) {
      return;
    }
    if (checked) {
      setCellSetSelection([...cellSetSelection, targetPath]);
    } else {
      setCellSetSelection(cellSetSelection.filter(d => !isEqual(d, targetPath)));
    }
    setCellSetColorEncoding();
  }

  // The user wants to expand or collapse a node in the tree.
  function onExpandNode(expandedKeys, targetKey, expanded) {
    if (expanded) {
      setCellSetExpansion(prev => ([...prev, targetKey.split('___')]));
    } else {
      setCellSetExpansion(prev => prev.filter(d => !isEqual(d, targetKey.split('___'))));
    }
  }

  // TODO: re-implement using dropPath and dragPath rather than keys.
  function onDropNode(/* dropKey, dragKey, dropPosition, dropToGap */) {
    /*
    const dropPath = dropKey.split("___");
    const dragPath = dragKey.split("___");
    console.log(dropPath, dragPath, dropPosition, dropToGap);
    */
  }

  // The user wants to change the color of a cell set node.
  function onNodeSetColor(targetPath, color) {
    // Replace the color if an array element for this path already exists.
    const prevNodeColor = cellSetColor?.find(d => isEqual(d.path, targetPath));
    if (!prevNodeColor) {
      setCellSetColor([
        ...(cellSetColor || []),
        {
          path: targetPath,
          color,
        },
      ]);
    } else {
      setCellSetColor([
        ...cellSetColor.filter(d => !isEqual(d.path, targetPath)),
        {
          path: targetPath,
          color,
        },
      ]);
    }
  }

  // The user wants to change the name of a cell set node.
  function onNodeSetName(targetPath, name) {
    const nextNamePath = [...targetPath];
    nextNamePath.pop();
    nextNamePath.push(name);

    // Recursively check whether each node path
    // matches the path or a prefix of the path of the node to rename.
    // If so, rename the node using the new path.
    function renameNode(node, prevPath) {
      if (isEqual([...prevPath, node.name], targetPath)) {
        return {
          ...node,
          name,
        };
      }
      if (!node.children) {
        return node;
      }
      return {
        ...node,
        children: node.children.map(c => renameNode(c, [...prevPath, node.name])),
      };
    }
    const nextAdditionalCellSets = {
      ...additionalCellSets,
      tree: additionalCellSets.tree.map(lzn => renameNode(lzn, [])),
    };
    // Change all paths that have this node as a prefix (i.e. descendants).
    const nextCellSetColor = cellSetColor.map(d => ({
      path: tryRenamePath(targetPath, d.path, nextNamePath),
      color: d.color,
    }));
    const nextCellSetSelection = cellSetSelection.map(d => (
      tryRenamePath(targetPath, d, nextNamePath)
    ));
    const nextCellSetExpansion = cellSetExpansion.map(d => (
      tryRenamePath(targetPath, d, nextNamePath)
    ));
    // Need to update the node path everywhere it may be present.
    setAdditionalCellSets(nextAdditionalCellSets);
    setCellSetColor(nextCellSetColor);
    setCellSetSelection(nextCellSetSelection);
    setCellSetExpansion(nextCellSetExpansion);
  }

  // Each time the user types while renaming a cell set node,
  // we need to check whether the potential new name conflicts
  // with any existing cell set node names.
  // If there are conflicts, we want to disable the "Save" button.
  function onNodeCheckNewName(targetPath, name) {
    const nextNamePath = [...targetPath];
    nextNamePath.pop();
    nextNamePath.push(name);
    const hasConflicts = (
      !isEqual(targetPath, nextNamePath)
      && treeFindNodeByNamePath(additionalCellSets, nextNamePath)
    );
    return hasConflicts;
  }

  // The user wants to delete a cell set node, and has confirmed their choice.
  function onNodeRemove(targetPath) {
    // Recursively check whether each node path
    // matches the path of the node to delete.
    // If so, return null, and then always use
    // .filter(Boolean) to eliminate any null array elements.
    function filterNode(node, prevPath) {
      if (isEqual([...prevPath, node.name], targetPath)) {
        return null;
      }
      if (!node.children) {
        return node;
      }
      return {
        ...node,
        children: node.children.map(c => filterNode(c, [...prevPath, node.name])).filter(Boolean),
      };
    }
    const nextAdditionalCellSets = {
      ...additionalCellSets,
      tree: additionalCellSets.tree.map(lzn => filterNode(lzn, [])).filter(Boolean),
    };
    // Delete state for all paths that have this node
    // path as a prefix (i.e. delete all descendents).
    const nextCellSetColor = cellSetColor.filter(d => !isEqualOrPrefix(targetPath, d.path));
    const nextCellSetSelection = cellSetSelection.filter(d => !isEqualOrPrefix(targetPath, d));
    const nextCellSetExpansion = cellSetExpansion.filter(d => !isEqualOrPrefix(targetPath, d));
    setAdditionalCellSets(nextAdditionalCellSets);
    setCellSetColor(nextCellSetColor);
    setCellSetSelection(nextCellSetSelection);
    setCellSetExpansion(nextCellSetExpansion);
  }

  // The user wants to view (i.e. select) a particular node,
  // or its expanded descendents.
  function onNodeView(targetPath) {
    // If parent node is clicked, and if it is expanded,
    // then select the expanded descendent nodes.
    const setsToView = [];
    // Recursively determine which descendent nodes are currently expanded.
    function viewNode(node, nodePath) {
      if (cellSetExpansion.find(expandedPath => isEqual(nodePath, expandedPath))) {
        if (node.children) {
          node.children.forEach((c) => {
            viewNode(c, [...nodePath, c.name]);
          });
        } else {
          setsToView.push(nodePath);
        }
      } else {
        setsToView.push(nodePath);
      }
    }
    const targetNode = treeFindNodeByNamePath(mergedCellSets, targetPath);
    viewNode(targetNode, targetPath);
    setCellSetSelection(setsToView);
    setCellSetColorEncoding();
  }

  // The user wants to create a new level zero node.
  function onCreateLevelZeroNode() {
    const nextName = getNextNumberedNodeName(additionalCellSets?.tree, 'My hierarchy ');
    setAdditionalCellSets({
      ...(additionalCellSets || {}),
      tree: [
        ...(additionalCellSets ? additionalCellSets.tree : []),
        {
          name: nextName,
          children: [],
        },
      ],
    });
  }

  // The user wants to create a new node corresponding to
  // the union of the selected sets.
  function onUnion() {
    const newSet = treeToUnion(mergedCellSets, cellSetSelection);
    setCellSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      'Union ',
    );
    setCellSetColorEncoding();
  }

  // The user wants to create a new node corresponding to
  // the intersection of the selected sets.
  function onIntersection() {
    const newSet = treeToIntersection(mergedCellSets, cellSetSelection);
    setCellSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      'Intersection ',
    );
    setCellSetColorEncoding();
  }

  // The user wants to create a new node corresponding to
  // the complement of the selected sets.
  function onComplement() {
    const newSet = treeToComplement(mergedCellSets, cellSetSelection, allCellIds);
    setCellSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      'Complement ',
    );
    setCellSetColorEncoding();
  }

  // The user wants to import a cell set hierarchy,
  // probably from a CSV or JSON file.
  function onImportTree(treeToImport) {
    // Check for any naming conflicts with the current sets
    // (both user-defined and dataset-defined) before importing.
    const hasConflict = treesConflict(mergedCellSets, treeToImport);
    if (!hasConflict) {
      setAdditionalCellSets({
        ...(additionalCellSets || {}),
        tree: [
          ...(additionalCellSets ? additionalCellSets.tree : []),
          ...treeToImport.tree,
        ],
      });
      // Automatically initialize set colors for the imported sets.
      const importAutoSetColors = initializeCellSetColor(treeToImport, cellSetColor);
      setCellSetColor([
        ...cellSetColor,
        ...importAutoSetColors,
      ]);
    }
  }

  // The user wants to download a particular hierarchy to a JSON file.
  function onExportLevelZeroNodeJSON(nodePath) {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_CELL);
    downloadForUser(
      handleExportJSON(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-hierarchy.${FILE_EXTENSION_JSON}`,
    );
  }

  // The user wants to download a particular hierarchy to a CSV file.
  function onExportLevelZeroNodeTabular(nodePath) {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_CELL);
    downloadForUser(
      handleExportTabular(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-hierarchy.${FILE_EXTENSION_TABULAR}`,
    );
  }

  // The user wants to download a particular set to a JSON file.
  function onExportSetJSON(nodePath) {
    const { setToExport, nodeName } = treeExportSet(mergedCellSets, nodePath);
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

        datatype={SETS_DATATYPE_CELL}
        onError={setWarning}
        onCheckNode={onCheckNode}
        onExpandNode={onExpandNode}
        onDropNode={onDropNode}
        onCheckLevel={onCheckLevel}
        onNodeSetColor={onNodeSetColor}
        onNodeSetName={onNodeSetName}
        onNodeCheckNewName={onNodeCheckNewName}
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
        hasCheckedSetsToUnion={hasCheckedSetsToUnion}
        hasCheckedSetsToIntersect={hasCheckedSetsToIntersect}
        hasCheckedSetsToComplement={hasCheckedSetsToComplement}
      />
    </TitleInfo>
  );
}
