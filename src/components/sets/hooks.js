import { useMemo } from 'react';
import { mergeCellSets } from '../utils';
import { treeToObjectsBySetNames, treeToSetSizesBySetNames } from './cell-set-utils';

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
 * @param {string} theme "light" or "dark" for the vitessce theme
 * `path` and `color`.
 */
export function useExpressionByCellSet(
  expressionData, expressionDataAttrs, cellSets, additionalCellSets,
  geneSelection, cellSetSelection, cellSetColor, useGeneExpressionTransform,
  theme,
) {
  const mergedCellSets = useMemo(
    () => mergeCellSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // From the expression matrix and the list of selected genes / cell sets,
  // generate the array of data points for the plot.
  const [expressionArr, expressionMax] = useMemo(() => {
    if (mergedCellSets && cellSetSelection
        && geneSelection && geneSelection.length >= 1
        && expressionData
    ) {
      const cellObjects = treeToObjectsBySetNames(
        mergedCellSets, cellSetSelection, cellSetColor, theme,
      );

      const firstGeneSelected = geneSelection[0];
      // Create new cellColors map based on the selected gene.
      let exprMax = -Infinity;
      const cellIndices = {};
      for (let i = 0; i < expressionDataAttrs.rows.length; i += 1) {
        cellIndices[expressionDataAttrs.rows[i]] = i;
      }
      const exprValues = cellObjects.map((cell) => {
        const cellIndex = cellIndices[cell.obsId];
        const value = expressionData[0][cellIndex];
        const normValue = value * 100 / 255;
        const transformedValue = useGeneExpressionTransform ? Math.log(1 + normValue) : normValue;
        exprMax = Math.max(transformedValue, exprMax);
        return { value: transformedValue, gene: firstGeneSelected, set: cell.name };
      });
      return [exprValues, exprMax];
    }
    return [null, null];
  }, [expressionData, expressionDataAttrs, geneSelection, theme,
    mergedCellSets, cellSetSelection, cellSetColor, useGeneExpressionTransform]);

  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const setArr = useMemo(() => (mergedCellSets && cellSetSelection && cellSetColor
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, cellSetColor, theme)
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor, theme]);

  return [expressionArr, setArr, expressionMax];
}
