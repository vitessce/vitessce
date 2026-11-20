/* eslint-disable camelcase */
import { InternMap } from 'internmap';
import { getValueTransformFunction } from '@vitessce/utils';
import {
  treeToSelectedSetMap,
  treeToSetIndicesArray,
  setIndicesFromCodes,
} from './cell-set-utils.js';

const hasSelection = selection => Array.isArray(selection) && selection.length > 0;

/**
 * The smallest unsigned typed array able to hold 1..count plus 0.
 * @param {number} count The number of selected sets.
 * @returns {Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor}
 */
function getSlotArrayType(count) {
  if (count + 1 <= 256) {
    return Uint8Array;
  }
  return count + 1 <= 65536 ? Uint16Array : Uint32Array;
}

/**
 * Resolve the selections to positional "slot" arrays, so that the per-observation
 * work below is a typed-array read rather than a string-keyed map lookup.
 *
 * cellSlot[i] is 1 + the position in cellSetSelection of the selected set
 * containing observation i (0 when in none); null when there is no cell set
 * selection. sampleSlot[i] is the same for sampleSetSelection via sampleEdges
 * (obsId -> sampleId); null when there is no sample set selection.
 *
 * When raw categorical codes are available for this same observation index
 * (checked by reference), the cell set slots come from the codes without
 * walking the tree; otherwise from the tree, resolving each selected set's
 * members once rather than once per observation.
 * @param {object} params
 * @returns {{ cellSlot: ArrayLike<number>|null, sampleSlot: ArrayLike<number>|null }}
 */
function computeStrata({
  obsIndex, mergedCellSets, cellSetSelection, obsSetsColumns,
  sampleEdges, sampleSets, sampleSetSelection,
}) {
  const numObs = obsIndex?.length || 0;
  let cellSlot = null;
  if (hasSelection(cellSetSelection)) {
    if (obsSetsColumns && obsSetsColumns.obsIndex === obsIndex) {
      cellSlot = setIndicesFromCodes({
        columns: obsSetsColumns.columns,
        obsIndex,
        selectedNamePaths: cellSetSelection,
      });
    }
    if (cellSlot === null) {
      cellSlot = treeToSetIndicesArray(mergedCellSets, cellSetSelection, obsIndex);
    }
  }
  let sampleSlot = null;
  if (hasSelection(sampleSetSelection)) {
    const SlotArrayType = getSlotArrayType(sampleSetSelection.length);
    sampleSlot = new SlotArrayType(numObs);
    if (sampleSets && sampleEdges) {
      // Sample sets are small: resolve sampleId -> slot once, then one map lookup
      // per observation to find its sample.
      const slotByPath = new InternMap(
        sampleSetSelection.map((path, i) => [path, i + 1]),
        JSON.stringify,
      );
      const sampleIdToSlot = new Map();
      treeToSelectedSetMap(sampleSets, sampleSetSelection).forEach((path, sampleId) => {
        sampleIdToSlot.set(sampleId, slotByPath.get(path) ?? 0);
      });
      for (let i = 0; i < numObs; i += 1) {
        const sampleId = sampleEdges.get(obsIndex[i]);
        if (sampleId !== undefined) {
          sampleSlot[i] = sampleIdToSlot.get(sampleId) ?? 0;
        }
      }
    }
  }
  return { cellSlot, sampleSlot };
}

/**
 * Assign every observation to a (cell set, sample set) group and count the
 * members of each, so that per-group arrays can be allocated at their final size.
 * @param {object} params
 * @param {number} params.numObs
 * @param {ArrayLike<number>|null} params.cellSlot From computeStrata.
 * @param {ArrayLike<number>|null} params.sampleSlot From computeStrata.
 * @param {number} params.numSampleGroups Number of sample set keys.
 * @param {number} params.numCellGroups Number of cell set keys.
 * @returns {{ groupOfObs: Int32Array, counts: Int32Array, numGroups: number }}
 * groupOfObs[i] = cellGroup * numSampleGroups + sampleGroup, or -1 when excluded.
 */
function assignGroups({
  numObs, cellSlot, sampleSlot, numSampleGroups, numCellGroups,
}) {
  const numGroups = numCellGroups * numSampleGroups;
  const groupOfObs = new Int32Array(numObs);
  const counts = new Int32Array(numGroups);
  for (let i = 0; i < numObs; i += 1) {
    const cellGroup = cellSlot ? cellSlot[i] - 1 : 0;
    const sampleGroup = sampleSlot ? sampleSlot[i] - 1 : 0;
    if (cellGroup < 0 || sampleGroup < 0) {
      groupOfObs[i] = -1;
    } else {
      const group = cellGroup * numSampleGroups + sampleGroup;
      groupOfObs[i] = group;
      counts[group] += 1;
    }
  }
  return { groupOfObs, counts, numGroups };
}

/**
 * Stratify per-observation arrays (e.g. embedding coordinates) by selected cell
 * set and selected sample set.
 *
 * Output: an InternMap keyed by cell set path (or null) of InternMaps keyed by
 * sample set path (or null), each holding one array per key of arraysToStratify
 * (of the same constructor as the input) plus 'obsIndex', all aligned with one
 * another and in observation-index order.
 * @param {Map<string, string>|null} sampleEdges Mapping from obsId to sampleId.
 * @param {object|null} sampleSets Sample sets tree.
 * @param {array|null} sampleSetSelection Selected sample set paths.
 * @param {string[]} obsIndex The observation index the arrays align to.
 * @param {object|null} mergedCellSets Cell sets tree.
 * @param {array|null} cellSetSelection Selected cell set paths.
 * @param {object} arraysToStratify Arrays aligned with obsIndex. The key
 * 'featureValue' holds an array of per-feature arrays, aggregated per
 * featureAggregationStrategy.
 * @param {string|number} featureAggregationStrategy How to combine several
 * features: 'first', 'last', a feature index, 'sum', or 'mean'.
 * @param {object} [options]
 * @param {object} [options.obsSetsColumns] Raw categorical columns for the
 * observation sets, as loaded alongside the tree, for a code-based fast path.
 * @returns {[InternMap, number]} The stratified arrays and the number of
 * observations placed.
 */
export function stratifyArrays(
  sampleEdges, sampleSets, sampleSetSelection,
  obsIndex, mergedCellSets, cellSetSelection,
  arraysToStratify, // Assumed to be sorted with respect to the obsIndex.
  featureAggregationStrategy,
  options = {},
) {
  const { obsSetsColumns = null } = options;
  const arrKeys = Object.keys(arraysToStratify);
  if (arrKeys.includes('obsIndex') || arrKeys.includes('i')) {
    throw new Error('The keys "obsIndex" and "i" are reserved for internal use.');
  }
  const hasSampleSetSelection = hasSelection(sampleSetSelection);
  const hasCellSetSelection = hasSelection(cellSetSelection);
  const sampleSetKeys = hasSampleSetSelection ? sampleSetSelection : [null];
  const cellSetKeys = hasCellSetSelection ? cellSetSelection : [null];
  const numObs = obsIndex?.length || 0;

  const { cellSlot, sampleSlot } = computeStrata({
    obsIndex,
    mergedCellSets,
    cellSetSelection,
    obsSetsColumns,
    sampleEdges,
    sampleSets,
    sampleSetSelection,
  });
  const { groupOfObs, counts, numGroups } = assignGroups({
    numObs,
    cellSlot,
    sampleSlot,
    numSampleGroups: sampleSetKeys.length,
    numCellGroups: cellSetKeys.length,
  });

  // One accessor per array, resolved once rather than per observation.
  const getters = arrKeys.map((arrKey) => {
    const arr = arraysToStratify[arrKey];
    if (arrKey !== 'featureValue') {
      return i => arr[i];
    }
    if (featureAggregationStrategy === 'first') {
      return i => arr[0][i];
    }
    if (featureAggregationStrategy === 'last') {
      return i => arr[arr.length - 1][i];
    }
    if (typeof featureAggregationStrategy === 'number') {
      // TODO: more checks here for array index validity.
      const j = featureAggregationStrategy;
      return i => arr[j][i];
    }
    if (featureAggregationStrategy === 'sum' || featureAggregationStrategy === 'mean') {
      const divisor = featureAggregationStrategy === 'mean' ? arr.length : 1;
      return (i) => {
        let sum = 0;
        for (let h = 0; h < arr.length; h += 1) {
          sum += arr[h][i];
        }
        return sum / divisor;
      };
    }
    return () => undefined;
  });

  // Allocate every group's arrays at their final size.
  const groupArrays = new Array(numGroups);
  for (let g = 0; g < numGroups; g += 1) {
    groupArrays[g] = {
      arrays: arrKeys.map(arrKey => new arraysToStratify[arrKey].constructor(counts[g])),
      obsIndex: new Array(counts[g]),
    };
  }
  const positions = new Int32Array(numGroups);
  let cellCount = 0;
  for (let i = 0; i < numObs; i += 1) {
    const g = groupOfObs[i];
    if (g >= 0) {
      const pos = positions[g];
      positions[g] += 1;
      const target = groupArrays[g];
      for (let a = 0; a < arrKeys.length; a += 1) {
        target.arrays[a][pos] = getters[a](i);
      }
      target.obsIndex[pos] = obsIndex[i];
      cellCount += 1;
    }
  }

  const result = new InternMap([], JSON.stringify);
  cellSetKeys.forEach((cellSetKey, c) => {
    const sampleMap = new InternMap([], JSON.stringify);
    result.set(cellSetKey, sampleMap);
    sampleSetKeys.forEach((sampleSetKey, s) => {
      const group = groupArrays[c * sampleSetKeys.length + s];
      const arrayMap = new InternMap([], JSON.stringify);
      arrKeys.forEach((arrKey, a) => {
        arrayMap.set(arrKey, group.arrays[a]);
      });
      arrayMap.set('obsIndex', group.obsIndex);
      sampleMap.set(sampleSetKey, arrayMap);
    });
  });
  return [result, cellCount];
}

/**
 * Stratify expression values by selected cell set, selected sample set, and gene.
 *
 * Output: an InternMap keyed by cell set path of InternMaps keyed by sample set
 * path (or null) of InternMaps keyed by gene, each holding a plain array of
 * transformed values in observation-index order, plus the maximum transformed
 * value overall.
 * @param {Map<string, string>|null} sampleEdges Mapping from obsId to sampleId.
 * @param {object|null} sampleSets Sample sets tree.
 * @param {array|null} sampleSetSelection Selected sample set paths.
 * @param {ArrayLike<number>[]} expressionData One array per selected gene,
 * aligned with obsIndex.
 * @param {string[]} obsIndex The observation index.
 * @param {object|null} mergedCellSets Cell sets tree.
 * @param {string[]} geneSelection Selected genes.
 * @param {array|null} cellSetSelection Selected cell set paths.
 * @param {object[]} cellSetColor Unused; kept for call compatibility.
 * @param {string|null} featureValueTransform Transform name, e.g. 'log1p'.
 * @param {number} featureValueTransformCoefficient Transform coefficient.
 * @param {object} [options]
 * @param {object} [options.obsSetsColumns] Raw categorical columns for the
 * observation sets, for a code-based fast path.
 * @returns {[InternMap|null, number|null]} The stratified values and the maximum.
 */
export function stratifyExpressionData(
  sampleEdges, sampleSets, sampleSetSelection,
  expressionData, obsIndex, mergedCellSets,
  geneSelection, cellSetSelection,
  cellSetColor, // TODO: remove this parameter
  featureValueTransform, featureValueTransformCoefficient,
  options = {},
) {
  const { obsSetsColumns = null } = options;
  if (!(mergedCellSets && cellSetSelection
    && geneSelection && geneSelection.length >= 1
    && expressionData
  )) {
    return [null, null];
  }
  const hasSampleSetSelection = hasSelection(sampleSetSelection);
  const hasCellSetSelection = hasSelection(cellSetSelection);
  const sampleSetKeys = hasSampleSetSelection ? sampleSetSelection : [null];
  const cellSetKeys = hasCellSetSelection ? cellSetSelection : [null];
  const geneKeys = geneSelection;
  const numObs = obsIndex?.length || 0;
  let exprMax = -Infinity;

  const numGroups = cellSetKeys.length * sampleSetKeys.length;
  // With an empty cell set selection nothing is assigned; the groups stay empty.
  let groupOfObs = null;
  let counts = new Int32Array(numGroups);
  if (hasCellSetSelection) {
    const { cellSlot, sampleSlot } = computeStrata({
      obsIndex,
      mergedCellSets,
      cellSetSelection,
      obsSetsColumns,
      sampleEdges,
      sampleSets,
      sampleSetSelection,
    });
    ({ groupOfObs, counts } = assignGroups({
      numObs,
      cellSlot,
      sampleSlot,
      numSampleGroups: sampleSetKeys.length,
      numCellGroups: cellSetKeys.length,
    }));
  }

  const transform = getValueTransformFunction(
    featureValueTransform, featureValueTransformCoefficient,
  );
  // leaves[group][geneI] is the plain array of values for that group and gene,
  // allocated at its final size (consumers rely on Array methods such as flat()).
  const leaves = new Array(numGroups);
  for (let g = 0; g < numGroups; g += 1) {
    leaves[g] = geneKeys.map(() => new Array(counts[g]));
  }
  if (groupOfObs) {
    const positions = new Int32Array(numGroups);
    geneKeys.forEach((geneKey, geneI) => {
      const column = expressionData[geneI];
      if (!column) {
        // Not loaded yet; leave this gene's arrays unfilled.
        return;
      }
      positions.fill(0);
      for (let i = 0; i < numObs; i += 1) {
        const g = groupOfObs[i];
        if (g >= 0) {
          const value = transform(column[i]);
          if (value > exprMax) {
            exprMax = value;
          }
          leaves[g][geneI][positions[g]] = value;
          positions[g] += 1;
        }
      }
    });
  }

  const result = new InternMap([], JSON.stringify);
  cellSetKeys.forEach((cellSetKey, c) => {
    const sampleMap = new InternMap([], JSON.stringify);
    result.set(cellSetKey, sampleMap);
    sampleSetKeys.forEach((sampleSetKey, s) => {
      const geneMap = new InternMap([], JSON.stringify);
      const group = leaves[c * sampleSetKeys.length + s];
      geneKeys.forEach((geneKey, geneI) => {
        geneMap.set(geneKey, group[geneI]);
      });
      sampleMap.set(sampleSetKey, geneMap);
    });
  });
  return [result, exprMax];
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
