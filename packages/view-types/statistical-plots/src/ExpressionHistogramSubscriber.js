import React, {
  useMemo, useCallback,
} from 'react';
import { sum } from 'd3-array';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsFeatureMatrixData, useFeatureSelection,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { setObsSelection, getObsInfoFromDataWithinRange } from '@vitessce/sets-utils';
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
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.FEATURE_VALUE_HISTOGRAM,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    featureSelection: geneSelection,
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
    { obsIndex, featureIndex, obsFeatureMatrix }, matrixStatus, matrixUrls,
  ] = useObsFeatureMatrixData(
    loaders, dataset, true, {}, {},
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
  const urls = useUrls([
    matrixUrls,
  ]);

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? geneSelection[0]
    : null;

  // From the expression matrix and the list of selected genes,
  // generate the array of data points for the histogram.
  const data = useMemo(() => {
    if (firstGeneSelected && obsFeatureMatrix && expressionData) {
      return obsIndex.map((cellId, cellIndex) => {
        const value = expressionData[0][cellIndex];
        // Create new cellColors map based on the selected gene.
        const newItem = { value, gene: firstGeneSelected, cellId };
        return newItem;
      });
    }
    if (obsFeatureMatrix) {
      const numGenes = featureIndex.length;
      return obsIndex.map((cellId, cellIndex) => {
        const values = obsFeatureMatrix.data
          .subarray(cellIndex * numGenes, (cellIndex + 1) * numGenes);
        const sumValue = sum(values);
        const newItem = { value: sumValue, gene: null, cellId };
        return newItem;
      });
    }
    return null;
  }, [obsIndex, featureIndex, obsFeatureMatrix, firstGeneSelected, expressionData]);

  const onSelect = useCallback((value) => {
    const geneName = firstGeneSelected ? [firstGeneSelected, 'values'].join(' ') : 'transcript count';

    const selectedCellIds = getObsInfoFromDataWithinRange(value, data);
    setObsSelection(
      selectedCellIds, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Selection ',
      `: based on ${geneName} in range [${value[0].toFixed(1)}, ${value[1].toFixed(1)}] `,
    );
  }, [additionalCellSets, cellSetColor, data, setAdditionalCellSets,
    setCellColorEncoding, setCellSetColor, setCellSetSelection, firstGeneSelected,
  ]);

  return (
    <TitleInfo
      title={`Histogram${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
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
