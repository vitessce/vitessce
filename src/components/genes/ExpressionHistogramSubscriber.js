import React, { useMemo, useEffect } from 'react';
import { sum } from 'd3-array';

import TitleInfo from '../TitleInfo';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { useUrls, useReady, useGridItemSize } from '../hooks';
import { useObsFeatureMatrixData, useFeatureSelection } from '../data-hooks';
import ExpressionHistogram from './ExpressionHistogram';
import { Component, DataType } from '../../app/constants';

const EXPRESSION_HISTOGRAM_DATA_TYPES = [DataType.OBS_FEATURE_MATRIX];

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
    obsType,
    featureType,
    featureValueType,
    featureSelection: geneSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[Component.EXPRESSION_HISTOGRAM],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl, resetUrls] = useUrls();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    EXPRESSION_HISTOGRAM_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const { obsIndex, featureIndex, obsFeatureMatrix } = useObsFeatureMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true, {}, {},
    { obsType, featureType, featureValueType },
  );
  // Get data from loaders using the data hooks.
  const [expressionData] = useFeatureSelection(
    loaders, dataset, setItemIsReady, false, geneSelection, setItemIsNotReady,
    { obsType, featureType, featureValueType },
  );

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? geneSelection[0]
    : null;

  // From the expression matrix and the list of selected genes,
  // generate the array of data points for the histogram.
  const data = useMemo(() => {
    if (firstGeneSelected && obsFeatureMatrix && expressionData) {
      // Create new cellColors map based on the selected gene.
      return Array.from(expressionData[0]).map((_, index) => {
        const value = expressionData[0][index];
        const normValue = value * 100 / 255;
        return { value: normValue, gene: firstGeneSelected };
      });
    }
    if (obsFeatureMatrix) {
      const numGenes = featureIndex.length;
      return obsIndex.map((cellId, cellIndex) => {
        const values = obsFeatureMatrix.data
          .subarray(cellIndex * numGenes, (cellIndex + 1) * numGenes);
        const sumValue = sum(values) * 100 / 255;
        return { value: sumValue, gene: null };
      });
    }
    return null;
  }, [obsIndex, featureIndex, obsFeatureMatrix, firstGeneSelected, expressionData]);

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
