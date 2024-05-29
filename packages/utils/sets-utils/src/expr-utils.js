/* eslint-disable camelcase */
import { InternMap } from 'internmap';
import { getValueTransformFunction } from '@vitessce/utils';
import { treeToSelectedSetMap } from './cell-set-utils.js';

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
          .get(sampleSet)
          .get(geneKey)
          .push(transformedValue);
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
  ([...stratifiedResult.keys()]).forEach((cellSetKey) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    ([...stratifiedResult.get(cellSetKey).keys()]).forEach((sampleSetKey) => {
      // For now, we just take the first gene.
      // TODO: support multiple genes via signature score method.
      const values = stratifiedResult.get(cellSetKey).get(sampleSetKey).get(geneSelection[0]);
      result.get(cellSetKey).set(sampleSetKey, values);
    });
  });

  return result;
}