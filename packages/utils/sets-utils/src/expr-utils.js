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
 * Aggregate per-cell expression arrays across multiple features.
 * @param {Array<Float32Array|Uint8Array>} expressionArrays Array of per-cell expression arrays,
 *   one per feature. Each array should have the same length (number of cells).
 * @param {string|number} featureAggregationStrategy Aggregation strategy:
 *   - 'first': use first feature array
 *   - 'last': use last feature array
 *   - number: use feature at that index
 *   - 'sum': sum all features element-wise
 *   - 'mean': mean of all features element-wise
 *   - 'difference': difference between first two features (requires exactly 2 features)
 * @returns {Float32Array|null} Single aggregated per-cell array, or null if no data
 */
export function aggregateExpressionArrays(expressionArrays, featureAggregationStrategy) {
  const startTime = performance.now();

  if (!expressionArrays || expressionArrays.length === 0 || !expressionArrays[0]) {
    const endTime = performance.now();
    console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
    return null;
  }

  const numFeatures = expressionArrays.length;
  const base = expressionArrays[0];
  const length = base.length;

  // Single feature or default: first
  if (numFeatures === 1 || !featureAggregationStrategy || featureAggregationStrategy === 'first') {
    const endTime = performance.now();
    console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
    return base;
  }

  if (featureAggregationStrategy === 'last') {
    const last = expressionArrays.at(-1);
    const endTime = performance.now();
    console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
    return last || null;
  }

  if (typeof featureAggregationStrategy === 'number') {
    const i = featureAggregationStrategy;
    if (i >= 0 && i < numFeatures) {
      const arr = expressionArrays[i];
      const endTime = performance.now();
      console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
      return arr || null;
    }
    // Fallback to first feature if index is invalid
    const endTime = performance.now();
    console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
    return base;
  }

  if (featureAggregationStrategy === 'sum' || featureAggregationStrategy === 'mean') {
    const out = new Float32Array(length);
    let validFeatures = 0;
    for (let g = 0; g < numFeatures; g += 1) {
      const arr = expressionArrays[g];
      if (!arr) continue; // Skip null/undefined arrays
      validFeatures += 1;
      for (let i = 0; i < length; i += 1) {
        out[i] += arr[i];
      }
    }
    if (validFeatures === 0) {
      const endTime = performance.now();
      console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
      return null; // No valid features
    }
    if (featureAggregationStrategy === 'mean') {
      for (let i = 0; i < length; i += 1) {
        out[i] /= validFeatures;
      }
    }
    const endTime = performance.now();
    console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
    return out;
  }

  if (featureAggregationStrategy === 'difference') {
    if (numFeatures === 2) {
      const arr0 = expressionArrays[0];
      const arr1 = expressionArrays[1];
      if (!arr0 || !arr1) {
        const endTime = performance.now();
        console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
        return null; // Can't compute difference if either array is null
      }
      const out = new Float32Array(length);
      for (let i = 0; i < length; i += 1) {
        out[i] = arr0[i] - arr1[i];
      }
      const endTime = performance.now();
      console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
      return out;
    }
    // Fallback if difference is requested but we don't have exactly 2 features
    const endTime = performance.now();
    console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
    return base;
  }

  // Default fallback: use first feature
  const endTime = performance.now();
  console.log(`aggregateExpressionArrays runtime: ${(endTime - startTime).toFixed(3)}ms`);
  return base;
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
      // Check if featureValue is already aggregated (single array) or multi-gene (array of arrays)
      const isAlreadyAggregated = arr && arr.length > 0 && typeof arr[0] === 'number';
      if (isAlreadyAggregated) {
        // Single aggregated array: check its length
        return arr.length !== obsIndex.length;
      }
      // Multi-gene arrays: check each sub-array length
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
        let arrConstructor;
        if (arrKey === 'featureValue') {
          // Check if featureValue is already aggregated (single array) or multi-gene (array of arrays)
          const featureValueData = arraysToStratify[arrKey];
          const isAlreadyAggregated = featureValueData && featureValueData.length > 0
            && typeof featureValueData[0] === 'number';
          arrConstructor = isAlreadyAggregated
            ? featureValueData.constructor
            : featureValueData[0].constructor;
        } else {
          arrConstructor = arraysToStratify[arrKey].constructor;
        }
        const newArr = new arrConstructor(arrLen);
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
        // Check if featureValue is already aggregated (single array) or multi-gene (array of arrays)
        const featureValueData = arraysToStratify[arrKey];
        // If first element is a number, it's already aggregated (single typed/regular array)
        // If first element is array-like (has length property), it's multi-gene (array of arrays)
        const isAlreadyAggregated = featureValueData && featureValueData.length > 0
          && typeof featureValueData[0] === 'number';

        if (isAlreadyAggregated) {
          // Already aggregated: just use the single array
          value = featureValueData[i];
        } else {
          // Multi-gene arrays: aggregate according to strategy
          if (featureAggregationStrategy === 'first') {
            value = arraysToStratify[arrKey][0][i];
          } else if (featureAggregationStrategy === 'last') {
            value = arraysToStratify[arrKey].at(-1)[i];
          } else if (typeof featureAggregationStrategy === 'number') {
            const j = featureAggregationStrategy;
            // TODO: more checks here for array index validity.
            value = arraysToStratify[arrKey][j][i];
          } else if (featureAggregationStrategy === 'sum' || featureAggregationStrategy === 'mean') {
            value = arraysToStratify[arrKey].reduce((a, h) => a + h[i], 0);
            if (featureAggregationStrategy === 'mean') {
              value /= arraysToStratify[arrKey].length;
            }
          } else {
            // Default fallback: use first feature
            value = arraysToStratify[arrKey][0][i];
          }
        }
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
      // For now, we just take the first gene.
      // TODO: support multiple genes via signature score method.
      let values;
      if (featureAggregationStrategy === 'first') {
        values = secondLevelInternMap.get(geneSelection[0]);
      } else if (featureAggregationStrategy === 'last') {
        values = secondLevelInternMap.get(geneSelection.at(-1));
      } else if (typeof featureAggregationStrategy === 'number') {
        const i = featureAggregationStrategy;
        if (i >= 0 && i < geneSelection.length) {
          values = secondLevelInternMap.get(geneSelection[i]);
        } else {
          throw new Error('Feature index used for featureAggregationStrategy is invalid.');
        }
      } else if (featureAggregationStrategy === 'sum' || featureAggregationStrategy === 'mean') {
        // Array of per-gene arrays.
        const subarrays = geneSelection
          .map(geneId => secondLevelInternMap.get(geneId));
        // Use reduce+map to sum the arrays element-wise.
        values = subarrays
          .reduce((acc, curr) => acc.map((val, idx) => val + curr[idx]));
        if (featureAggregationStrategy === 'mean') {
          const N = geneSelection.length;
          values = values.map(val => val / N);
        }
      } else if (featureAggregationStrategy === 'difference') {
        if (geneSelection.length === 2) {
          const subarrays = geneSelection
            .map(geneId => secondLevelInternMap.get(geneId));
          values = subarrays
            .reduce((acc, curr) => acc.map((val, idx) => val - curr[idx]));
        } else {
          throw new Error('Expected exactly two selected features when featureAggregationStrategy is difference.');
        }
      }
      result.get(cellSetKey).set(sampleSetKey, values);
    });
  });
  return result;
}
