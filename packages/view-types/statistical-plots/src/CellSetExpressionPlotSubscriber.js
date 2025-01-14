import React, { useMemo } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useFeatureSelection, useObsSetsData,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useSampleSetsData,
  useSampleEdgesData,
  useExpandedFeatureLabelsMap,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { VALUE_TRANSFORM_OPTIONS, capitalize, cleanFeatureId } from '@vitessce/utils';
import {
  treeToSetSizesBySetNames,
  mergeObsSets,
  stratifyExpressionData,
  aggregateStratifiedExpressionData,
} from '@vitessce/sets-utils';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions.js';
import CellSetExpressionPlot from './CellSetExpressionPlot.js';
import { useStyles } from './styles.js';
import {
  summarizeStratifiedExpressionData,
  histogramStratifiedExpressionData,
} from './expr-hooks.js';

/**
 * Get expression data for the cells
 * in the selected cell sets.
 * @param {object} expressionMatrix
 * @param {string[]} expressionMatrix.rows Cell IDs.
 * @param {string[]} expressionMatrix.cols Gene names.
 * @param {Uint8Array} expressionMatrix.matrix The
 * flattened expression matrix as a typed array.
 * @param {object} cellSets The cell sets from the dataset.
 * @param {object} additionalCellSets The user-defined cell sets
 * from the coordination space.
 * @param {array} geneSelection Array of selected genes.
 * @param {array} cellSetSelection Array of selected cell set paths.
 * @param {object[]} cellSetColor Array of objects with properties
 * @param {string|null} featureValueTransform The name of the
 * feature value transform function.
 * @param {number} featureValueTransformCoefficient A coefficient
 * to be used in the transform function.
 */
function useExpressionByCellSet(
  sampleEdges, sampleSets, sampleSetSelection,
  expressionData, obsIndex, cellSets, additionalCellSets,
  geneSelection, cellSetSelection, cellSetColor,
  featureValueTransform, featureValueTransformCoefficient,
  theme, yMinProp,
) {
  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // From the expression matrix and the list of selected genes / cell sets,
  // generate the array of data points for the plot.
  const [expressionArr, expressionMax] = useMemo(() => {
    const [stratifiedData, exprMax] = stratifyExpressionData(
      sampleEdges, sampleSets, sampleSetSelection,
      expressionData, obsIndex, mergedCellSets,
      geneSelection, cellSetSelection, cellSetColor,
      featureValueTransform, featureValueTransformCoefficient,
    );
    if (stratifiedData) {
      const aggregateData = aggregateStratifiedExpressionData(
        stratifiedData, geneSelection,
      );
      const summarizedData = summarizeStratifiedExpressionData(
        aggregateData, true,
      );
      const histogramData = histogramStratifiedExpressionData(
        summarizedData, 16, yMinProp,
      );
      return [histogramData, exprMax];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection, theme,
    mergedCellSets, cellSetSelection, cellSetColor,
    featureValueTransform, featureValueTransformCoefficient,
    yMinProp, sampleEdges, sampleSets, sampleSetSelection,
  ]);

  // From the cell sets hierarchy and the list of selected cell sets,
  // generate the array of set sizes data points for the bar plot.
  const setArr = useMemo(() => (mergedCellSets && cellSetSelection && cellSetColor
    ? treeToSetSizesBySetNames(
      mergedCellSets, cellSetSelection, cellSetSelection, cellSetColor, theme,
    )
    : []
  ), [mergedCellSets, cellSetSelection, cellSetColor, theme]);

  return [expressionArr, setArr, expressionMax];
}

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
export function CellSetExpressionPlotSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    jitter = false,
    yMin = null,
    yUnits = null,
    helpText = ViewHelpMapping.OBS_SET_FEATURE_VALUE_DISTRIBUTION,
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
    featureValueTransform,
    featureValueTransformCoefficient,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
    sampleType,
    sampleSetSelection,
    sampleSetColor,
  }, {
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setSampleSetColor,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();

  const transformOptions = VALUE_TRANSFORM_OPTIONS;

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  // TODO: support multiple feature labels using featureLabelsType coordination values.
  // eslint-disable-next-line max-len
  const [{ featureLabelsMap: featureLabelsMapOrig }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [featureLabelsMap, expandedFeatureLabelsStatus] = useExpandedFeatureLabelsMap(
    featureType, featureLabelsMapOrig, { stripCuriePrefixes: true },
  );
  const [{ obsIndex }, matrixIndicesStatus, matrixIndicesUrls] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets: cellSets }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, true, {}, {},
    { obsType },
  );

  const [{ sampleSets }, sampleSetsStatus, sampleSetsUrls] = useSampleSetsData(
    loaders, dataset, false,
    { setSampleSetColor },
    { sampleSetColor },
    { sampleType },
  );

  const [{ sampleEdges }, sampleEdgesStatus, sampleEdgesUrls] = useSampleEdgesData(
    loaders, dataset, false, {}, {},
    { obsType, sampleType },
  );

  const isReady = useReady([
    featureSelectionStatus,
    matrixIndicesStatus,
    obsSetsStatus,
    featureLabelsStatus,
    expandedFeatureLabelsStatus,
    sampleSetsStatus,
    sampleEdgesStatus,
  ]);
  const urls = useUrls([
    featureLabelsUrls,
    matrixIndicesUrls,
    obsSetsUrls,
    sampleSetsUrls,
    sampleEdgesUrls,
  ]);

  const [histogramData, setArr, exprMax] = useExpressionByCellSet(
    sampleEdges, sampleSets, sampleSetSelection,
    expressionData, obsIndex, cellSets, additionalCellSets,
    geneSelection, cellSetSelection, cellSetColor,
    featureValueTransform, featureValueTransformCoefficient,
    theme, yMin,
  );

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? (
      featureLabelsMap?.get(geneSelection[0])
      || featureLabelsMap?.get(cleanFeatureId(geneSelection[0]))
      || geneSelection[0]
    )
    : null;
  const selectedTransformName = transformOptions.find(
    o => o.value === featureValueTransform,
  )?.name;


  return (
    <TitleInfo
      title={`Expression by ${capitalize(obsType)} Set${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      options={(
        <CellSetExpressionPlotOptions
          featureValueTransform={featureValueTransform}
          setFeatureValueTransform={setFeatureValueTransform}
          featureValueTransformCoefficient={featureValueTransformCoefficient}
          setFeatureValueTransformCoefficient={setFeatureValueTransformCoefficient}
          transformOptions={transformOptions}
        />
      )}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {histogramData ? (
          <CellSetExpressionPlot
            yMin={yMin}
            yUnits={yUnits}
            jitter={jitter}
            cellSetSelection={cellSetSelection}
            sampleSetSelection={sampleSetSelection}
            sampleSetColor={sampleSetColor}
            colors={setArr}
            data={histogramData}
            exprMax={exprMax}
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            featureType={featureType}
            featureValueType={featureValueType}
            featureValueTransformName={selectedTransformName}
          />
        ) : (
          <span>Select a {featureType}.</span>
        )}
      </div>
    </TitleInfo>
  );
}
