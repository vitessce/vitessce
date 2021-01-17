/* eslint-disable */
import React, { useMemo, useEffect } from 'react';
import TitleInfo from '../TitleInfo';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { mergeCellSets } from '../utils';
import { useExpressionMatrixData, useCellSetsData } from '../data-hooks';
import { treeToObjectsBySetNames, treeToSetSizesBySetNames } from './cell-set-utils';
import CellSetExpressionPlot from './CellSetExpressionPlot';

const CELL_SET_EXPRESSION_DATA_TYPES = ['cell-sets', 'expression-matrix'];

/**
 * A subscriber component for `CellSetExpressionPlot`,
 * which listens for gene selection updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {function} props.onReady The function to call when the subscriptions
 * have been made.
 * @param {string} props.theme The name of the current Vitessce theme.
 */
export default function CellSetExpressionPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    geneSelection,
    cellSetSelection,
    cellSetColor,
    additionalCellSets,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSetExpression, coordinationScopes);

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    CELL_SET_EXPRESSION_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );
  const [cellSets] = useCellSetsData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  const mergedCellSets = useMemo(
    () => mergeCellSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );
  

  // From the expression matrix and the list of selected genes / cell sets,
  // generate the array of data points for the plot.
  const data = useMemo(() => {
    if (mergedCellSets && cellSetSelection && geneSelection && geneSelection.length >= 1 && expressionMatrix) {
      
      const cellObjects = treeToObjectsBySetNames(mergedCellSets, cellSetSelection, cellSetColor);

      const firstGeneSelected = geneSelection[0];
      const geneIndex = expressionMatrix.cols.indexOf(firstGeneSelected);
      if (geneIndex !== -1) {
        const numGenes = expressionMatrix.cols.length;
        // Create new cellColors map based on the selected gene.
        return cellObjects.map((cell) => {
          const cellIndex = expressionMatrix.rows.indexOf(cell.obsId);
          const value = expressionMatrix.matrix[cellIndex * numGenes + geneIndex];
          const normValue = value * 100 / 255;
          return { value: normValue, gene: firstGeneSelected, set: cell.name };
        });
      }
    }
    return null;
  }, [expressionMatrix, geneSelection, mergedCellSets, cellSetSelection, cellSetColor]);

  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const colors = useMemo(() => (mergedCellSets && cellSetSelection
    ? treeToSetSizesBySetNames(mergedCellSets, cellSetSelection, cellSetColor)
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor]);

  return (
    <TitleInfo
      title="Expression by Cell Set"
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className="vega-container">
        <CellSetExpressionPlot
          colors={colors}
          data={data}
          theme={theme}
          width={width}
          height={height}
        />
      </div>
    </TitleInfo>
  );
}
