/* eslint-disable camelcase */
import { useMemo } from 'react';
import { isEqual } from 'lodash-es';
import { colorArrayToString } from '@vitessce/sets-utils';
import { getDefaultColor } from '@vitessce/utils';

function createOrdinalScale(domainArr, rangeArr) {
  return (queryVal) => {
    const i = domainArr.findIndex(domainVal => isEqual(domainVal, queryVal));
    return rangeArr[i];
  };
}

// Create a d3-scale ordinal scale mapping set paths to color strings.
export function getColorScale(setSelectionArr, setColorArr, theme) {
  /*
  // The equality seems incorrect with d3.scaleOrdinal
  return scaleOrdinal()
    .domain(setSelectionArr || [])
    .range(
    */
  const domainArr = setSelectionArr || [];
  const rangeArr = setSelectionArr
    ?.map(setNamePath => (
      setColorArr?.find(d => isEqual(d.path, setNamePath))?.color
          || getDefaultColor(theme)
    ))
    ?.map(colorArrayToString) || [];
  return createOrdinalScale(domainArr, rangeArr);
}


/**
 * Transform set paths which use group names to those which use column names.
 * @param {Record<string, string>} columnNameMapping Return value of useColumnNameMapping.
 * @param {string[][]} setPaths Array of set paths, such as obsSetSelection.
 * @returns {string[][]} Transformed set paths.
 */
export function useRawSetPaths(columnNameMapping, setPaths) {
  return useMemo(() => setPaths?.map((setPath) => {
    const newSetPath = [...setPath];
    if (newSetPath?.[0] && columnNameMapping[newSetPath[0]]) {
      newSetPath[0] = columnNameMapping[newSetPath[0]];
    }
    return newSetPath;
  }), [columnNameMapping, setPaths]);
}

// Data transformation hook function that is used both here
// and in the FeatureStatsTable view.
export function useFilteredVolcanoData(props) {
  const {
    data,
    obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed,
    featurePointFoldChangeThreshold,
    featurePointSignificanceThreshold,
    sampleSetSelection,
  } = props;


  const computedData = useMemo(() => data.map((d) => {
    const { metadata } = d;

    const coordinationValues = metadata.coordination_values;

    const rawObsSetPath = coordinationValues.obsSetFilter
      ? coordinationValues.obsSetFilter[0]
      : coordinationValues.obsSetSelection[0];
    const obsSetPath = [...rawObsSetPath];
    obsSetPath[0] = obsSetsColumnNameMappingReversed[rawObsSetPath[0]];

    // Swap the foldchange direction if backwards with
    // respect to the current sampleSetSelection pair.
    // TODO: move this swapping into the computedData useMemo?
    let shouldSwapFoldChangeDirection = false;
    if (
      coordinationValues.sampleSetFilter
      && coordinationValues.sampleSetFilter.length === 2
    ) {
      const rawSampleSetPathA = coordinationValues.sampleSetFilter[0];
      const sampleSetPathA = [...rawSampleSetPathA];
      sampleSetPathA[0] = sampleSetsColumnNameMappingReversed[rawSampleSetPathA[0]];

      const rawSampleSetPathB = coordinationValues.sampleSetFilter[1];
      const sampleSetPathB = [...rawSampleSetPathB];
      sampleSetPathB[0] = sampleSetsColumnNameMappingReversed[rawSampleSetPathB[0]];

      if (
        isEqual(sampleSetPathA, sampleSetSelection[1])
        && isEqual(sampleSetPathB, sampleSetSelection[0])
      ) {
        shouldSwapFoldChangeDirection = true;
      }
    }

    return ({
      ...d,
      df: {
        ...d.df,
        minusLog10p: d.df.featureSignificance.map(v => -Math.log10(v)),
        logFoldChange: d.df.featureFoldChange.map(v => (
          Math.log2(v) * (shouldSwapFoldChangeDirection ? -1 : 1)
        )),
      },
    });
  }), [
    data, obsSetsColumnNameMappingReversed, sampleSetsColumnNameMappingReversed,
    sampleSetSelection,
  ]);

  const filteredData = useMemo(() => computedData.map(obj => ({
    ...obj,
    // Instead of an object of one array per column,
    // this is now an array of one object per row.
    df: obj.df.featureId.map((featureId, i) => ({
      featureId,
      logFoldChange: obj.df.logFoldChange[i],
      featureSignificance: obj.df.featureSignificance[i],
      minusLog10p: obj.df.minusLog10p[i],
    })).filter(d => (
      (Math.abs(d.logFoldChange) >= (featurePointFoldChangeThreshold ?? 1.0))
      && (d.featureSignificance <= (featurePointSignificanceThreshold ?? 0.05))
    )),
  })), [computedData, featurePointFoldChangeThreshold, featurePointSignificanceThreshold]);

  return [computedData, filteredData];
}
