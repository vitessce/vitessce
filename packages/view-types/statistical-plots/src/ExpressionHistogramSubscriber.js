import React, { useMemo, useState, useEffect, useRef } from 'react';
import { sum } from 'd3-array';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsFeatureMatrixData, useFeatureSelection,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import ExpressionHistogram from './ExpressionHistogram';
import { useStyles } from './styles';
import { setObsSelection } from '@vitessce/sets-utils';
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
    obsColorEncoding: cellColorEncoding,
    obsSetSelection: cellSetSelection,
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
  const [iva, setIva] = useState(0);
  const [ivasData, setIvasData] = useState([]);
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
    console.log("* I AM TRIGGERED");
    if (firstGeneSelected && obsFeatureMatrix && expressionData) {
      console.log("returned 1: ");
      // Create new cellColors map based on the selected gene.
      return Array.from(expressionData[0]).map((_, index) => {
        const value = expressionData[0][index];
        const normValue = value * 100 / 255;
        return { value: normValue, gene: firstGeneSelected };
      });
    }
    if (obsFeatureMatrix) {
      const numGenes = featureIndex.length;
      console.log("returned 2: ");
      return obsIndex.map((cellId, cellIndex) => {
        const values = obsFeatureMatrix.data
          .subarray(cellIndex * numGenes, (cellIndex + 1) * numGenes);
        const sumValue = sum(values) * 100 / 255;
        console.log("54543223");
        ivasData.push({ value: sumValue, gene: null, cellId: cellId });
        setIvasData(ivasData);
        return { value: sumValue, gene: null, cellId: cellId };
      });
    }
    console.log("returned 3: ");
    return null;
  }, [obsIndex, featureIndex, obsFeatureMatrix, firstGeneSelected, expressionData, iva]);


  const onSelect = (value) => {

    setIva(iva + 1);

    console.log("what's next ", ivasData);
    const getCellIdsInRange = (range) => {
      const [lowerBound, upperBound] = range;
    
      return ivasData
        .filter(item => item.value >= lowerBound && item.value <= upperBound)
        .map(item => item.cellId);
    };

    const selectedCellIds = getCellIdsInRange(value);
    setObsSelection(
      selectedCellIds, additionalCellSetsRef.current, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
      'Ivas Amazing Selection ',
    );
  }

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
