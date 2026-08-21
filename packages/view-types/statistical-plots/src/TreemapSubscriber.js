/* eslint-disable no-unused-vars */
import React, { useMemo, useCallback } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useUrls,
  useReady,
  useGridItemSize,
  useObsFeatureMatrixIndices,
  useObsSetsData,
  useSampleEdgesData,
  useSampleSetsData,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import {
  treeToSelectedSetMap, mergeObsSets, treeFindNodeByNamePath, isEqualOrPrefix,
} from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber, unnestMap, capitalize } from '@vitessce/utils';
import { InternMap } from 'internmap';
import Treemap from './Treemap.js';
import { useStyles } from './styles.js';
import TreemapOptions from './TreemapOptions.js';

const DEFAULT_HIERARCHY_LEVELS = ['obsSet', 'sampleSet'];

// Set paths are arrays of strings, so they must be serialized
// before being used as Set/Map keys.
const pathKey = path => JSON.stringify(path);

/**
 * Convert a list of observation/sample IDs to a Set for O(1) lookups,
 * but only when the corresponding behavior-modifier coordination
 * value indicates that the ID list should be used.
 * @param {string[]|null} ids Value of obsFilter or sampleFilter.
 * @param {boolean} isActive Whether the ID list is the active criteria.
 * @returns {Set<string>|null} Set of IDs, or null if unconstrained.
 */
function useIdSet(ids, isActive) {
  return useMemo(() => (
    isActive && Array.isArray(ids) && ids.length > 0
      ? new Set(ids)
      : null
  ), [ids, isActive]);
}

/**
 * Determine the sibling sets of each of the provided set paths, i.e., the sets
 * which share a parent with (and therefore sit at the same hierarchy level as)
 * one of the provided set paths. Used to expand a selection into the full list
 * of sets that the selection could have been made from.
 *
 * Paths at different levels of the same hierarchy each expand at their own
 * corresponding level. Any resulting path which is an ancestor of another
 * resulting path is then discarded, since the two would otherwise overlap.
 *
 * Note that a level-zero (hierarchy root) path is returned as-is, since
 * hierarchies overlap with each other: an observation or sample belongs to one
 * set per hierarchy, so expanding to sibling hierarchies would double-count.
 * @param {object} mergedSets A merged sets tree object.
 * @param {string[][]|null} setPaths Array of set paths, such as obsSetSelection.
 * @returns {string[][]|null} Array of set paths, or null if none could be determined.
 */
function getSiblingSetPaths(mergedSets, setPaths) {
  if (!mergedSets?.tree || !Array.isArray(setPaths) || setPaths.length === 0) {
    return null;
  }
  const result = [];
  const resultKeys = new Set();
  function appendPath(setPath) {
    if (!resultKeys.has(pathKey(setPath))) {
      resultKeys.add(pathKey(setPath));
      result.push(setPath);
    }
  }
  setPaths.forEach((setPath) => {
    if (!Array.isArray(setPath) || setPath.length === 0) {
      return;
    }
    const parentPath = setPath.slice(0, -1);
    const parentNode = parentPath.length > 0
      ? treeFindNodeByNamePath(mergedSets, parentPath)
      : null;
    if (parentNode?.children) {
      parentNode.children.forEach(child => appendPath([...parentPath, child.name]));
    } else {
      // Level-zero paths, and paths whose parent cannot be resolved
      // (for example while the sets are still loading), are used as-is.
      appendPath(setPath);
    }
  });
  // Discard the ancestors of other resulting paths, to avoid overlap.
  const nonOverlappingResult = result.filter(setPath => !result.some(
    otherPath => otherPath.length > setPath.length && isEqualOrPrefix(setPath, otherPath),
  ));
  return nonOverlappingResult.length > 0 ? nonOverlappingResult : null;
}

/**
 * Determine which set paths meet the current filtering criteria.
 * @param {object} mergedSets A merged sets tree object.
 * @param {string[][]|null} setFilter Value of obsSetFilter or sampleSetFilter.
 * @param {string[][]|null} setSelection Value of obsSetSelection or sampleSetSelection.
 * @param {boolean} isIdFilterMode Whether the ID-list filtering mode is active,
 * in which case the set-level filter does not apply.
 * @returns {string[][]|null} Array of set paths, or null if none could be determined.
 */
function useFilteredSetPaths(mergedSets, setFilter, setSelection, isIdFilterMode) {
  return useMemo(() => {
    if (!isIdFilterMode && Array.isArray(setFilter) && setFilter.length > 0) {
      return setFilter;
    }
    // Without a set-level filter, no set-level filtering criteria are in
    // effect, so every set is included. The un-selected sets are still
    // rendered as (de-emphasized) nodes rather than being omitted.
    return getSiblingSetPaths(mergedSets, setSelection);
  }, [mergedSets, setFilter, setSelection, isIdFilterMode]);
}

export function TreemapSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.TREEMAP,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    obsFilter,
    obsFilterMode,
    obsHighlight,
    obsSetSelection,
    obsSetFilter,
    obsSelection,
    obsSelectionMode,
    obsSetHighlight,
    obsSetColor,
    obsColorEncoding,
    additionalObsSets,
    sampleType,
    sampleSetSelection,
    sampleSetFilter,
    sampleSetColor,
    sampleSelection,
    sampleSelectionMode,
    sampleFilter,
    sampleFilterMode,
    sampleHighlight,
    hierarchyLevels,
  }, {
    setObsFilter,
    setObsSelection,
    setObsSetFilter,
    setObsSetSelection,
    setObsSelectionMode,
    setObsFilterMode,
    setObsHighlight,
    setObsSetHighlight,
    setObsSetColor,
    setObsColorEncoding,
    setAdditionalObsSets,
    setSampleFilter,
    setSampleSetFilter,
    setSampleFilterMode,
    setSampleSelection,
    setSampleSetSelection,
    setSampleSelectionMode,
    setSampleHighlight,
    setSampleSetColor,
    setHierarchyLevels,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.TREEMAP],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();

  // TODO: how to deal with multimodal cases (multiple obsIndex, one per modality)?
  const [
    { obsIndex }, matrixIndicesStatus, matrixIndicesUrls, matrixIndicesError,
  ] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets }, obsSetsStatus, obsSetsUrls, obsSetsError] = useObsSetsData(
    loaders, dataset, true, {}, {},
    { obsType },
  );

  const [
    { sampleIndex, sampleSets }, sampleSetsStatus, sampleSetsUrls, sampleSetsError,
  ] = useSampleSetsData(
    loaders,
    dataset,
    // TODO: support `false`, i.e., configurations in which
    // there are no sampleSets
    true,
    { setSampleSetColor },
    { sampleSetColor },
    { sampleType },
  );

  const [
    { sampleEdges }, sampleEdgesStatus, sampleEdgesUrls, sampleEdgesError,
  ] = useSampleEdgesData(
    loaders,
    dataset,
    // TODO: support `false`, i.e., configurations in which
    // there are no sampleEdges
    true,
    {},
    {},
    { obsType, sampleType },
  );

  const errors = [
    matrixIndicesError,
    obsSetsError,
    sampleSetsError,
    sampleEdgesError,
  ];

  const isReady = useReady([
    matrixIndicesStatus,
    obsSetsStatus,
    sampleSetsStatus,
    sampleEdgesStatus,
  ]);
  const urls = useUrls([
    matrixIndicesUrls,
    obsSetsUrls,
    sampleSetsUrls,
    sampleEdgesUrls,
  ]);

  const mergedObsSets = useMemo(
    () => mergeObsSets(obsSets, additionalObsSets),
    [obsSets, additionalObsSets],
  );
  const mergedSampleSets = useMemo(
    () => mergeObsSets(sampleSets, null),
    [sampleSets],
  );

  // Filtering: determine which sets are considered at all.
  // These sets define the categorical partitioning of the treemap,
  // so sets which do not meet the filtering criteria are not rendered.
  // When there is no set-level filter, every set is included, so the
  // un-selected sets are still rendered as (de-emphasized) nodes,
  // broken down by the sets of the other hierarchy level.
  const filteredObsSetPaths = useFilteredSetPaths(
    mergedObsSets, obsSetFilter, obsSetSelection, obsFilterMode === 'obsFilter',
  );
  const filteredSampleSetPaths = useFilteredSetPaths(
    mergedSampleSets, sampleSetFilter, sampleSetSelection,
    sampleFilterMode === 'sampleFilter',
  );

  // Filtering: determine which individual observations/samples
  // are considered at all (when the ID-list mode is active).
  const filteredObsIds = useIdSet(obsFilter, obsFilterMode === 'obsFilter');
  const filteredSampleIds = useIdSet(sampleFilter, sampleFilterMode === 'sampleFilter');

  const [obsIdToSetMap, sampleIdToSetMap] = useMemo(() => ([
    mergedObsSets && filteredObsSetPaths
      ? treeToSelectedSetMap(mergedObsSets, filteredObsSetPaths)
      : null,
    mergedSampleSets && filteredSampleSetPaths
      ? treeToSelectedSetMap(mergedSampleSets, filteredSampleSetPaths)
      : null,
  ]), [mergedObsSets, mergedSampleSets, filteredObsSetPaths, filteredSampleSetPaths]);

  // Compute the number of observations per (obsSet, sampleSet) pair,
  // considering only those observations which meet the filtering criteria.
  const [obsCountsWithoutSelection, filteredSampleCount] = useMemo(() => {
    const obsResult = new InternMap([], JSON.stringify);

    const obsSetKeys = filteredObsSetPaths || [null];
    const sampleSetKeys = filteredSampleSetPaths || [null];

    // First level: cell set
    obsSetKeys.forEach((obsSetPath) => {
      const innerResult = new InternMap([], JSON.stringify);
      // Second level: sample set
      sampleSetKeys.forEach((sampleSetPath) => {
        innerResult.set(sampleSetPath, 0);
      });
      obsResult.set(obsSetPath, innerResult);
    });

    if (obsIndex) {
      for (let i = 0; i < obsIndex.length; i += 1) {
        const obsId = obsIndex[i];
        const sampleId = sampleEdges?.get(obsId);

        const obsSetPath = filteredObsSetPaths ? obsIdToSetMap?.get(obsId) : null;
        const sampleSetPath = (sampleId && filteredSampleSetPaths)
          ? sampleIdToSetMap?.get(sampleId)
          : null;

        const meetsFilterCriteria = (
          // The observation itself is included.
          (!filteredObsIds || filteredObsIds.has(obsId))
          // The observation is in one of the included obsSets.
          && (!filteredObsSetPaths || Boolean(obsSetPath))
          // The observation's sample is included.
          && (!filteredSampleIds || (sampleId && filteredSampleIds.has(sampleId)))
          // The observation's sample is in one of the included sampleSets.
          && (!filteredSampleSetPaths || Boolean(sampleSetPath))
        );

        if (meetsFilterCriteria) {
          const innerResult = obsResult.get(obsSetPath);
          if (innerResult) {
            innerResult.set(sampleSetPath, (innerResult.get(sampleSetPath) ?? 0) + 1);
          }
        }
      }
    }

    let sampleCount = 0;
    if (sampleIndex) {
      for (let i = 0; i < sampleIndex.length; i += 1) {
        const sampleId = sampleIndex[i];
        const meetsFilterCriteria = (
          (!filteredSampleIds || filteredSampleIds.has(sampleId))
          && (!filteredSampleSetPaths || Boolean(sampleIdToSetMap?.get(sampleId)))
        );
        if (meetsFilterCriteria) {
          sampleCount += 1;
        }
      }
    }

    return [
      unnestMap(obsResult, ['obsSetPath', 'sampleSetPath', 'value']),
      sampleCount,
    ];
  }, [obsIndex, sampleIndex, sampleEdges, obsIdToSetMap, sampleIdToSetMap,
    filteredObsSetPaths, filteredSampleSetPaths, filteredObsIds, filteredSampleIds,
  ]);

  // Selection: determine which of the sets that meet the filtering
  // criteria should be visually emphasized. A null value means that
  // there is no selection, so everything is emphasized.
  const selectedObsSetKeys = useMemo(() => {
    if (obsSelectionMode === 'obsSelection') {
      // The selection is defined per-observation. Since the treemap renders
      // sets rather than individual observations, resolve the selected
      // observations to the sets which contain them.
      if (!Array.isArray(obsSelection) || obsSelection.length === 0 || !obsIdToSetMap) {
        return null;
      }
      return new Set(obsSelection
        .map(obsId => obsIdToSetMap.get(obsId))
        .filter(Boolean)
        .map(pathKey));
    }
    if (Array.isArray(obsSetSelection) && obsSetSelection.length > 0) {
      return new Set(obsSetSelection.map(pathKey));
    }
    return null;
  }, [obsSelectionMode, obsSelection, obsSetSelection, obsIdToSetMap]);

  const selectedSampleSetKeys = useMemo(() => {
    if (sampleSelectionMode === 'sampleSelection') {
      if (!Array.isArray(sampleSelection) || sampleSelection.length === 0 || !sampleIdToSetMap) {
        return null;
      }
      return new Set(sampleSelection
        .map(sampleId => sampleIdToSetMap.get(sampleId))
        .filter(Boolean)
        .map(pathKey));
    }
    if (Array.isArray(sampleSetSelection) && sampleSetSelection.length > 0) {
      return new Set(sampleSetSelection.map(pathKey));
    }
    return null;
  }, [sampleSelectionMode, sampleSelection, sampleSetSelection, sampleIdToSetMap]);

  const obsCounts = useMemo(() => obsCountsWithoutSelection.map(d => ({
    ...d,
    isSelected: (
      (!selectedObsSetKeys || selectedObsSetKeys.has(pathKey(d.obsSetPath)))
      && (!selectedSampleSetKeys || selectedSampleSetKeys.has(pathKey(d.sampleSetPath)))
    ),
  })), [obsCountsWithoutSelection, selectedObsSetKeys, selectedSampleSetKeys]);

  // Highlighting: an observation- or sample-level highlight is resolved
  // to the set(s) which contain it, since the treemap renders sets
  // rather than individual observations.
  const [highlightedObsSetPath, highlightedSampleSetPath] = useMemo(() => {
    if (obsHighlight) {
      const sampleId = sampleEdges?.get(obsHighlight);
      return [
        obsIdToSetMap?.get(obsHighlight) || null,
        (sampleId && sampleIdToSetMap?.get(sampleId)) || null,
      ];
    }
    if (sampleHighlight) {
      return [null, sampleIdToSetMap?.get(sampleHighlight) || null];
    }
    return [obsSetHighlight || null, null];
  }, [obsHighlight, obsSetHighlight, sampleHighlight,
    obsIdToSetMap, sampleIdToSetMap, sampleEdges,
  ]);

  const totalObsCount = obsIndex?.length || 0;
  const totalSampleCount = sampleIndex?.length || 0;

  const filteredObsCount = obsCountsWithoutSelection.reduce((a, h) => a + h.value, 0);

  const omittedObsCount = totalObsCount - filteredObsCount;
  const omittedSampleCount = totalSampleCount - filteredSampleCount;

  const onNodeClick = useCallback((obsSetPath) => {
    // Clicking a node updates the selection (i.e., which sets are
    // emphasized), rather than the filtering criteria.
    if (obsSetPath) {
      setObsSetSelection([obsSetPath]);
    }
  }, [setObsSetSelection]);

  const onNodeHighlight = useCallback((obsSetPath) => {
    setObsSetHighlight(obsSetPath || null);
  }, [setObsSetHighlight]);

  return (
    <TitleInfo
      title={`Treemap of ${capitalize(plur(obsType, 2))}`}
      info={`${commaNumber(filteredObsCount)} ${plur(obsType, filteredObsCount)} from ${commaNumber(filteredSampleCount)} ${plur(sampleType, filteredSampleCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      errors={errors}
      withPadding={false}
      options={(
        <TreemapOptions
          obsType={obsType}
          sampleType={sampleType}
          obsColorEncoding={obsColorEncoding}
          setObsColorEncoding={setObsColorEncoding}
          hierarchyLevels={hierarchyLevels || DEFAULT_HIERARCHY_LEVELS}
          setHierarchyLevels={setHierarchyLevels}
          // TODO:
          // - Add option to only include cells in treemap which express selected gene
          //   above some threshold (kind of like a dot plot)
          // - Add option to _only_ consider sampleSets or obsSets
          //   (not both sampleSets and obsSets)
        />
      )}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        <Treemap
          obsCounts={obsCounts}
          obsColorEncoding={obsColorEncoding}
          hierarchyLevels={hierarchyLevels || DEFAULT_HIERARCHY_LEVELS}
          theme={theme}
          width={width}
          height={Math.max(height * (filteredObsCount / totalObsCount), 40)}
          obsType={obsType}
          sampleType={sampleType}
          obsSetColor={obsSetColor}
          sampleSetColor={sampleSetColor}
          obsSetPaths={filteredObsSetPaths}
          sampleSetPaths={filteredSampleSetPaths}
          highlightedObsSetPath={highlightedObsSetPath}
          highlightedSampleSetPath={highlightedSampleSetPath}
          onNodeClick={onNodeClick}
          onNodeHighlight={onNodeHighlight}
        />
      </div>
      <div style={{ position: 'absolute', right: '2px', bottom: '2px', fontSize: '10px' }}>
        {omittedObsCount > 0 ? (
          <span>{`${commaNumber(omittedObsCount)} ${plur(obsType, omittedObsCount)} from ${commaNumber(omittedSampleCount)} ${plur(sampleType, omittedSampleCount)} currently omitted`}</span>
        ) : null}
      </div>
    </TitleInfo>
  );
}
