import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import isEqual from 'lodash/isEqual';
import {
  useCoordination,
  useLoaders,
  useSetWarning,
  TitleInfo,
  useUrls, useReady,
  useObsSetsData,
  registerPluginViewType,
} from '@vitessce/vit-s';
import { COMPONENT_COORDINATION_TYPES, ViewType } from '@vitessce/constants-internal';
import {
  treeExportLevelZeroNode,
  treeExportSet,
  treeToExpectedCheckedLevel,
  treeToFullyCheckedLevels,
  treeToPartialCheckedLevels,
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
import FlatSetsManager from './FlatSetsManager';

const packageJson = { name: 'vitessce' };

export function FlatObsSetsManagerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title: titleOverride,
  } = props;

  const loaders = useLoaders();
  const setWarning = useSetWarning();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    obsSetSelection: cellSetSelection,
    obsSetFilter,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
    obsColorEncoding: cellColorEncoding,
  }, {
    setObsSetSelection: setCellSetSelection,
    setObsSetFilter,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetColor: setCellSetColor,
    setAdditionalObsSets: setAdditionalCellSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.OBS_SETS], coordinationScopes);

  console.log(obsSetFilter);

  const title = titleOverride || `${capitalize(obsType)} Sets`;

  const [urls, addUrl] = useUrls(loaders, dataset);

  const [cellSetExpansion, setCellSetExpansion] = useState([]);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    setCellSetExpansion([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [{ obsIndex, obsSets: cellSets }, obsSetsStatus] = useObsSetsData(
    loaders, dataset, addUrl, true,
    { setObsSetSelection: setCellSetSelection, setObsSetFilter, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetFilter, obsSetColor: cellSetColor },
    { obsType },
  );
  const isReady = useReady([
    obsSetsStatus,
  ]);

  // Validate and upgrade the additionalCellSets.
  useEffect(() => {
    if (additionalCellSets) {
      let upgradedCellSets;
      try {
        upgradedCellSets = tryUpgradeTreeToLatestSchema(additionalCellSets, SETS_DATATYPE_OBS);
      } catch (e) {
        setWarning(e.message);
        return;
      }
      setAdditionalCellSets(upgradedCellSets);
    }
  }, [additionalCellSets, setAdditionalCellSets, setWarning]);

  // Get an array of all cell IDs to use for set complement operations.
  const allCellIds = useMemo(() => (obsIndex || []), [obsIndex]);

  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  function setCellSetColorEncoding() {
    setCellColorEncoding('cellSetSelection');
  }

  // Merged cell sets are only to be used for convenience when reading
  // (if writing: update either `cellSets` _or_ `additionalCellSets`).
  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // Infer the state of the "checked level" radio button based on the selected cell sets.
  const coloredLevel = useMemo(() => {
    if (cellSetSelection && cellSetSelection.length > 0
    && mergedCellSets && mergedCellSets.tree.length > 0) {
      return treeToExpectedCheckedLevel(mergedCellSets, cellSetSelection);
    }
    return null;
  }, [cellSetSelection, mergedCellSets]);

  const checkedLevel = useMemo(() => {
    if (obsSetFilter && obsSetFilter.length > 0
    && mergedCellSets && mergedCellSets.tree.length > 0) {
      return treeToExpectedCheckedLevel(mergedCellSets, obsSetFilter);
    }
    return null;
  }, [obsSetFilter, mergedCellSets]);

  const partialCheckedLevels = useMemo(() => {
    if (obsSetFilter && obsSetFilter.length > 0
    && mergedCellSets && mergedCellSets.tree.length > 0) {
      return treeToPartialCheckedLevels(mergedCellSets, obsSetFilter);
    }
    return [];
  }, [obsSetFilter, mergedCellSets]);

  const fullyCheckedLevels = useMemo(() => {
    if (obsSetFilter && obsSetFilter.length > 0
    && mergedCellSets && mergedCellSets.tree.length > 0) {
      return treeToFullyCheckedLevels(mergedCellSets, obsSetFilter);
    }
    return [];
  }, [obsSetFilter, mergedCellSets]);

  // Callback functions

  // The user wants to select all nodes at a particular hierarchy level.
  function onColorGroup(levelZeroName, checked) {
    const levelIndex = 1;
    const lzn = mergedCellSets.tree.find(n => n.name === levelZeroName);
    if (lzn) {
      if (checked) {
        const newCellSetSelection = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
        setCellSetSelection(newCellSetSelection);
      } else {
        setCellSetSelection([]);
      }
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
      setObsSetFilter([...obsSetFilter, targetPath]);
    } else {
      setObsSetFilter(obsSetFilter.filter(d => !isEqual(d, targetPath)));
    }
  }

  function onCheckGroup(levelZeroName, checked) {
    const levelIndex = 1;
    const lzn = mergedCellSets.tree.find(n => n.name === levelZeroName);
    if (lzn) {
      let newObsSetFilter;
      if (checked) {
        newObsSetFilter = [...obsSetFilter];
        const obsSetsToAdd = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
        obsSetsToAdd.forEach((path) => {
          if (newObsSetFilter.find(d => isEqual(d, path)) === undefined) {
            newObsSetFilter.push(path);
          }
        });
      } else {
        newObsSetFilter = [];
        const obsSetsToRemove = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
        obsSetFilter.forEach((path) => {
          if (obsSetsToRemove.find(d => isEqual(d, path)) === undefined) {
            newObsSetFilter.push(path);
          }
        });
      }
      setObsSetFilter(newObsSetFilter);
    }
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
      ...(additionalCellSets || treeInitialize(SETS_DATATYPE_OBS)),
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
    setObsSelection(
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
    setObsSelection(
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
    setObsSelection(
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
  }

  // The user wants to download a particular hierarchy to a JSON file.
  function onExportLevelZeroNodeJSON(nodePath) {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_OBS, cellSetColor, theme);
    downloadForUser(
      handleExportJSON(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-hierarchy.${FILE_EXTENSION_JSON}`,
    );
  }

  // The user wants to download a particular hierarchy to a CSV file.
  function onExportLevelZeroNodeTabular(nodePath) {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedCellSets, nodePath, SETS_DATATYPE_OBS, cellSetColor, theme);
    downloadForUser(
      handleExportTabular(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-hierarchy.${FILE_EXTENSION_TABULAR}`,
    );
  }

  // The user wants to download a particular set to a JSON file.
  function onExportSetJSON(nodePath) {
    const { setToExport, nodeName } = treeExportSet(mergedCellSets, nodePath);
    downloadForUser(
      handleExportJSON(setToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-set.${FILE_EXTENSION_JSON}`,
      FILE_EXTENSION_JSON,
    );
  }

  return (
    <TitleInfo
      title={title}
      isScroll
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <FlatSetsManager
        setColor={cellSetColor}
        sets={cellSets}
        additionalSets={additionalCellSets}
        coloredLevel={coloredLevel}
        levelSelection={checkedLevel}
        fullyCheckedLevels={fullyCheckedLevels}
        partialCheckedLevels={partialCheckedLevels}
        setSelection={cellSetSelection}
        setFilter={obsSetFilter}
        setExpansion={cellSetExpansion}
        hasColorEncoding={cellColorEncoding === 'cellSetSelection'}
        draggable
        datatype={SETS_DATATYPE_OBS}
        onError={setWarning}
        onCheckGroup={onCheckGroup}
        onCheckNode={onCheckNode}
        onExpandNode={onExpandNode}
        onDropNode={onDropNode}
        onColorGroup={onColorGroup}
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
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    'flatObsSets',
    FlatObsSetsManagerSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SETS],
  );
}
