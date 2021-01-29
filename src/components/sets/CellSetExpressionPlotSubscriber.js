import React, { useEffect } from 'react';
import TitleInfo from '../TitleInfo';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { useExpressionMatrixData, useCellSetsData } from '../data-hooks';
import { useExpressionByCellSet } from './hooks';

import CellSetExpressionPlot from './CellSetExpressionPlot';

const CELL_SET_EXPRESSION_DATA_TYPES = ['cell-sets', 'expression-matrix'];

/**
 * A subscriber component for `CellSetExpressionPlot`,
 * which listens for gene selection updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {object} props.coordinationScopes An object mapping coordination
 * types to coordination scopes.
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

  const [expressionArr, setArr, expressionMax] = useExpressionByCellSet(
    expressionMatrix, cellSets, additionalCellSets,
    geneSelection, cellSetSelection, cellSetColor,
  );

  return (
    <TitleInfo
      title="Expression by Cell Set"
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className="vega-container">
        {expressionArr ? (
          <CellSetExpressionPlot
            domainMax={expressionMax}
            colors={setArr}
            data={expressionArr}
            theme={theme}
            width={width}
            height={height}
          />
        ) : (
          <span>Select a gene.</span>
        )}
      </div>
    </TitleInfo>
  );
}
