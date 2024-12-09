import React, {
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { isEqual } from 'lodash-es';
import {
  useCoordination,
  useLoaders,
  useSetWarning,
  TitleInfo,
  useUrls, useReady,
  useObsSetsData,
} from '@vitessce/vit-s';
import { COMPONENT_COORDINATION_TYPES, ViewType, ViewHelpMapping } from '@vitessce/constants-internal';
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
  nodeTransform,
  nodeAppendChild,
  nodePrependChild,
  nodeInsertChild,
  filterNode,
  treeInitialize,
  initializeCellSetColor,

  isEqualOrPrefix,
  tryRenamePath,
  PATH_SEP,

  downloadForUser,
  handleExportJSON,
  handleExportTabular,
  tryUpgradeTreeToLatestSchema,

  FILE_EXTENSION_JSON,
  FILE_EXTENSION_TABULAR,
  SETS_DATATYPE_OBS,

  setObsSelection,
  mergeObsSets,
  getNextNumberedNodeName,
} from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';
import SetsManager from './SetsManager.js';

// TODO(monorepo): import package.json
// import packageJson from '../../../package.json';
const packageJson = { name: 'vitessce' };

/**
 * A subscriber wrapper around the SetsManager component
 * for the 'cell' datatype.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function ObsSetsManagerSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title: titleOverride,
    helpText = ViewHelpMapping.OBS_SETS,
  } = props;

  const loaders = useLoaders();
  const setWarning = useSetWarning();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    obsSetSelection: cellSetSelection,
    obsSetExpansion: cellSetExpansion,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
    obsColorEncoding: cellColorEncoding,
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetColor: setCellSetColor,
    setObsSetExpansion: setCellSetExpansion,
    setAdditionalObsSets: setAdditionalCellSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.OBS_SETS], coordinationScopes);

  const title = titleOverride || `${capitalize(obsType)} Sets`;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    if (cellSetExpansion && cellSetExpansion.length > 0) {
      setCellSetExpansion([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [{ obsIndex, obsSets: cellSets }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  const isReady = useReady([obsSetsStatus]);
  const urls = useUrls([obsSetsUrls]);

  // Validate and upgrade the additionalCellSets.
  useEffect(() => {
    if (additionalCellSets) {
      let upgradedCellSets;
      let didUpgrade;
      try {
        [upgradedCellSets, didUpgrade] = tryUpgradeTreeToLatestSchema(
          additionalCellSets, SETS_DATATYPE_OBS,
        );
      } catch (e) {
        setWarning(e.message);
        return;
      }
      if (didUpgrade) {
        setAdditionalCellSets(upgradedCellSets);
      }
    }
  }, [additionalCellSets, setAdditionalCellSets, setWarning]);

  // Get an array of all cell IDs to use for set complement operations.
  const allCellIds = useMemo(() => (obsIndex || []), [obsIndex]);

  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  const setCellSetColorEncoding = useCallback(() => {
    setCellColorEncoding('cellSetSelection');
  }, [setCellColorEncoding]);

  // Merged cell sets are only to be used for convenience when reading
  // (if writing: update either `cellSets` _or_ `additionalCellSets`).
  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
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
  const onCheckLevel = useCallback((levelZeroName, levelIndex) => {
    const lzn = mergedCellSets.tree.find(n => n.name === levelZeroName);
    if (lzn) {
      const newCellSetSelection = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
      setCellSetSelection(newCellSetSelection);
      setCellSetColorEncoding();
    }
  }, [mergedCellSets, setCellSetColorEncoding, setCellSetSelection]);

  // The user wants to check or uncheck a cell set node.
  const onCheckNode = useCallback((targetKey, checked) => {
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
  }, [cellSetSelection, setCellSetColorEncoding, setCellSetSelection]);

  // The user wants to expand or collapse a node in the tree.
  const onExpandNode = useCallback((expandedKeys, targetKey, expanded) => {
    const prevCellSetExpansion = cellSetExpansion || [];
    if (expanded) {
      setCellSetExpansion([...prevCellSetExpansion, targetKey.split(PATH_SEP)]);
    } else {
      const newCellSetExpansion = prevCellSetExpansion.filter(
        d => !isEqual(d, targetKey.split(PATH_SEP)),
      );
      setCellSetExpansion(newCellSetExpansion);
    }
  }, [cellSetExpansion, setCellSetExpansion]);

  // The user dragged a tree node and dropped it somewhere else in the tree
  // to re-arrange or re-order the nodes.
  // We need to verify that their drop target is valid, and if so, complete
  // the tree re-arrangement.
  const onDropNode = useCallback((dropKey, dragKey, dropPosition, dropToGap) => {
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
  }, [additionalCellSets, cellSetColor, setAdditionalCellSets, setCellSetColor,
    setCellSetSelection,
  ]);

  // The user wants to change the color of a cell set node.
  const onNodeSetColor = useCallback((targetPath, color) => {
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
  }, [cellSetColor, setCellSetColor]);

  // The user wants to change the name of a cell set node.
  const onNodeSetName = useCallback((targetPath, name) => {
    const nextNamePath = [...targetPath];
    nextNamePath.pop();
    nextNamePath.push(name);

    const prevCellSetExpansion = cellSetExpansion || [];

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
    const nextCellSetExpansion = prevCellSetExpansion.map(d => (
      tryRenamePath(targetPath, d, nextNamePath)
    ));
    // Need to update the node path everywhere it may be present.
    setAdditionalCellSets(nextAdditionalCellSets);
    setCellSetColor(nextCellSetColor);
    setCellSetSelection(nextCellSetSelection);
    setCellSetExpansion(nextCellSetExpansion);
  }, [additionalCellSets, cellSetColor, cellSetExpansion, cellSetSelection,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection,
    setCellSetExpansion,
  ]);

  // Each time the user types while renaming a cell set node,
  // we need to check whether the potential new name conflicts
  // with any existing cell set node names.
  // If there are conflicts, we want to disable the "Save" button.
  const onNodeCheckNewName = useCallback((targetPath, name) => {
    const nextNamePath = [...targetPath];
    nextNamePath.pop();
    nextNamePath.push(name);
    const hasConflicts = (
      !isEqual(targetPath, nextNamePath)
      && treeFindNodeByNamePath(additionalCellSets, nextNamePath)
    );
    return hasConflicts;
  }, [additionalCellSets]);

  // The user wants to delete a cell set node, and has confirmed their choice.
  const onNodeRemove = useCallback((targetPath) => {
    const prevCellSetExpansion = cellSetExpansion || [];
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
    const nextCellSetExpansion = prevCellSetExpansion.filter(d => !isEqualOrPrefix(targetPath, d));
    setAdditionalCellSets(nextAdditionalCellSets);
    setCellSetColor(nextCellSetColor);
    setCellSetSelection(nextCellSetSelection);
    setCellSetExpansion(nextCellSetExpansion);
  }, [additionalCellSets, cellSetColor, cellSetExpansion, cellSetSelection,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection,
    setCellSetExpansion,
  ]);

  // The user wants to view (i.e. select) a particular node,
  // or its expanded descendents.
  const onNodeView = useCallback((targetPath) => {
    // If parent node is clicked, and if it is expanded,
    // then select the expanded descendent nodes.
    const setsToView = [];
    // Recursively determine which descendent nodes are currently expanded.
    function viewNode(node, nodePath) {
      if (cellSetExpansion?.find(expandedPath => isEqual(nodePath, expandedPath))) {
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
  }, [cellSetExpansion, mergedCellSets, setCellSetColorEncoding, setCellSetSelection]);

  // The user wants to create a new level zero node.
  const onCreateLevelZeroNode = useCallback(() => {
    const nextName = getNextNumberedNodeName(additionalCellSets?.tree, 'My hierarchy ', '');
    setAdditionalCellSets({
      ...(additionalCellSets || treeInitialize(SETS_DATATYPE_OBS)),
      tree: [
        ...(additionalCellSets ? additionalCellSets.tree : []),
        {
          name: nextName,
          children: [],
        },
      ],
    });
  }, [additionalCellSets, setAdditionalCellSets]);

  // The user wants to create a new node corresponding to
  // the union of the selected sets.
  const onUnion = useCallback(() => {
    const newSet = treeToUnion(mergedCellSets, cellSetSelection);
    setObsSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Union ',
    );
  }, [additionalCellSets, cellSetColor, cellSetSelection, mergedCellSets,
    setAdditionalCellSets, setCellColorEncoding, setCellSetColor, setCellSetSelection,
  ]);

  // The user wants to create a new node corresponding to
  // the intersection of the selected sets.
  const onIntersection = useCallback(() => {
    const newSet = treeToIntersection(mergedCellSets, cellSetSelection);
    setObsSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Intersection ',
    );
  }, [additionalCellSets, cellSetColor, cellSetSelection, mergedCellSets,
    setAdditionalCellSets, setCellColorEncoding, setCellSetColor, setCellSetSelection,
  ]);

  // The user wants to create a new node corresponding to
  // the complement of the selected sets.
  const onComplement = useCallback(() => {
    const newSet = treeToComplement(mergedCellSets, cellSetSelection, allCellIds);
    setObsSelection(
      newSet, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Complement ',
    );
  }, [additionalCellSets, allCellIds, cellSetColor, cellSetSelection,
    mergedCellSets, setAdditionalCellSets, setCellColorEncoding, setCellSetColor,
    setCellSetSelection,
  ]);

  // The user wants to import a cell set hierarchy,
  // probably from a CSV or JSON file.
  const onImportTree = useCallback((treeToImport) => {
    // Check for any naming conflicts with the current sets
    // (both user-defined and dataset-defined) before importing.
    const hasConflict = treesConflict(mergedCellSets, treeToImport);
    if (!hasConflict) {
      setAdditionalCellSets({
        ...(additionalCellSets || treeInitialize(SETS_DATATYPE_OBS)),
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
  }, [additionalCellSets, cellSetColor, mergedCellSets, setAdditionalCellSets,
    setCellSetColor,
  ]);

  // The user wants to download a particular hierarchy to a JSON file.
  const onExportLevelZeroNodeJSON = useCallback((nodePath) => {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_OBS, cellSetColor, theme);
    downloadForUser(
      handleExportJSON(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-hierarchy.${FILE_EXTENSION_JSON}`,
    );
  }, [cellSetColor, mergedCellSets, theme]);

  // The user wants to download a particular hierarchy to a CSV file.
  const onExportLevelZeroNodeTabular = useCallback((nodePath) => {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_OBS, cellSetColor, theme);
    downloadForUser(
      handleExportTabular(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-hierarchy.${FILE_EXTENSION_TABULAR}`,
    );
  }, [cellSetColor, mergedCellSets, theme]);

  // The user wants to download a particular set to a JSON file.
  const onExportSetJSON = useCallback((nodePath) => {
    const { setToExport, nodeName } = treeExportSet(mergedCellSets, nodePath);
    downloadForUser(
      handleExportJSON(setToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-set.${FILE_EXTENSION_JSON}`,
      FILE_EXTENSION_JSON,
    );
  }, [mergedCellSets]);

  const manager = useMemo(() => (
    <SetsManager
      setColor={cellSetColor}
      sets={cellSets}
      additionalSets={additionalCellSets}
      levelSelection={checkedLevel}
      setSelection={cellSetSelection}
      setExpansion={cellSetExpansion}
      hasColorEncoding={cellColorEncoding === 'cellSetSelection'}
      draggable
      datatype={SETS_DATATYPE_OBS}
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
      theme={theme}
    />
  ), [additionalCellSets, cellColorEncoding, cellSetColor, cellSetExpansion, cellSetSelection,
    cellSets, checkedLevel, onCheckLevel, onCheckNode, onComplement, onCreateLevelZeroNode,
    onDropNode, onExpandNode, onExportLevelZeroNodeJSON, onExportLevelZeroNodeTabular,
    onExportSetJSON, onImportTree, onIntersection, onNodeCheckNewName, onNodeRemove, onNodeSetColor,
    onNodeSetName, onNodeView, onUnion, setWarning, theme,
  ]);


  return (
    <TitleInfo
      title={title}
      isScroll
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      {manager}
    </TitleInfo>
  );
}
