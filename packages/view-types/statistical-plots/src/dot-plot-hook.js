/* eslint-disable max-len */
import { useMemo } from 'react';
import { InternMap } from 'internmap';
import { v4 as uuidv4 } from 'uuid';
import {
  mergeObsSets,
  stratifyExpressionData,
} from '@vitessce/sets-utils';
import {
  dotStratifiedExpressionData,
} from './expr-hooks.js';

/**
 * Get expression data for the cells
 * in the selected cell sets.
 * @param {object} expressionMatrix
 * @param {string[]} expressionMatrix.rows Cell IDs.
 * @param {string[]} expressionMatrix.cols Gene names.
 * @param {Uint8Array} expressionMatrix.matrix The
 * flattened expression matrix as a typed array.
 * @param {object} cellSets The cell sets from the dataset.
 * @param {object} additionalCellSets The user-defined cell sets
 * from the coordination space.
 * @param {array} geneSelection Array of selected genes.
 * @param {array} cellSetSelection Array of selected cell set paths.
 * @param {object[]} cellSetColor Array of objects with properties
 * @param {string|null} featureValueTransform The name of the
 * feature value transform function.
 * @param {number} featureValueTransformCoefficient A coefficient
 * to be used in the transform function.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * `path` and `color`.
 */
export function useExpressionSummaries(
  sampleEdges, sampleSets, sampleSetSelection,
  expressionData, obsIndex, cellSets, additionalCellSets,
  geneSelection, cellSetSelection, cellSetColor,
  featureValueTransform, featureValueTransformCoefficient,
  posThreshold, featureLabelsMap,
) {
  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // From the expression matrix and the list of selected genes / cell sets,
  // generate the array of data points for the plot.
  const [resultArr, meanExpressionMax] = useMemo(() => {
    const [stratifiedData, exprMax] = stratifyExpressionData(
      sampleEdges, sampleSets, sampleSetSelection,
      expressionData, obsIndex, mergedCellSets,
      geneSelection, cellSetSelection, cellSetColor,
      featureValueTransform, featureValueTransformCoefficient,
    );
    if (stratifiedData) {
      const dotData = dotStratifiedExpressionData(
        stratifiedData, posThreshold,
      );

      const geneToUuid = new Map(geneSelection?.map(gene => [gene, uuidv4()]));
      const cellSetToUuid = new InternMap(
        cellSetSelection?.map(sampleSet => ([sampleSet, uuidv4()])),
        JSON.stringify,
      );
      const sampleSetToUuid = new InternMap(
        sampleSetSelection?.map(sampleSet => ([sampleSet, uuidv4()])),
        JSON.stringify,
      );

      const result = [];
      Array.from(dotData.entries()).forEach(([cellSetKey, firstLevelInternMap]) => {
        Array.from(firstLevelInternMap.entries()).forEach(([sampleSetKey, secondLevelInternMap]) => {
          Array.from(secondLevelInternMap.entries()).forEach(([geneKey, dotObj]) => {
            const featureName = geneKey;
            result.push({
              key: uuidv4(), // Unique key for this dot.

              featureKey: geneToUuid.get(geneKey),
              feature: featureLabelsMap?.get(featureName) || featureName,

              groupKey: cellSetToUuid.get(cellSetKey),
              group: cellSetKey?.at(-1),

              secondaryGroup: sampleSetKey?.at(-1),
              secondaryGroupKey: sampleSetToUuid.get(sampleSetKey),

              meanExpInGroup: dotObj.meanExpInGroup,
              fracPosInGroup: dotObj.fracPosInGroup,
              pctPosInGroup: dotObj.fracPosInGroup * 100.0,
            });
          });
        });
      });

      return [result, exprMax];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection,
    mergedCellSets, cellSetSelection,
    featureValueTransform, featureValueTransformCoefficient,
    posThreshold, featureLabelsMap,
    sampleEdges, sampleSets, sampleSetSelection,
  ]);

  return [resultArr, meanExpressionMax];
}
