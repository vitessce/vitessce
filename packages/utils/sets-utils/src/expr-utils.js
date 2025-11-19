/* eslint-disable camelcase */
import { InternMap } from 'internmap';
import { getValueTransformFunction } from '@vitessce/utils';
import { isEqual } from 'lodash-es';
import { log } from '@vitessce/globals';
import {
  treeToSelectedSetMap,
  treeToObsIdsBySetNames,
} from './cell-set-utils.js';

/**
 * Apply aggregation strategy to a single array of values.
 * This is the core aggregation logic used by both single-value and element-wise aggregation.
 * @param {Array<number>} values - Array of values to aggregate
 * @param {string|number} strategy - Aggregation strategy: 'first', 'last', numeric index, 'sum', 'mean', or 'difference'
 * @returns {number} - Aggregated value
 * @throws {Error} - If strategy is invalid
 */
function applyAggregationStrategy(values, strategy) {
  if (strategy === 'first') {
    return values[0];
  }
  if (strategy === 'last') {
    return values.at(-1);
  }
  if (typeof strategy === 'number') {
    const i = strategy;
    if (i >= 0 && i < values.length) {
      return values[i];
    }
    throw new Error(`Feature index ${i} is out of bounds. Array length: ${values.length}`);
  }
  if (strategy === 'sum' || strategy === 'mean') {
    const sum = values.reduce((a, b) => a + b, 0);
    return strategy === 'mean' ? sum / values.length : sum;
  }
  if (strategy === 'difference') {
    if (values.length !== 2) {
      throw new Error('Expected exactly two values when featureAggregationStrategy is difference.');
    }
    return values[0] - values[1];
  }
  throw new Error(`Unknown aggregation strategy: ${strategy}`);
}

/**
 * Aggregate multiple arrays element-wise using the specified strategy.
 * This function can be used to aggregate feature values or gene expression arrays.
 * @param {Array<Array<number>>} arrays - Array of arrays to aggregate. All arrays must have the same length.
 * @param {string|number} strategy - Aggregation strategy: 'first', 'last', numeric index, 'sum', 'mean', or 'difference'
 * @param {number} [observationIndex] - Optional: if provided, aggregate values at this specific observation index
 *   across all arrays (returns a single number). If not provided, aggregates element-wise (returns an array).
 * @returns {Array<number>|number} - Aggregated array (if observationIndex not provided) or single value (if provided)
 * @throws {Error} - If strategy is invalid or arrays don't meet requirements
 */
export function aggregateFeatureArrays(arrays, strategy, observationIndex = null) {
  if (!arrays || arrays.length === 0) {
    throw new Error('Arrays must be provided and non-empty.');
  }

  // If observationIndex is provided, extract values at that index and aggregate once
  if (observationIndex !== null) {
    if (observationIndex < 0 || arrays.some(arr => observationIndex >= arr.length)) {
      throw new Error(`Observation index ${observationIndex} is out of bounds for one or more arrays.`);
    }
    const valuesAtIndex = arrays.map(arr => arr[observationIndex]);
    return applyAggregationStrategy(valuesAtIndex, strategy);
  }

  // Otherwise, aggregate element-wise by applying the strategy at each index
  const firstLength = arrays[0].length;
  if (arrays.some(arr => arr.length !== firstLength)) {
    throw new Error('All arrays must have the same length for element-wise aggregation.');
  }

  // Apply aggregation strategy at each index
  return Array.from({ length: firstLength }, (_, idx) => {
    const valuesAtIndex = arrays.map(arr => arr[idx]);
    return applyAggregationStrategy(valuesAtIndex, strategy);
  });
}

/**
 * Input: selections and data.
 * Output: expression data in a hierarchy like
 * [
 *   {
 *     "selectedCellSet1": {
 *       "selectedSampleSet1": [],
 *     }
 *   },
 *   exprMax
 * ]
 * @param {*} sampleEdges
 * @param {*} sampleSets
 * @param {*} sampleSetSelection
 * @param {*} expressionData
 * @param {*} obsIndex
 * @param {*} mergedCellSets
 * @param {*} geneSelection
 * @param {*} cellSetSelection
 * @param {*} cellSetColor
 * @param {*} featureValueTransform
 * @param {*} featureValueTransformCoefficient
 * @returns
 */
export function stratifyArrays(
  sampleEdges, sampleIdToObsIdsMap,
  sampleSets, sampleSetSelection,
  obsIndex, mergedCellSets, cellSetSelection,
  arraysToStratify, // Assumed to be sorted with respect to the obsIndex.
  featureAggregationStrategy,
) {
  const result = new InternMap([], JSON.stringify);

  const hasSampleSetSelection = Array.isArray(sampleSetSelection) && sampleSetSelection.length > 0;
  const hasCellSetSelection = Array.isArray(cellSetSelection) && cellSetSelection.length > 0;

  const sampleSetKeys = hasSampleSetSelection ? sampleSetSelection : [null];
  const cellSetKeys = hasCellSetSelection ? cellSetSelection : [null];
  const arrKeys = Object.keys(arraysToStratify);

  if (arrKeys.includes('obsIndex') || arrKeys.includes('i')) {
    throw new Error('The keys "obsIndex" and "i" are reserved for internal use.');
  }
  if (Object.entries(arraysToStratify).some(([arrKey, arr]) => {
    if (arrKey === 'featureValue') {
      // The featureValue array is an array of arrays, one per feature,
      // so we instead expect each sub-array to have a length
      // equal to the number of observations.
      return arr.some(a => a.length !== obsIndex.length);
    }
    return arr.length !== obsIndex.length;
  })) {
    // throw new Error('All arrays must have the same length as the obsIndex.');
  }

  const sampleSetInfo = sampleSets && sampleSetSelection
    ? treeToObsIdsBySetNames(sampleSets, sampleSetSelection)
    : null;
  const cellSetInfo = mergedCellSets && cellSetSelection
    ? treeToObsIdsBySetNames(mergedCellSets, cellSetSelection)
    : null;

  // First level: cell set
  cellSetKeys.forEach((cellSetKey) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    // Second level: sample set
    sampleSetKeys.forEach((sampleSetKey) => {
      result.get(cellSetKey).set(sampleSetKey, new InternMap([], JSON.stringify));
      // Third level: array

      // Handle cellSetKey and sampleSetKey being null.
      const sampleIdsInSampleSet = (sampleSetInfo && sampleSetKey
        ? sampleSetInfo?.find(n => isEqual(n.path, sampleSetKey))
        : null
      )?.ids;
      // The sampleSets contain sampleIds. We need to get the obsIds
      // corresponding to each sampleId.
      const obsIdsInSampleSet = sampleIdsInSampleSet
        ? sampleIdsInSampleSet.flatMap(sampleId => sampleIdToObsIdsMap?.get(sampleId) || [])
        : null;
      const obsIdsInCellSet = (cellSetInfo && cellSetKey
        ? cellSetInfo?.find(n => isEqual(n.path, cellSetKey))
        : null
      )?.ids;

      // Handle cases where obsIdsInSampleSet and/or obsIdsInCellSet is null.
      let subObsIndex = obsIndex;
      if (obsIdsInSampleSet && obsIdsInCellSet) {
        subObsIndex = Array.from(
          (new Set(obsIdsInSampleSet)).intersection(new Set(obsIdsInCellSet)),
        );
      } else if (obsIdsInSampleSet) {
        subObsIndex = obsIdsInSampleSet;
      } else if (obsIdsInCellSet) {
        subObsIndex = obsIdsInCellSet;
      }
      const arrLen = subObsIndex.length;

      arrKeys.forEach((arrKey) => {
        // Instantiate a new array of the appropriate size.
        const newArr = new arraysToStratify[arrKey].constructor(arrLen);
        result.get(cellSetKey).get(sampleSetKey).set(arrKey, newArr);
      });
      result.get(cellSetKey).get(sampleSetKey).set('obsIndex', subObsIndex);
      // We initialize an incrementer to keep track of
      // the next index to use for insertion into the array.
      result.get(cellSetKey).get(sampleSetKey).set('i', 0);
    });
  });

  const sampleIdToSetMap = sampleSets && sampleSetSelection
    ? treeToSelectedSetMap(sampleSets, sampleSetSelection)
    : null;
  const cellIdToSetMap = mergedCellSets && cellSetSelection
    ? treeToSelectedSetMap(mergedCellSets, cellSetSelection)
    : null;

  // Iterate over every observation.
  // Insert the ID and all corresponding values into
  // the appropriate arrays within the InternMap.
  let cellCount = 0;
  for (let i = 0; i < obsIndex.length; i += 1) {
    const obsId = obsIndex[i];

    const cellSet = cellIdToSetMap?.get(obsId) || null;
    const sampleId = sampleEdges?.get(obsId);
    const sampleSet = sampleId ? (sampleIdToSetMap?.get(sampleId) || null) : null;

    if ((hasSampleSetSelection && !sampleSet) || (hasCellSetSelection && !cellSet)) {
      // Skip this sample if it is not in the selected sample set.
      // eslint-disable-next-line no-continue
      continue;
    }

    const insertionIndex = result.get(cellSet).get(sampleSet).get('i');

    // eslint-disable-next-line no-loop-func
    arrKeys.forEach((arrKey) => {
      let value;
      if (arrKey === 'featureValue') {
        value = aggregateFeatureArrays(
          arraysToStratify[arrKey],
          featureAggregationStrategy,
          i,
        );
      } else {
        value = arraysToStratify[arrKey][i];
      }

      result
        .get(cellSet)
        .get(sampleSet)
        .get(arrKey)[insertionIndex] = value;
    });
    result.get(cellSet).get(sampleSet).set('i', insertionIndex + 1);
    cellCount += 1;
  }

  cellSetKeys.forEach((cellSetKey) => {
    // Second level: sample set
    sampleSetKeys.forEach((sampleSetKey) => {
      const finalInsertionIndex = result.get(cellSetKey).get(sampleSetKey).get('i');
      if (finalInsertionIndex !== result.get(cellSetKey).get(sampleSetKey).get('obsIndex').length) {
        log.warn('The final insertion index is lower than expected.');
      }
      result.get(cellSetKey).get(sampleSetKey).delete('i');
    });
  });

  return [result, cellCount];
}

/**
 * Input: selections and data.
 * Output: expression data in a hierarchy like
 * [
 *   {
 *     "selectedCellSet1": {
 *       "selectedSampleSet1": [],
 *     }
 *   },
 *   exprMax
 * ]
 * @param {*} sampleEdges
 * @param {*} sampleSets
 * @param {*} sampleSetSelection
 * @param {*} expressionData
 * @param {*} obsIndex
 * @param {*} mergedCellSets
 * @param {*} geneSelection
 * @param {*} cellSetSelection
 * @param {*} cellSetColor
 * @param {*} featureValueTransform
 * @param {*} featureValueTransformCoefficient
 * @returns
 */
export function stratifyExpressionData(
  sampleEdges, sampleSets, sampleSetSelection,
  expressionData, obsIndex, mergedCellSets,
  geneSelection, cellSetSelection,
  cellSetColor, // TODO: remove this parameter
  featureValueTransform, featureValueTransformCoefficient,
) {
  const result = new InternMap([], JSON.stringify);

  const hasSampleSetSelection = Array.isArray(sampleSetSelection) && sampleSetSelection.length > 0;
  const hasCellSetSelection = Array.isArray(cellSetSelection) && cellSetSelection.length > 0;
  const hasGeneSelection = Array.isArray(geneSelection) && geneSelection.length > 0;

  const sampleSetKeys = hasSampleSetSelection ? sampleSetSelection : [null];
  const cellSetKeys = hasCellSetSelection ? cellSetSelection : [null];
  const geneKeys = hasGeneSelection ? geneSelection : [null];

  // TODO: return a flat array with { cellSet, sampleSet, gene } objects.
  // Then, use d3.group to create nested InternMaps.


  // First level: cell set
  cellSetKeys.forEach((cellSetKey) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    // Second level: sample set
    sampleSetKeys.forEach((sampleSetKey) => {
      result.get(cellSetKey).set(sampleSetKey, new InternMap([], JSON.stringify));
      // Third level: gene
      geneKeys.forEach((geneKey) => {
        result.get(cellSetKey).get(sampleSetKey).set(geneKey, []);
      });
    });
  });


  if (mergedCellSets && cellSetSelection
      && geneSelection && geneSelection.length >= 1
      && expressionData
  ) {
    const sampleIdToSetMap = sampleSets && sampleSetSelection
      ? treeToSelectedSetMap(sampleSets, sampleSetSelection)
      : null;
    const cellIdToSetMap = treeToSelectedSetMap(mergedCellSets, cellSetSelection);

    let exprMax = -Infinity;

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

      // eslint-disable-next-line no-loop-func
      geneKeys.forEach((geneKey, geneI) => {
        const value = expressionData[geneI][i];
        const transformFunction = getValueTransformFunction(
          featureValueTransform, featureValueTransformCoefficient,
        );
        const transformedValue = transformFunction(value);
        exprMax = Math.max(transformedValue, exprMax);

        result
          .get(cellSet)
          ?.get(sampleSet)
          ?.get(geneKey)
          ?.push(transformedValue);
      });
    }
    return [result, exprMax];
  }
  return [null, null];
}

/**
 * Supports three-level stratified input
 * (cell set, sample set, gene).
 * Returns two-level stratified output (cell set, sample set).
 * Aggregate stratified expression data so that there is
 * a single value for each (cell set, sample set) tuple.
 * I.e., aggregate along the gene axis.
 * @param {*} stratifiedResult
 * @param {*} geneSelection
 * @param {number|string} featureAggregationStrategy
 * @returns
 */
export function aggregateStratifiedExpressionData(
  stratifiedResult, geneSelection, featureAggregationStrategy,
) {
  const result = new InternMap([], JSON.stringify);
  Array.from(stratifiedResult.entries()).forEach(([cellSetKey, firstLevelInternMap]) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    Array.from(firstLevelInternMap.entries()).forEach(([sampleSetKey, secondLevelInternMap]) => {
      // Get arrays for all selected genes
      const geneArrays = geneSelection
        .map(geneId => secondLevelInternMap.get(geneId));
      // Aggregate element-wise using the shared function
      const values = aggregateFeatureArrays(
        geneArrays,
        featureAggregationStrategy,
      );
      result.get(cellSetKey).set(sampleSetKey, values);
    });
  });
  return result;
}
