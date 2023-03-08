import React, { useMemo } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useFeatureSelection, useObsSetsData,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  registerPluginViewType,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { VALUE_TRANSFORM_OPTIONS, getValueTransformFunction } from '@vitessce/utils';
import { treeToObsIndicesBySetNames, mergeObsSets } from '@vitessce/sets-utils';
import { mean } from 'd3-array';
import uuidv4 from 'uuid/v4';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions';
import DotPlot from './DotPlot';
import { useStyles } from './styles';

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
    if (mergedCellSets && cellSetSelection
        && geneSelection && geneSelection.length >= 1
        && expressionData && expressionData.length === geneSelection.length
    ) {
      let exprMax = -Infinity;
      const result = [];
      const cellIndices = {};
      for (let i = 0; i < obsIndex.length; i += 1) {
        cellIndices[obsIndex[i]] = i;
      }
      const setObjects = treeToObsIndicesBySetNames(
        mergedCellSets, cellSetSelection, cellIndices,
      );
      geneSelection.forEach((featureName, featureI) => {
        const featureKey = uuidv4();
        setObjects.forEach((setObj) => {
          let numPos = 0;
          const exprValues = setObj.indices.map((cellIndex) => {
            const value = expressionData[featureI][cellIndex];
            const normValue = value * 100 / 255;
            const transformFunction = getValueTransformFunction(
              featureValueTransform, featureValueTransformCoefficient,
            );
            const transformedValue = transformFunction(normValue);
            if (transformedValue > posThreshold) {
              numPos += 1;
            }
            return transformedValue;
          });
          const exprMean = mean(exprValues);
          const fracPos = numPos / setObj.size;
          result.push({
            key: uuidv4(),
            featureKey,
            groupKey: setObj.key,
            group: setObj.name,
            feature: featureLabelsMap?.get(featureName) || featureName,
            meanExpInGroup: exprMean,
            fracPosInGroup: fracPos,
          });
          exprMax = Math.max(exprMean, exprMax);
        });
      });
      return [result, exprMax];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection,
    mergedCellSets, cellSetSelection,
    featureValueTransform, featureValueTransformCoefficient,
    posThreshold, featureLabelsMap,
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
    featureValuePositivityThreshold: posThreshold,
    // TODO: coordination type for mean expression colormap
  }, {
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setFeatureValuePositivityThreshold: setPosThreshold,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.DOT_PLOT],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  const transformOptions = VALUE_TRANSFORM_OPTIONS;

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  // TODO: support multiple feature labels using featureLabelsType coordination values.
  const [{ featureLabelsMap }, featureLabelsStatus] = useFeatureLabelsData(
    loaders, dataset, addUrl, false, {}, {},
    { featureType },
  );
  const [{ obsIndex }, matrixIndicesStatus] = useObsFeatureMatrixIndices(
    loaders, dataset, addUrl, false,
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets: cellSets }, obsSetsStatus] = useObsSetsData(
    loaders, dataset, addUrl, true, {}, {},
    { obsType },
  );
  const isReady = useReady([
    featureSelectionStatus,
    matrixIndicesStatus,
    obsSetsStatus,
    featureLabelsStatus,
  ]);

  const [resultArr, meanExpressionMax] = useExpressionSummaries(
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
        />
      )}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {resultArr ? (
          <DotPlot
            domainMax={meanExpressionMax}
            data={resultArr}
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            featureType={featureType}
            featureValueType={featureValueType}
            featureValueTransformName={selectedTransformName}
          />
        ) : (
          <span>Select at least one {featureType}.</span>
        )}
      </div>
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    ViewType.DOT_PLOT,
    DotPlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.DOT_PLOT],
  );
}
