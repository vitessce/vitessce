import React, { useMemo, useCallback } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useUrls,
  useReady,
  useGridItemSize,
  useFeatureSelection,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useObsSetsData,
  useSampleEdgesData,
  useSampleSetsData,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { treeToSelectedSetMap, treeToObsIdsBySetNames, treeToSetSizesBySetNames, mergeObsSets } from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber } from '@vitessce/utils';
import Treemap from './Treemap.js';
import { useStyles } from './styles.js';
import { InternMap } from 'internmap';
import { isEqual } from 'lodash-es';


export function TreemapSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    yMin = 0,
    yUnits = null,
    helpText = ViewHelpMapping.TREEMAP,
  } = props;

  const classes = useStyles();
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
    loaders, dataset, false,
    { setSampleSetColor },
    { sampleSetColor },
    { sampleType },
  );

  const [{ sampleEdges }, sampleEdgesStatus, sampleEdgesUrls] = useSampleEdgesData(
    loaders, dataset, false, {}, {},
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

  const obsCount = obsIndex?.length || 0;
  const sampleCount = sampleIndex?.length || 0;

  const [obsCounts, sampleCounts] = useMemo(() => {

    const obsResult = new InternMap([], JSON.stringify);
    const sampleResult = new InternMap([], JSON.stringify);

    const hasSampleSetSelection = Array.isArray(sampleSetSelection) && sampleSetSelection.length > 0;
    const hasCellSetSelection = Array.isArray(obsSetSelection) && obsSetSelection.length > 0;

    const sampleSetKeys = hasSampleSetSelection ? sampleSetSelection : [null];
    const cellSetKeys = hasCellSetSelection ? obsSetSelection : [null];

    // TODO: return a flat array with { cellSet, sampleSet, gene } objects.
    // Then, use d3.group to create nested InternMaps.

    // First level: cell set
    cellSetKeys.forEach((cellSetKey) => {
      obsResult.set(cellSetKey, new InternMap([], JSON.stringify));
      // Second level: sample set
      sampleSetKeys.forEach((sampleSetKey) => {
        obsResult.get(cellSetKey).set(sampleSetKey, 0);
      });
    });

    const sampleSetSizes = treeToSetSizesBySetNames(
      mergedSampleSets, sampleSetSelection, sampleSetSelection, sampleSetColor, theme,
    );

    sampleSetKeys.forEach((sampleSetKey) => {
      const sampleSetSize = sampleSetSizes.find(d => isEqual(d.setNamePath, sampleSetKey))?.size;
      sampleResult.set(sampleSetKey, sampleSetSize || 0);
    });

    if (mergedObsSets && obsSetSelection) {
      const sampleIdToSetMap = sampleSets && sampleSetSelection
        ? treeToSelectedSetMap(sampleSets, sampleSetSelection)
        : null;
      const cellIdToSetMap = treeToSelectedSetMap(mergedObsSets, obsSetSelection);

      for (let i = 0; i < obsIndex.length; i += 1) {
        const obsId = obsIndex[i];

        const cellSet = cellIdToSetMap?.get(obsId);
        const sampleId = sampleEdges?.get(obsId);
        const sampleSet = sampleId ? sampleIdToSetMap?.get(sampleId) : null;

        if (hasSampleSetSelection && !sampleSet) {
          // Skip this sample if it is not in the selected sample set.
          // eslint-disable-next-line no-continue
          continue;
        }
        const prevObsCount = obsResult.get(cellSet)?.get(sampleSet);
        obsResult.get(cellSet)?.set(sampleSet, prevObsCount+1);
      }
    }
    return [obsResult, sampleResult];

  }, [obsIndex, sampleEdges, sampleSets, obsSetColor,
    sampleSetColor, mergedObsSets, obsSetSelection, mergedSampleSets,
    // TODO: consider filtering
  ]);


  return (
    <TitleInfo
      title={`Treemap (cells)`}
      info={`${commaNumber(obsCount)} ${plur(obsType, obsCount)} from ${commaNumber(sampleCount)} ${plur(sampleType, sampleCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        <Treemap
          obsCounts={obsCounts}
          sampleCounts={sampleCounts}
          theme={theme}
          width={width}
          height={height}
          obsType={obsType}
          sampleType={sampleType}
          sampleSetColor={sampleSetColor}
          sampleSetSelection={sampleSetSelection}
        />
      </div>
    </TitleInfo>
  );
}
