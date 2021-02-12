import React, { useMemo, useEffect } from 'react';
import { sum } from 'd3-array';

import TitleInfo from '../TitleInfo';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { useExpressionMatrixData } from '../data-hooks';
import ExpressionHistogram from './ExpressionHistogram';

const EXPRESSION_HISTOGRAM_DATA_TYPES = ['expression-matrix'];

/**
 * A subscriber component for `ExpressionHistogram`,
 * which listens for gene selection updates and
 * `GRID_RESIZE` events.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {object} props.coordinationScopes An object mapping coordination
 * types to coordination scopes.
 * @param {string} props.theme The name of the current Vitessce theme.
 */
export default function ExpressionHistogramSubscriber(props) {
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
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.expressionHistogram, coordinationScopes);

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    EXPRESSION_HISTOGRAM_DATA_TYPES,
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

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? geneSelection[0]
    : null;

  // From the expression matrix and the list of selected genes,
  // generate the array of data points for the histogram.
  const data = useMemo(() => {
    if (firstGeneSelected && expressionMatrix) {
      const numGenes = expressionMatrix.cols.length;
      const geneIndex = expressionMatrix.cols.indexOf(firstGeneSelected);
      if (geneIndex !== -1) {
        // Create new cellColors map based on the selected gene.
        return expressionMatrix.rows.map((cellId, cellIndex) => {
          const value = expressionMatrix.matrix[cellIndex * numGenes + geneIndex];
          const normValue = value * 100 / 255;
          return { value: normValue, gene: firstGeneSelected };
        });
      }
    } else if (expressionMatrix) {
      const numGenes = expressionMatrix.cols.length;
      return expressionMatrix.rows.map((cellId, cellIndex) => {
        const values = expressionMatrix.matrix
          .subarray(cellIndex * numGenes, (cellIndex + 1) * numGenes);
        const sumValue = sum(values) * 100 / 255;
        return { value: sumValue, gene: null };
      });
    }
    return null;
  }, [expressionMatrix, firstGeneSelected]);

  return (
    <TitleInfo
      title={`Expression Histogram${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className="vega-container">
        <ExpressionHistogram
          geneSelection={geneSelection}
          data={data}
          theme={theme}
          width={width}
          height={height}
        />
      </div>
    </TitleInfo>
  );
}
