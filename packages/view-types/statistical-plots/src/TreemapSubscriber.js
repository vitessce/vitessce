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
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { treeToSelectedSetMap, treeToSetSizesBySetNames, mergeObsSets } from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber, unnestMap, capitalize } from '@vitessce/utils';
import { InternMap } from 'internmap';
import { isEqual } from 'lodash-es';
import Treemap from './Treemap.js';
import { useStyles } from './styles.js';
import TreemapOptions from './TreemapOptions.js';

const DEFAULT_HIERARCHY_LEVELS = ['obsSet', 'sampleSet'];

export function TreemapSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.TREEMAP,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    obsFilter,
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
  const [{ obsIndex }, matrixIndicesStatus, matrixIndicesUrls] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, true, {}, {},
    { obsType },
  );

  const [{ sampleIndex, sampleSets }, sampleSetsStatus, sampleSetsUrls] = useSampleSetsData(
    loaders,
    dataset,
    // TODO: support `false`, i.e., configurations in which
    // there are no sampleSets
    true,
    { setSampleSetColor },
    { sampleSetColor },
    { sampleType },
  );

  const [{ sampleEdges }, sampleEdgesStatus, sampleEdgesUrls] = useSampleEdgesData(
    loaders,
    dataset,
    // TODO: support `false`, i.e., configurations in which
    // there are no sampleEdges
    true,
    {},
    {},
    { obsType, sampleType },
  );

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

  // TODO: use obsFilter / sampleFilter to display
  // _all_ cells/samples in gray / transparent in background,
  // and use obsSetSelection/sampleSetSelection to display
  // the _selected_ samples in color in the foreground.
  const [obsCounts, sampleCounts] = useMemo(() => {
    const obsResult = new InternMap([], JSON.stringify);
    const sampleResult = new InternMap([], JSON.stringify);

    const hasSampleSetSelection = (
      Array.isArray(sampleSetSelection)
      && sampleSetSelection.length > 0
    );
    const hasCellSetSelection = (
      Array.isArray(obsSetSelection)
      && obsSetSelection.length > 0
    );

    const sampleSetKeys = hasSampleSetSelection ? sampleSetSelection : [null];
    const cellSetKeys = hasCellSetSelection ? obsSetSelection : [null];

    // First level: cell set
    cellSetKeys.forEach((cellSetKey) => {
      obsResult.set(cellSetKey, new InternMap([], JSON.stringify));
      // Second level: sample set
      sampleSetKeys.forEach((sampleSetKey) => {
        obsResult.get(cellSetKey).set(sampleSetKey, 0);
      });
    });

    const sampleSetSizes = hasSampleSetSelection ? treeToSetSizesBySetNames(
      mergedSampleSets, sampleSetSelection, sampleSetSelection, sampleSetColor, theme,
    ) : null;

    sampleSetKeys.forEach((sampleSetKey) => {
      const sampleSetSize = sampleSetSizes?.find(d => isEqual(d.setNamePath, sampleSetKey))?.size;
      sampleResult.set(sampleSetKey, sampleSetSize || 0);
    });

    if (mergedObsSets && obsSetSelection && obsIndex) {
      const sampleIdToSetMap = sampleSets && sampleSetSelection
        ? treeToSelectedSetMap(sampleSets, sampleSetSelection)
        : null;
      const cellIdToSetMap = treeToSelectedSetMap(mergedObsSets, obsSetSelection);

      for (let i = 0; i < obsIndex.length; i += 1) {
        const obsId = obsIndex[i];

        const cellSet = cellIdToSetMap?.get(obsId);
        const sampleId = sampleEdges?.get(obsId);
        const sampleSet = sampleId && hasSampleSetSelection
          ? sampleIdToSetMap?.get(sampleId)
          : null;

        if (hasSampleSetSelection && !sampleSet) {
          // Skip this sample if it is not in the selected sample set.
          // eslint-disable-next-line no-continue
          continue;
        }
        const prevObsCount = obsResult.get(cellSet)?.get(sampleSet);
        obsResult.get(cellSet)?.set(sampleSet, prevObsCount + 1);
      }
    }

    return [
      unnestMap(obsResult, ['obsSetPath', 'sampleSetPath', 'value']),
      unnestMap(sampleResult, ['sampleSetPath', 'value']),
    ];
  }, [obsIndex, sampleEdges, sampleSets, obsSetColor,
    sampleSetColor, mergedObsSets, obsSetSelection, mergedSampleSets,
    sampleSetSelection, obsIndex,
    // TODO: consider filtering-related coordination values
  ]);

  const totalObsCount = obsIndex?.length || 0;
  const totalSampleCount = sampleIndex?.length || 0;

  const selectedObsCount = obsCounts.reduce((a, h) => a + h.value, 0);
  const selectedSampleCount = sampleCounts.reduce((a, h) => a + h.value, 0);

  const unselectedObsCount = totalObsCount - selectedObsCount;
  const unselectedSampleCount = totalSampleCount - selectedSampleCount;


  const onNodeClick = useCallback((obsSetPath) => {
    setObsSetSelection([obsSetPath]);
  }, [setObsSetSelection]);

  return (
    <TitleInfo
      title={`Treemap of ${capitalize(plur(obsType, 2))}`}
      info={`${commaNumber(selectedObsCount)} ${plur(obsType, selectedObsCount)} from ${commaNumber(selectedSampleCount)} ${plur(sampleType, selectedSampleCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
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
          sampleCounts={sampleCounts}
          obsColorEncoding={obsColorEncoding}
          hierarchyLevels={hierarchyLevels || DEFAULT_HIERARCHY_LEVELS}
          theme={theme}
          width={width}
          height={Math.max(height * (selectedObsCount / totalObsCount), 40)}
          obsType={obsType}
          sampleType={sampleType}
          obsSetColor={obsSetColor}
          sampleSetColor={sampleSetColor}
          obsSetSelection={obsSetSelection}
          sampleSetSelection={sampleSetSelection}
          onNodeClick={onNodeClick}
        />
      </div>
      <div style={{ position: 'absolute', right: '2px', bottom: '2px', fontSize: '10px' }}>
        {unselectedObsCount > 0 ? (
          <span>{`${commaNumber(unselectedObsCount)} ${plur(obsType, unselectedObsCount)} from ${commaNumber(unselectedSampleCount)} ${plur(sampleType, unselectedSampleCount)} currently omitted`}</span>
        ) : null}
      </div>
    </TitleInfo>
  );
}
