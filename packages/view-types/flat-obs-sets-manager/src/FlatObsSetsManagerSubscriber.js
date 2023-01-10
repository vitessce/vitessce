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
  treeToExpectedCheckedLevel,
  treeToFullyCheckedLevels,
  treeToPartialCheckedLevels,
  treeToGroupProportions,
  nodeToLevelDescendantNamePaths,
  PATH_SEP,
  tryUpgradeTreeToLatestSchema,
  SETS_DATATYPE_OBS,
  mergeObsSets,
} from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';
import FlatSetsManager from './FlatSetsManager';


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

  const title = titleOverride || `${capitalize(obsType)} Sets`;

  const [urls, addUrl] = useUrls(loaders, dataset);

  const [cellSetExpansion, setCellSetExpansion] = useState([]);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    setCellSetExpansion([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [{ obsSets: cellSets }, obsSetsStatus] = useObsSetsData(
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

  const groupProportions = useMemo(() => {
    if (coloredLevel && mergedCellSets && mergedCellSets.tree.length > 0) {
      return treeToGroupProportions(
        mergedCellSets,
        coloredLevel.levelZeroPath,
        cellSetColor,
        theme,
      );
    }
    return null;
  }, [coloredLevel, mergedCellSets, cellSetColor, theme]);

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
        checkedLevel={checkedLevel}
        fullyCheckedLevels={fullyCheckedLevels}
        partialCheckedLevels={partialCheckedLevels}
        setFilter={obsSetFilter}
        setExpansion={cellSetExpansion}
        groupProportions={groupProportions}
        hasColorEncoding={cellColorEncoding === 'cellSetSelection'}
        onCheckGroup={onCheckGroup}
        onCheckNode={onCheckNode}
        onExpandNode={onExpandNode}
        onColorGroup={onColorGroup}
        theme={theme}
      />
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    ViewType.FLAT_OBS_SETS,
    FlatObsSetsManagerSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SETS],
  );
}
