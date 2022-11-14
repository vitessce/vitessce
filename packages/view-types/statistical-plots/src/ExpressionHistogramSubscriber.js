import React, { useMemo } from 'react';
import { sum } from 'd3-array';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsFeatureMatrixData, useFeatureSelection,
  registerPluginViewType,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import ExpressionHistogram from './ExpressionHistogram';
import { useStyles } from './styles';

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
export function ExpressionHistogramSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
  } = props;

  const classes = useStyles();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    featureSelection: geneSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_VALUE_HISTOGRAM],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  // Get data from loaders using the data hooks.
  const [{ obsIndex, featureIndex, obsFeatureMatrix }, matrixStatus] = useObsFeatureMatrixData(
    loaders, dataset, addUrl, true, {}, {},
    { obsType, featureType, featureValueType },
  );
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  const isReady = useReady([
    matrixStatus,
    featureSelectionStatus,
  ]);

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
      <div ref={containerRef} className={classes.vegaContainer}>
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

export function register() {
  registerPluginViewType(
    ViewType.FEATURE_VALUE_HISTOGRAM,
    ExpressionHistogramSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_VALUE_HISTOGRAM],
  );
}
