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
  treeToIntersection,
  treeToUnion,
  treeToComplement,
  treeFindNodeByNamePath,
  treesConflict,
  initializeCellSetColor,
  nodeTransform,
  nodeAppendChild,
  nodePrependChild,
  nodeInsertChild,
  filterNode,
  treeInitialize,
} from './cell-set-utils';
import {
  isEqualOrPrefix,
  tryRenamePath,
  PATH_SEP,
} from './utils';
import {
  downloadForUser,
  handleExportJSON,
  handleExportTabular,
  tryUpgradeTreeToLatestSchema,
} from './io';
import {
  FILE_EXTENSION_JSON,
  FILE_EXTENSION_TABULAR,
  SETS_DATATYPE_CELL,
} from './constants';
import { useUrls, useReady } from '../hooks';
import {
  setCellSelection,
  mergeCellSets,
  getNextNumberedNodeName,
} from '../utils';
import { useCellsData, useCellSetsData } from '../data-hooks';

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
    additionalCellSets,
  }, {
    setCellSetSelection,
    setCellColorEncoding,
    setCellSetColor,
    setAdditionalCellSets,
    setGeneSelection,
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

  // Validate and upgrade the additionalCellSets.
  useEffect(() => {
    if (additionalCellSets) {
      let upgradedCellSets;
      try {
        upgradedCellSets = tryUpgradeTreeToLatestSchema(additionalCellSets, SETS_DATATYPE_CELL);
      } catch (e) {
        setWarning(e.message);
        return;
      }
      setAdditionalCellSets(upgradedCellSets);
    }
  }, [additionalCellSets, setAdditionalCellSets, setWarning]);

  // Get an array of all cell IDs to use for set complement operations.
  const allCellIds = useMemo(() => (cells ? Object.keys(cells) : []), [cells]);

  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  function setCellSetColorEncoding() {
    setGeneSelection([]);
    setCellColorEncoding('cellSetSelection');
  }

  // Merged cell sets are only to be used for convenience when reading
  // (if writing: update either `cellSets` _or_ `additionalCellSets`).
  const mergedCellSets = useMemo(
    () => mergeCellSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // Infer the state of the "checked level" radio button based on the selected cell sets.
  const checkedLevel = useMemo(() => {
    if (cellSetSelection && cellSetSelection.length > 0
    && mergedCellSets && mergedCellSets.tree.length > 0) {
      return treeToExpectedCheckedLevel(mergedCellSets, cellSetSelection);
    }
    return null;
  }, [cellSetSelection, mergedCellSets]);

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
    const targetPath = (Array.isArray(targetKey) ? targetKey : targetKey.split(PATH_SEP));
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
      setCellSetExpansion(prev => ([...prev, targetKey.split(PATH_SEP)]));
    } else {
      setCellSetExpansion(prev => prev.filter(d => !isEqual(d, targetKey.split(PATH_SEP))));
    }
  }

  // The user dragged a tree node and dropped it somewhere else in the tree
  // to re-arrange or re-order the nodes.
  // We need to verify that their drop target is valid, and if so, complete
  // the tree re-arrangement.
  function onDropNode(dropKey, dragKey, dropPosition, dropToGap) {
    const dropPath = dropKey.split(PATH_SEP);
    const dropNode = treeFindNodeByNamePath(additionalCellSets, dropPath);
    if (!dropNode.children && !dropToGap) {
      // Do not allow a node with a set (i.e. leaf) to become a child of another node with a set,
      // as this will result in an internal node having a set, which we do not allow.
      return;
    }
    const dropNodeLevel = dropPath.length - 1;
    const dropNodeIsLevelZero = dropNodeLevel === 0;

    // Get drag node.
    const dragPath = dragKey.split(PATH_SEP);
    const dragNode = treeFindNodeByNamePath(additionalCellSets, dragPath);

    if (dropNodeIsLevelZero && dropToGap && !dragNode.children) {
      // Do not allow a leaf node to become a level zero node.
      return;
    }

    let dropParentNode;
    let dropParentPath;
    let dropNodeCurrIndex;
    if (!dropNodeIsLevelZero) {
      dropParentPath = dropPath.slice(0, -1);
      dropParentNode = treeFindNodeByNamePath(additionalCellSets, dropParentPath);
      dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.name === dropNode.name);
    } else {
      dropNodeCurrIndex = additionalCellSets.tree.findIndex(
        lzn => lzn.name === dropNode.name,
      );
    }
    // Further, only allow dragging if the dragged node will have a unique
    // name among its new siblings.
    let hasSiblingNameConflict;
    const dragNodeName = dragNode.name;
    if (!dropNodeIsLevelZero && dropToGap) {
      hasSiblingNameConflict = dropParentNode.children
        .find(c => c !== dragNode && c.name === dragNodeName);
    } else if (!dropToGap) {
      hasSiblingNameConflict = dropNode.children
        .find(c => c !== dragNode && c.name === dragNodeName);
    } else {
      hasSiblingNameConflict = additionalCellSets.tree
        .find(lzn => lzn !== dragNode && lzn.name === dragNodeName);
    }

    if (hasSiblingNameConflict) {
      return;
    }

    // Remove the dragged object from its current position.
    // Recursively check whether each node path
    // matches the path of the node to delete.
    // If so, return null, and then always use
    // .filter(Boolean) to eliminate any null array elements.
    const nextAdditionalCellSets = {
      ...additionalCellSets,
      tree: additionalCellSets.tree.map(lzn => filterNode(lzn, [], dragPath)).filter(Boolean),
    };

    // Update index values after temporarily removing the dragged node.
    // Names are unique as children of their parents.
    if (!dropNodeIsLevelZero) {
      dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.name === dropNode.name);
    } else {
      dropNodeCurrIndex = nextAdditionalCellSets.tree.findIndex(
        lzn => lzn.name === dropNode.name,
      );
    }
    let newDragPath = [];
    if (!dropToGap || !dropNodeIsLevelZero) {
      let addChildFunction;
      let checkPathFunction;
      const newPath = [];
      if (!dropToGap) {
        // Append the dragNode to dropNode's children if dropping _onto_ the dropNode.
        // Set dragNode as the last child of dropNode.
        addChildFunction = n => nodeAppendChild(n, dragNode);
        checkPathFunction = path => isEqual(path, dropPath);
      } else if (!dropNodeIsLevelZero) {
        // Prepend or insert the dragNode if dropping _between_ (above or below dropNode).
        // The dropNode is at a level greater than zero,
        // so it has a parent.
        checkPathFunction = path => isEqual(path, dropParentPath);
        if (dropPosition === -1) {
          // Set dragNode as first child of dropParentNode.
          addChildFunction = n => nodePrependChild(n, dragNode);
        } else {
          // Set dragNode before or after dropNode.
          const insertIndex = dropNodeCurrIndex + (dropPosition > dropNodeCurrIndex ? 1 : 0);
          addChildFunction = n => nodeInsertChild(n, dragNode, insertIndex);
        }
      }
      nextAdditionalCellSets.tree = nextAdditionalCellSets.tree.map(
        node => nodeTransform(
          node,
          (n, path) => checkPathFunction(path),
          (n) => {
            const newNode = addChildFunction(n);
            return newNode;
          },
          newPath,
        ),
      );
      // Done
      setAdditionalCellSets(nextAdditionalCellSets);
      newDragPath = [...newPath[0], dragNode.name];
      setCellSetSelection([newDragPath]);
    } else if (dropPosition === -1) {
      // We need to drop the dragNode to level zero,
      // and level zero nodes do not have parents.
      // Set dragNode as first level zero node of the tree.
      nextAdditionalCellSets.tree.unshift(dragNode);
      setAdditionalCellSets(nextAdditionalCellSets);
      newDragPath = [dragNode.name];
      setCellSetSelection([newDragPath]);
    } else {
      // Set dragNode before or after dropNode in level zero.
      const insertIndex = dropNodeCurrIndex + (dropPosition > dropNodeCurrIndex ? 1 : 0);
      const newLevelZero = Array.from(nextAdditionalCellSets.tree);
      newLevelZero.splice(insertIndex, 0, dragNode);
      nextAdditionalCellSets.tree = newLevelZero;
      setAdditionalCellSets(nextAdditionalCellSets);
      newDragPath = [dragNode.name];
      setCellSetSelection([newDragPath]);
    }
    const oldColors = cellSetColor.filter(
      i => isEqualOrPrefix(dragPath, i.path),
    );
    const newColors = oldColors.map(
      i => (
        {
          ...i,
          path: !isEqual(i.path, dragPath)
            ? newDragPath.concat(i.path.slice(dragPath.length))
            : newDragPath,
        }
      ),
    );
    const newCellSetColor = cellSetColor.filter(
      i => !isEqualOrPrefix(dragPath, i.path),
    );
    newCellSetColor.push(...newColors);
    setCellSetColor(newCellSetColor);
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
    const nextAdditionalCellSets = {
      ...additionalCellSets,
      tree: additionalCellSets.tree.map(lzn => filterNode(lzn, [], targetPath)).filter(Boolean),
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
      ...(additionalCellSets || treeInitialize(SETS_DATATYPE_CELL)),
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
      setCellColorEncoding,
      'Union ',
    );
  }

  // The user wants to create a new node corresponding to
  // the intersection of the selected sets.
  function onIntersection() {
    const newSet = treeToIntersection(mergedCellSets, cellSetSelection);
    setCellSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Intersection ',
    );
  }

  // The user wants to create a new node corresponding to
  // the complement of the selected sets.
  function onComplement() {
    const newSet = treeToComplement(mergedCellSets, cellSetSelection, allCellIds);
    setCellSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Complement ',
    );
  }

  // The user wants to import a cell set hierarchy,
  // probably from a CSV or JSON file.
  function onImportTree(treeToImport) {
    // Check for any naming conflicts with the current sets
    // (both user-defined and dataset-defined) before importing.
    const hasConflict = treesConflict(mergedCellSets, treeToImport);
    if (!hasConflict) {
      setAdditionalCellSets({
        ...(additionalCellSets || treeInitialize(SETS_DATATYPE_CELL)),
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
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_CELL, cellSetColor);
    downloadForUser(
      handleExportJSON(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-hierarchy.${FILE_EXTENSION_JSON}`,
    );
  }

  // The user wants to download a particular hierarchy to a CSV file.
  function onExportLevelZeroNodeTabular(nodePath) {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_CELL, cellSetColor);
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
        draggable
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
        hasCheckedSetsToUnion={cellSetSelection?.length > 1}
        hasCheckedSetsToIntersect={cellSetSelection?.length > 1}
        hasCheckedSetsToComplement={cellSetSelection?.length > 0}
      />
    </TitleInfo>
  );
}
