import React, { useEffect, useReducer } from 'react';
import TitleInfo from '../TitleInfo';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { useGeneSelection, useExpressionAttrs, useCellSetsData } from '../data-hooks';
import { useExpressionByCellSet } from './hooks';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions';

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
    geneExpressionTransform,
    cellSetSelection,
    cellSetColor,
    additionalCellSets,
  }, {
    setGeneExpressionTransform,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSetExpression, coordinationScopes);

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl, resetUrls] = useUrls();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    CELL_SET_EXPRESSION_DATA_TYPES,
  );

  const [useGeneExpressionTransform, toggleGeneExpressionTransform] = useReducer((v) => {
    const newValue = !v;
    setGeneExpressionTransform(newValue ? 'log1p' : null);
    return newValue;
  }, geneExpressionTransform);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [expressionData] = useGeneSelection(
    loaders, dataset, setItemIsReady, false, geneSelection, setItemIsNotReady,
  );
  const [attrs] = useExpressionAttrs(
    loaders, dataset, setItemIsReady, addUrl, false,
  );
  const [cellSets] = useCellSetsData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  const [expressionArr, setArr, expressionMax] = useExpressionByCellSet(
    expressionData, attrs, cellSets, additionalCellSets,
    geneSelection, cellSetSelection, cellSetColor, useGeneExpressionTransform,
    theme,
  );

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? geneSelection[0]
    : null;
  return (
    <TitleInfo
      title={`Expression by Cell Set${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <CellSetExpressionPlotOptions
          useGeneExpressionTransform={useGeneExpressionTransform}
          toggleGeneExpressionTransform={toggleGeneExpressionTransform}
        />
      )}
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
            useGeneExpressionTransform={useGeneExpressionTransform}
          />
        ) : (
          <span>Select a gene.</span>
        )}
      </div>
    </TitleInfo>
  );
}
