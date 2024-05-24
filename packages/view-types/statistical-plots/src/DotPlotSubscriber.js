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
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { VALUE_TRANSFORM_OPTIONS } from '@vitessce/utils';
import { mergeObsSets } from '@vitessce/sets-utils';
import { InternMap } from 'internmap';
import { v4 as uuidv4 } from 'uuid';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions.js';
import DotPlot from './DotPlot.js';
import { useStyles } from './styles.js';
import {
  stratifyExpressionData,
  dotStratifiedExpressionData,
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
 * @param {string} theme "light" or "dark" for the vitessce theme
 * `path` and `color`.
 */
export function useExpressionSummaries(
  sampleEdges, sampleSets, sampleSetSelection,
  expressionData, obsIndex, cellSets, additionalCellSets,
  geneSelection, cellSetSelection, cellSetColor,
  featureValueTransform, featureValueTransformCoefficient,
  posThreshold, featureLabelsMap,
) {
  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // From the expression matrix and the list of selected genes / cell sets,
  // generate the array of data points for the plot.
  const [resultArr, meanExpressionMax] = useMemo(() => {
    const [stratifiedData, exprMax] = stratifyExpressionData(
      sampleEdges, sampleSets, sampleSetSelection,
      expressionData, obsIndex, mergedCellSets,
      geneSelection, cellSetSelection, cellSetColor,
      featureValueTransform, featureValueTransformCoefficient,
      'light',
    );
    if (stratifiedData) {
      const dotData = dotStratifiedExpressionData(
        stratifiedData, posThreshold,
      );

      const geneToUuid = new Map(geneSelection?.map(gene => [gene, uuidv4()]));
      const cellSetToUuid = new InternMap(
        cellSetSelection?.map(sampleSet => ([sampleSet, uuidv4()])),
        JSON.stringify,
      );
      const sampleSetToUuid = new InternMap(
        sampleSetSelection?.map(sampleSet => ([sampleSet, uuidv4()])),
        JSON.stringify,
      );

      const result = [];
      ([...dotData.keys()]).forEach((cellSetKey) => {
        ([...dotData.get(cellSetKey).keys()]).forEach((sampleSetKey) => {
          ([...dotData.get(cellSetKey).get(sampleSetKey).keys()]).forEach((geneKey) => {
            const dotObj = dotData.get(cellSetKey).get(sampleSetKey).get(geneKey);
            const featureName = geneKey;
            result.push({
              key: uuidv4(), // Unique key for this dot.

              featureKey: geneToUuid.get(geneKey),
              feature: featureLabelsMap?.get(featureName) || featureName,

              groupKey: cellSetToUuid.get(cellSetKey),
              group: cellSetKey.at(-1),

              secondaryGroup: sampleSetKey?.at(-1),
              secondaryGroupKey: sampleSetToUuid.get(sampleSetKey),

              meanExpInGroup: dotObj.meanExpInGroup,
              fracPosInGroup: dotObj.fracPosInGroup,
              pctPosInGroup: dotObj.fracPosInGroup * 100.0,
            });
          });
        });
      });

      return [result, exprMax];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection,
    mergedCellSets, cellSetSelection,
    featureValueTransform, featureValueTransformCoefficient,
    posThreshold, featureLabelsMap,
    sampleEdges, sampleSets, sampleSetSelection,
  ]);

  return [resultArr, meanExpressionMax];
}


/**
 * A subscriber component for DotPlot.
 * @param {object} props
 * @param {function} props.removeGridComponent The grid component removal function.
 * @param {object} props.coordinationScopes An object mapping coordination
 * types to coordination scopes.
 * @param {string} props.theme The name of the current Vitessce theme.
 */
export function DotPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Dot Plot',
    transpose = true,
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
    featureValuePositivityThreshold: posThreshold,
    featureValueColormap,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
    sampleType,
    sampleSetSelection,
  }, {
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setFeatureValuePositivityThreshold: setPosThreshold,
    setFeatureValueColormap,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.DOT_PLOT],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();

  const transformOptions = VALUE_TRANSFORM_OPTIONS;
  const isStratified = Array.isArray(sampleSetSelection) && sampleSetSelection.length > 1;

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  // TODO: support multiple feature labels using featureLabelsType coordination values.
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrl] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [{ obsIndex }, matrixIndicesStatus, matrixIndicesUrl] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets: cellSets }, obsSetsStatus, obsSetsUrl] = useObsSetsData(
    loaders, dataset, true, {}, {},
    { obsType },
  );

  const [{ sampleSets }, sampleSetsStatus, sampleSetsUrl] = useSampleSetsData(
    loaders, dataset, false, {}, {},
    { sampleType },
  );

  const [{ sampleEdges }, sampleEdgesStatus, sampleEdgesUrl] = useSampleEdgesData(
    loaders, dataset, false, {}, {},
    { obsType, sampleType },
  );

  const isReady = useReady([
    featureSelectionStatus,
    matrixIndicesStatus,
    obsSetsStatus,
    featureLabelsStatus,
    sampleSetsStatus,
    sampleEdgesStatus,
  ]);
  const urls = useUrls([
    featureLabelsUrl,
    matrixIndicesUrl,
    obsSetsUrl,
    sampleSetsUrl,
    sampleEdgesUrl,
  ]);

  const [resultArr, meanExpressionMax] = useExpressionSummaries(
    sampleEdges, sampleSets, sampleSetSelection,
    expressionData, obsIndex, cellSets, additionalCellSets,
    geneSelection, cellSetSelection, cellSetColor,
    featureValueTransform, featureValueTransformCoefficient,
    posThreshold, featureLabelsMap,

  );
  const selectedTransformName = transformOptions.find(
    o => o.value === featureValueTransform,
  )?.name;

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <CellSetExpressionPlotOptions
          featureValueTransform={featureValueTransform}
          setFeatureValueTransform={setFeatureValueTransform}
          featureValueTransformCoefficient={featureValueTransformCoefficient}
          setFeatureValueTransformCoefficient={setFeatureValueTransformCoefficient}
          transformOptions={transformOptions}
          featureValuePositivityThreshold={posThreshold}
          setFeatureValuePositivityThreshold={setPosThreshold}
          featureValueColormap={featureValueColormap}
          setFeatureValueColormap={setFeatureValueColormap}
        />
      )}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {resultArr ? (
          <DotPlot
            isStratified={isStratified}
            transpose={transpose}
            domainMax={meanExpressionMax}
            data={resultArr}
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            featureType={featureType}
            featureValueType={featureValueType}
            featureValueTransformName={selectedTransformName}
            featureValueColormap={featureValueColormap}
            cellSetSelection={cellSetSelection}
          />
        ) : (
          <span>Select at least one {featureType}.</span>
        )}
      </div>
    </TitleInfo>
  );
}
