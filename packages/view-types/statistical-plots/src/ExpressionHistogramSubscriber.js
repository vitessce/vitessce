import React, {
  useMemo, useCallback,
} from 'react';
import { sum } from 'd3-array';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsFeatureMatrixData, useFeatureSelection,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { setObsSelection, getObsInfoFromDataWithinRange } from '@vitessce/sets-utils';
import { aggregateFeatureArrays } from '@vitessce/utils';
import ExpressionHistogram from './ExpressionHistogram.js';
import { useStyles } from './styles.js';
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
    coordinationScopes: coordinationScopesRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.FEATURE_VALUE_HISTOGRAM,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    featureSelection: geneSelection,
    featureAggregationStrategy,
    additionalObsSets: additionalCellSets,
    obsSetColor: cellSetColor,
  }, {
    setAdditionalObsSets: setAdditionalCellSets,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetSelection: setCellSetSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_VALUE_HISTOGRAM],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();

  // Get data from loaders using the data hooks.
  const [
    { obsIndex, featureIndex, obsFeatureMatrix },
    matrixStatus, matrixUrls, matrixError,
  ] = useObsFeatureMatrixData(
    loaders, dataset, true, {}, {},
    { obsType, featureType, featureValueType },
  );
  const [
    // eslint-disable-next-line no-unused-vars
    expressionData, loadedFeatureSelection, featureSelectionStatus, featureSelectionErrors,
  ] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  // Consolidate error values from data hooks.
  const errors = [
    matrixError,
    ...featureSelectionErrors,
  ];

  const isReady = useReady([
    matrixStatus,
    featureSelectionStatus,
  ]);
  const urls = useUrls([
    matrixUrls,
  ]);

  const numGenesSelected = geneSelection ? geneSelection.length : 0
  const aggregationStrategy = featureAggregationStrategy ?? 'first';
  const titleSuffix = numGenesSelected > 1 ? ` (${numGenesSelected} genes, ${aggregationStrategy})` : numGenesSelected === 1 ? ` (${geneSelection[0]})` : '';

  // From the expression matrix and the list of selected genes,
  // generate the array of data points for the histogram.
  const data = useMemo(() => {
    if (numGenesSelected > 0 && obsFeatureMatrix && expressionData) {
      let expressionDataToUse = expressionData;
      if (numGenesSelected > 1) {
        const aggregatedData = aggregateFeatureArrays(expressionData, aggregationStrategy);
        if (aggregatedData) {
          expressionDataToUse = [aggregatedData];
        }
        else {
          console.error('Error aggregating feature arrays');
        }
      }
      return obsIndex.map((cellId, cellIndex) => {
        const value = expressionDataToUse[0][cellIndex];
        // Create new cellColors map based on the selected gene.
        const newItem = { value, cellId };
        return newItem;
      });
    }
    if (obsFeatureMatrix) {
      const numGenes = featureIndex.length;
      return obsIndex.map((cellId, cellIndex) => {
        const values = obsFeatureMatrix.data
          .subarray(cellIndex * numGenes, (cellIndex + 1) * numGenes);
        const sumValue = sum(values);
        const newItem = { value: sumValue, cellId };
        return newItem;
      });
    }
    return null;
  }, [obsIndex, featureIndex, obsFeatureMatrix, expressionData, numGenesSelected, aggregationStrategy]);

  const onSelect = useCallback((value) => {
    let geneName;
    if (numGenesSelected > 1) {
      geneName = `${numGenesSelected} genes (${aggregationStrategy})`;
    } else if (firstGeneSelected) {
      geneName = [firstGeneSelected, 'values'].join(' ');
    } else {
      geneName = 'transcript count';
    }

    const selectedCellIds = getObsInfoFromDataWithinRange(value, data);
    setObsSelection(
      selectedCellIds, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Selection ',
      `: based on ${geneName} in range [${value[0].toFixed(1)}, ${value[1].toFixed(1)}] `,
    );
  }, [additionalCellSets, cellSetColor, data, setAdditionalCellSets,
    setCellColorEncoding, setCellSetColor, setCellSetSelection, 
    numGenesSelected, aggregationStrategy,
  ]);

  return (
    <TitleInfo
      title={`Histogram ${titleSuffix}`}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      errors={errors}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        <ExpressionHistogram
          geneSelection={geneSelection}
          obsType={obsType}
          featureType={featureType}
          featureValueType={featureValueType}
          onSelect={onSelect}
          data={data}
          theme={theme}
          width={width}
          height={height}
        />
      </div>
    </TitleInfo>
  );
}
