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
  useCoordinationScopes,
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
    coordinationScopes: coordinationScopesRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title: titleOverride,
    helpText = ViewHelpMapping.OBS_SETS,
  } = props;

  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const setWarning = useSetWarning();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    obsSetSelection,
    obsSetExpansion,
    obsSetColor,
    additionalObsSets,
    obsColorEncoding,
  }, {
    setObsSetSelection,
    setObsColorEncoding,
    setObsSetColor,
    setObsSetExpansion,
    setAdditionalObsSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.OBS_SETS], coordinationScopes);

  const title = titleOverride || `${capitalize(obsType)} Sets`;


  // Get data from loaders using the data hooks.
  const [
    { obsIndex, obsSets: cellSets }, obsSetsStatus, obsSetsUrls, obsSetsError,
  ] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection, setObsSetColor, setObsSetExpansion },
    { obsSetSelection, obsSetColor, obsSetExpansion },
    { obsType },
  );
  const errors = [
    obsSetsError,
  ];
  const isReady = useReady([obsSetsStatus]);
  const urls = useUrls([obsSetsUrls]);

  // Validate and upgrade the additionalObsSets.
  useEffect(() => {
    if (additionalObsSets) {
      let upgradedCellSets;
      let didUpgrade;
      try {
        [upgradedCellSets, didUpgrade] = tryUpgradeTreeToLatestSchema(
          additionalObsSets, SETS_DATATYPE_OBS,
        );
      } catch (e) {
        setWarning(e.message);
        return;
      }
      if (didUpgrade) {
        setAdditionalObsSets(upgradedCellSets);
      }
    }
  }, [additionalObsSets, setAdditionalObsSets, setWarning]);

  // Get an array of all cell IDs to use for set complement operations.
  const allCellIds = useMemo(() => (obsIndex || []), [obsIndex]);

  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  const setObsSetColorEncoding = useCallback(() => {
    setObsColorEncoding('cellSetSelection');
  }, [setObsColorEncoding]);

  // Merged cell sets are only to be used for convenience when reading
  // (if writing: update either `cellSets` _or_ `additionalObsSets`).
  const mergedObsSets = useMemo(
    () => mergeObsSets(cellSets, additionalObsSets),
    [cellSets, additionalObsSets],
  );

  // Infer the state of the "checked level" radio button based on the selected cell sets.
  const checkedLevel = useMemo(() => {
    if (obsSetSelection && obsSetSelection.length > 0
    && mergedObsSets && mergedObsSets.tree.length > 0) {
      return treeToExpectedCheckedLevel(mergedObsSets, obsSetSelection);
    }
    return null;
  }, [obsSetSelection, mergedObsSets]);

  // Callback functions

  // The user wants to select all nodes at a particular hierarchy level.
  const onCheckLevel = useCallback((levelZeroName, levelIndex) => {
    const lzn = mergedObsSets.tree.find(n => n.name === levelZeroName);
    if (lzn) {
      const newObsSetSelection = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
      setObsSetSelection(newObsSetSelection);
      setObsSetColorEncoding();
    }
  }, [mergedObsSets, setObsSetColorEncoding, setObsSetSelection]);

  // The user wants to check or uncheck a cell set node.
  const onCheckNode = useCallback((targetKey, checked) => {
    const targetPath = (Array.isArray(targetKey) ? targetKey : targetKey.split(PATH_SEP));
    if (!targetKey) {
      return;
    }
    if (checked) {
      setObsSetSelection([...obsSetSelection, targetPath]);
    } else {
      setObsSetSelection(obsSetSelection.filter(d => !isEqual(d, targetPath)));
    }
    setObsSetColorEncoding();
  }, [obsSetSelection, setObsSetColorEncoding, setObsSetSelection]);

  // The user wants to expand or collapse a node in the tree.
  const onExpandNode = useCallback((expandedKeys, targetKey, expanded) => {
    const prevObsSetExpansion = obsSetExpansion || [];
    if (expanded) {
      setObsSetExpansion([...prevObsSetExpansion, targetKey.split(PATH_SEP)]);
    } else {
      const newObsSetExpansion = prevObsSetExpansion.filter(
        d => !isEqual(d, targetKey.split(PATH_SEP)),
      );
      setObsSetExpansion(newObsSetExpansion);
    }
  }, [obsSetExpansion, setObsSetExpansion]);

  // The user dragged a tree node and dropped it somewhere else in the tree
  // to re-arrange or re-order the nodes.
  // We need to verify that their drop target is valid, and if so, complete
  // the tree re-arrangement.
  const onDropNode = useCallback((dropKey, dragKey, dropPosition, dropToGap) => {
    const dropPath = dropKey.split(PATH_SEP);
    const dropNode = treeFindNodeByNamePath(additionalObsSets, dropPath);
    if (!dropNode.children && !dropToGap) {
      // Do not allow a node with a set (i.e. leaf) to become a child of another node with a set,
      // as this will result in an internal node having a set, which we do not allow.
      return;
    }
    const dropNodeLevel = dropPath.length - 1;
    const dropNodeIsLevelZero = dropNodeLevel === 0;

    // Get drag node.
    const dragPath = dragKey.split(PATH_SEP);
    const dragNode = treeFindNodeByNamePath(additionalObsSets, dragPath);

    if (dropNodeIsLevelZero && dropToGap && !dragNode.children) {
      // Do not allow a leaf node to become a level zero node.
      return;
    }

    let dropParentNode;
    let dropParentPath;
    let dropNodeCurrIndex;
    if (!dropNodeIsLevelZero) {
      dropParentPath = dropPath.slice(0, -1);
      dropParentNode = treeFindNodeByNamePath(additionalObsSets, dropParentPath);
      dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.name === dropNode.name);
    } else {
      dropNodeCurrIndex = additionalObsSets.tree.findIndex(
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
      hasSiblingNameConflict = additionalObsSets.tree
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
    const nextAdditionalObsSets = {
      ...additionalObsSets,
      tree: additionalObsSets.tree.map(lzn => filterNode(lzn, [], dragPath)).filter(Boolean),
    };

    // Update index values after temporarily removing the dragged node.
    // Names are unique as children of their parents.
    if (!dropNodeIsLevelZero) {
      dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.name === dropNode.name);
    } else {
      dropNodeCurrIndex = nextAdditionalObsSets.tree.findIndex(
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
      nextAdditionalObsSets.tree = nextAdditionalObsSets.tree.map(
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
      setAdditionalObsSets(nextAdditionalObsSets);
      newDragPath = [...newPath[0], dragNode.name];
      setObsSetSelection([newDragPath]);
    } else if (dropPosition === -1) {
      // We need to drop the dragNode to level zero,
      // and level zero nodes do not have parents.
      // Set dragNode as first level zero node of the tree.
      nextAdditionalObsSets.tree.unshift(dragNode);
      setAdditionalObsSets(nextAdditionalObsSets);
      newDragPath = [dragNode.name];
      setObsSetSelection([newDragPath]);
    } else {
      // Set dragNode before or after dropNode in level zero.
      const insertIndex = dropNodeCurrIndex + (dropPosition > dropNodeCurrIndex ? 1 : 0);
      const newLevelZero = Array.from(nextAdditionalObsSets.tree);
      newLevelZero.splice(insertIndex, 0, dragNode);
      nextAdditionalObsSets.tree = newLevelZero;
      setAdditionalObsSets(nextAdditionalObsSets);
      newDragPath = [dragNode.name];
      setObsSetSelection([newDragPath]);
    }
    const oldColors = obsSetColor.filter(
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
    const newObsSetColor = obsSetColor.filter(
      i => !isEqualOrPrefix(dragPath, i.path),
    );
    newObsSetColor.push(...newColors);
    setObsSetColor(newObsSetColor);
  }, [additionalObsSets, obsSetColor, setAdditionalObsSets, setObsSetColor,
    setObsSetSelection,
  ]);

  // The user wants to change the color of a cell set node.
  const onNodeSetColor = useCallback((targetPath, color) => {
    // Replace the color if an array element for this path already exists.
    const prevNodeColor = obsSetColor?.find(d => isEqual(d.path, targetPath));
    if (!prevNodeColor) {
      setObsSetColor([
        ...(obsSetColor || []),
        {
          path: targetPath,
          color,
        },
      ]);
    } else {
      setObsSetColor([
        ...obsSetColor.filter(d => !isEqual(d.path, targetPath)),
        {
          path: targetPath,
          color,
        },
      ]);
    }
  }, [obsSetColor, setObsSetColor]);

  // The user wants to change the name of a cell set node.
  const onNodeSetName = useCallback((targetPath, name) => {
    const nextNamePath = [...targetPath];
    nextNamePath.pop();
    nextNamePath.push(name);

    const prevObsSetExpansion = obsSetExpansion || [];

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
    const nextAdditionalObsSets = {
      ...additionalObsSets,
      tree: additionalObsSets.tree.map(lzn => renameNode(lzn, [])),
    };
    // Change all paths that have this node as a prefix (i.e. descendants).
    const nextObsSetColor = obsSetColor.map(d => ({
      path: tryRenamePath(targetPath, d.path, nextNamePath),
      color: d.color,
    }));
    const nextObsSetSelection = obsSetSelection.map(d => (
      tryRenamePath(targetPath, d, nextNamePath)
    ));
    const nextObsSetExpansion = prevObsSetExpansion.map(d => (
      tryRenamePath(targetPath, d, nextNamePath)
    ));
    // Need to update the node path everywhere it may be present.
    setAdditionalObsSets(nextAdditionalObsSets);
    setObsSetColor(nextObsSetColor);
    setObsSetSelection(nextObsSetSelection);
    setObsSetExpansion(nextObsSetExpansion);
  }, [additionalObsSets, obsSetColor, obsSetExpansion, obsSetSelection,
    setAdditionalObsSets, setObsSetColor, setObsSetSelection,
    setObsSetExpansion,
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
      && treeFindNodeByNamePath(additionalObsSets, nextNamePath)
    );
    return hasConflicts;
  }, [additionalObsSets]);

  // The user wants to delete a cell set node, and has confirmed their choice.
  const onNodeRemove = useCallback((targetPath) => {
    const prevObsSetExpansion = obsSetExpansion || [];
    // Recursively check whether each node path
    // matches the path of the node to delete.
    // If so, return null, and then always use
    // .filter(Boolean) to eliminate any null array elements.
    const nextAdditionalObsSets = {
      ...additionalObsSets,
      tree: additionalObsSets.tree.map(lzn => filterNode(lzn, [], targetPath)).filter(Boolean),
    };
    // Delete state for all paths that have this node
    // path as a prefix (i.e. delete all descendents).
    const nextObsSetColor = obsSetColor.filter(d => !isEqualOrPrefix(targetPath, d.path));
    const nextObsSetSelection = obsSetSelection.filter(d => !isEqualOrPrefix(targetPath, d));
    const nextObsSetExpansion = prevObsSetExpansion.filter(d => !isEqualOrPrefix(targetPath, d));
    setAdditionalObsSets(nextAdditionalObsSets);
    setObsSetColor(nextObsSetColor);
    setObsSetSelection(nextObsSetSelection);
    setObsSetExpansion(nextObsSetExpansion);
  }, [additionalObsSets, obsSetColor, obsSetExpansion, obsSetSelection,
    setAdditionalObsSets, setObsSetColor, setObsSetSelection,
    setObsSetExpansion,
  ]);

  // The user wants to view (i.e. select) a particular node,
  // or its expanded descendents.
  const onNodeView = useCallback((targetPath) => {
    // If parent node is clicked, and if it is expanded,
    // then select the expanded descendent nodes.
    const setsToView = [];
    // Recursively determine which descendent nodes are currently expanded.
    function viewNode(node, nodePath) {
      if (obsSetExpansion?.find(expandedPath => isEqual(nodePath, expandedPath))) {
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
    const targetNode = treeFindNodeByNamePath(mergedObsSets, targetPath);
    viewNode(targetNode, targetPath);
    setObsSetSelection(setsToView);
    setObsSetColorEncoding();
  }, [obsSetExpansion, mergedObsSets, setObsSetColorEncoding, setObsSetSelection]);

  // The user wants to create a new level zero node.
  const onCreateLevelZeroNode = useCallback(() => {
    const nextName = getNextNumberedNodeName(additionalObsSets?.tree, 'My hierarchy ', '');
    setAdditionalObsSets({
      ...(additionalObsSets || treeInitialize(SETS_DATATYPE_OBS)),
      tree: [
        ...(additionalObsSets ? additionalObsSets.tree : []),
        {
          name: nextName,
          children: [],
        },
      ],
    });
  }, [additionalObsSets, setAdditionalObsSets]);

  // The user wants to create a new node corresponding to
  // the union of the selected sets.
  const onUnion = useCallback(() => {
    const newSet = treeToUnion(mergedObsSets, obsSetSelection);
    setObsSelection(
      newSet, additionalObsSets, obsSetColor,
      setObsSetSelection, setAdditionalObsSets, setObsSetColor,
      setObsColorEncoding,
      'Union ',
    );
  }, [additionalObsSets, obsSetColor, obsSetSelection, mergedObsSets,
    setAdditionalObsSets, setObsColorEncoding, setObsSetColor, setObsSetSelection,
  ]);

  // The user wants to create a new node corresponding to
  // the intersection of the selected sets.
  const onIntersection = useCallback(() => {
    const newSet = treeToIntersection(mergedObsSets, obsSetSelection);
    setObsSelection(
      newSet, additionalObsSets, obsSetColor,
      setObsSetSelection, setAdditionalObsSets, setObsSetColor,
      setObsColorEncoding,
      'Intersection ',
    );
  }, [additionalObsSets, obsSetColor, obsSetSelection, mergedObsSets,
    setAdditionalObsSets, setObsColorEncoding, setObsSetColor, setObsSetSelection,
  ]);

  // The user wants to create a new node corresponding to
  // the complement of the selected sets.
  const onComplement = useCallback(() => {
    const newSet = treeToComplement(mergedObsSets, obsSetSelection, allCellIds);
    setObsSelection(
      newSet, additionalObsSets, obsSetColor,
      setObsSetSelection, setAdditionalObsSets, setObsSetColor,
      setObsColorEncoding,
      'Complement ',
    );
  }, [additionalObsSets, allCellIds, obsSetColor, obsSetSelection,
    mergedObsSets, setAdditionalObsSets, setObsColorEncoding, setObsSetColor,
    setObsSetSelection,
  ]);

  // The user wants to import a cell set hierarchy,
  // probably from a CSV or JSON file.
  const onImportTree = useCallback((treeToImport) => {
    // Check for any naming conflicts with the current sets
    // (both user-defined and dataset-defined) before importing.
    const hasConflict = treesConflict(mergedObsSets, treeToImport);
    if (!hasConflict) {
      setAdditionalObsSets({
        ...(additionalObsSets || treeInitialize(SETS_DATATYPE_OBS)),
        tree: [
          ...(additionalObsSets ? additionalObsSets.tree : []),
          ...treeToImport.tree,
        ],
      });
      // Automatically initialize set colors for the imported sets.
      const importAutoSetColors = initializeCellSetColor(treeToImport, obsSetColor);
      setObsSetColor([
        ...obsSetColor,
        ...importAutoSetColors,
      ]);
    }
  }, [additionalObsSets, obsSetColor, mergedObsSets, setAdditionalObsSets,
    setObsSetColor,
  ]);

  // The user wants to download a particular hierarchy to a JSON file.
  const onExportLevelZeroNodeJSON = useCallback((nodePath) => {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedObsSets, nodePath, SETS_DATATYPE_OBS, obsSetColor, theme);
    downloadForUser(
      handleExportJSON(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-hierarchy.${FILE_EXTENSION_JSON}`,
    );
  }, [obsSetColor, mergedObsSets, theme]);

  // The user wants to download a particular hierarchy to a CSV file.
  const onExportLevelZeroNodeTabular = useCallback((nodePath) => {
    const {
      treeToExport, nodeName,
    } = treeExportLevelZeroNode(mergedObsSets, nodePath, SETS_DATATYPE_OBS, obsSetColor, theme);
    downloadForUser(
      handleExportTabular(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-hierarchy.${FILE_EXTENSION_TABULAR}`,
    );
  }, [obsSetColor, mergedObsSets, theme]);

  // The user wants to download a particular set to a JSON file.
  const onExportSetJSON = useCallback((nodePath) => {
    const { setToExport, nodeName } = treeExportSet(mergedObsSets, nodePath);
    downloadForUser(
      handleExportJSON(setToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_OBS}-set.${FILE_EXTENSION_JSON}`,
      FILE_EXTENSION_JSON,
    );
  }, [mergedObsSets]);

  const manager = useMemo(() => (
    <SetsManager
      setColor={obsSetColor}
      sets={cellSets}
      additionalSets={additionalObsSets}
      levelSelection={checkedLevel}
      setSelection={obsSetSelection}
      setExpansion={obsSetExpansion}
      hasColorEncoding={obsColorEncoding === 'cellSetSelection'}
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
      hasCheckedSetsToUnion={obsSetSelection?.length > 1}
      hasCheckedSetsToIntersect={obsSetSelection?.length > 1}
      hasCheckedSetsToComplement={obsSetSelection?.length > 0}
      theme={theme}
    />
  ), [additionalObsSets, obsColorEncoding, obsSetColor, obsSetExpansion, obsSetSelection,
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
      errors={errors}
    >
      {manager}
    </TitleInfo>
  );
}
