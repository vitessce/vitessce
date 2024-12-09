/* eslint-disable camelcase */
import { InternMap } from 'internmap';
import { getValueTransformFunction } from '@vitessce/utils';
import { isEqual } from 'lodash-es';
import {
  treeToSelectedSetMap,
  treeToObsIdsBySetNames,
} from './cell-set-utils.js';

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
  if (Object.values(arraysToStratify).some(arr => arr.length !== obsIndex.length)) {
    throw new Error('All arrays must have the same length as the obsIndex.');
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
      const value = arraysToStratify[arrKey][i];

      result
        .get(cellSet)
        .get(sampleSet)
        .get(arrKey)[insertionIndex] = value;
    });
    result.get(cellSet).get(sampleSet).set('i', insertionIndex + 1);
  }

  cellSetKeys.forEach((cellSetKey) => {
    // Second level: sample set
    sampleSetKeys.forEach((sampleSetKey) => {
      const finalInsertionIndex = result.get(cellSetKey).get(sampleSetKey).get('i');
      if (finalInsertionIndex !== result.get(cellSetKey).get(sampleSetKey).get('obsIndex').length) {
        console.warn('The final insertion index is lower than expected.');
      }
      result.get(cellSetKey).get(sampleSetKey).delete('i');
    });
  });

  return result;
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
      const sampleSet = sampleId ? sampleIdToSetMap?.get(sampleId) : null;

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
 * @returns
 */
export function aggregateStratifiedExpressionData(
  stratifiedResult, geneSelection,
) {
  const result = new InternMap([], JSON.stringify);
  Array.from(stratifiedResult.entries()).forEach(([cellSetKey, firstLevelInternMap]) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    Array.from(firstLevelInternMap.entries()).forEach(([sampleSetKey, secondLevelInternMap]) => {
      // For now, we just take the first gene.
      // TODO: support multiple genes via signature score method.
      const values = secondLevelInternMap.get(geneSelection[0]);
      result.get(cellSetKey).set(sampleSetKey, values);
    });
  });
  return result;
}
