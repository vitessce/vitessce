import React, {
  useMemo, useState, useEffect, useRef,
} from 'react';
import { sum } from 'd3-array';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsFeatureMatrixData, useFeatureSelection,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { setObsSelection } from '@vitessce/sets-utils';
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
  const [urls, addUrl] = useUrls(loaders, dataset);
  const [dataOnSelect, setDataOnSelect] = useState([]);
  const additionalCellSetsRef = useRef(additionalCellSets);

  // Update the ref whenever additionalCellSets changes
  useEffect(() => {
    additionalCellSetsRef.current = additionalCellSets;
  }, [additionalCellSets]);

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
        const newItem = { value: normValue, gene: firstGeneSelected };
        dataOnSelect.push(newItem);
        setDataOnSelect(dataOnSelect);
        return newItem;
      });
    }
    if (obsFeatureMatrix) {
      const numGenes = featureIndex.length;
      return obsIndex.map((cellId, cellIndex) => {
        const values = obsFeatureMatrix.data
          .subarray(cellIndex * numGenes, (cellIndex + 1) * numGenes);
        const sumValue = sum(values) * 100 / 255;
        const newItem = { value: sumValue, gene: null, cellId };
        dataOnSelect.push(newItem);
        setDataOnSelect(dataOnSelect);
        return newItem;
      });
    }
    return null;
  }, [obsIndex, featureIndex, obsFeatureMatrix, firstGeneSelected, expressionData]);


  const onSelect = useCallback((value) => {
    const getCellIdsInRange = (range) => {
      const [lowerBound, upperBound] = range;

      return data
        .filter(item => item.value >= lowerBound && item.value <= upperBound)
        .map(item => item.cellId);
    };

    const selectedCellIds = getCellIdsInRange(value);
    setObsSelection(
      selectedCellIds, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Selection based on transcript count',
    );
  }, [additionalCellSets, cellSetColor, data, setAdditionalCellSets,
    setCellColorEncoding, setCellSetColor, setCellSetSelection,
  ]);

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
