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
 * `path` and `color`.
 */
export function useExpressionByCellSet(
  expressionData, attrs, cellSets, additionalCellSets,
  geneSelection, cellSetSelection, cellSetColor,
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
      const cellObjects = treeToObjectsBySetNames(mergedCellSets, cellSetSelection, cellSetColor);

      const firstGeneSelected = geneSelection[0];
      // Create new cellColors map based on the selected gene.
      let exprMax = -Infinity;
      const exprValues = cellObjects.map((cell) => {
        const cellIndex = attrs.rows.indexOf(cell.obsId);
        const value = expressionData[0][cellIndex];
        const normValue = value * 100 / 255;
        exprMax = Math.max(normValue, exprMax);
        return { value: normValue, gene: firstGeneSelected, set: cell.name };
      });
      return [exprValues, exprMax];
    }
    return [null, null];
  }, [expressionData, attrs, geneSelection, mergedCellSets, cellSetSelection, cellSetColor]);

  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const setArr = useMemo(() => (mergedCellSets && cellSetSelection
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, cellSetColor)
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor]);

  return [expressionArr, setArr, expressionMax];
}
