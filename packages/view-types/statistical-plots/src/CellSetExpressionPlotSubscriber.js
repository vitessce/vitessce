import React, { useMemo } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useFeatureSelection, useObsSetsData,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { VALUE_TRANSFORM_OPTIONS, capitalize, getValueTransformFunction } from '@vitessce/utils';
import { treeToObjectsBySetNames, treeToSetSizesBySetNames, mergeObsSets } from '@vitessce/sets-utils';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions.js';
import CellSetExpressionPlot from './CellSetExpressionPlot.js';
import { useStyles } from './styles.js';

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
function useExpressionByCellSet(
  expressionData, obsIndex, cellSets, additionalCellSets,
  geneSelection, cellSetSelection, cellSetColor,
  featureValueTransform, featureValueTransformCoefficient,
  theme,
) {
  const mergedCellSets = useMemo(
    () => mergeObsSets(cellSets, additionalCellSets),
    [cellSets, additionalCellSets],
  );

  // From the expression matrix and the list of selected genes / cell sets,
  // generate the array of data points for the plot.
  const [expressionArr, expressionMax] = useMemo(() => {
    if (mergedCellSets && cellSetSelection
        && geneSelection && geneSelection.length >= 1
        && expressionData
    ) {
      const cellObjects = treeToObjectsBySetNames(
        mergedCellSets, cellSetSelection, cellSetColor, theme,
      );

      const firstGeneSelected = geneSelection[0];
      // Create new cellColors map based on the selected gene.
      let exprMax = -Infinity;
      const cellIndices = {};
      for (let i = 0; i < obsIndex.length; i += 1) {
        cellIndices[obsIndex[i]] = i;
      }
      const exprValues = cellObjects.map((cell) => {
        const cellIndex = cellIndices[cell.obsId];
        const value = expressionData[0][cellIndex];
        const transformFunction = getValueTransformFunction(
          featureValueTransform, featureValueTransformCoefficient,
        );
        const transformedValue = transformFunction(value);
        exprMax = Math.max(transformedValue, exprMax);
        return { value: transformedValue, gene: firstGeneSelected, set: cell.name };
      });
      return [exprValues, exprMax];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection, theme,
    mergedCellSets, cellSetSelection, cellSetColor,
    featureValueTransform, featureValueTransformCoefficient,
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
    featureValueTransform,
    featureValueTransformCoefficient,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
  }, {
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
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
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [{ obsIndex }, matrixIndicesStatus, matrixIndicesUrls] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets: cellSets }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, true, {}, {},
    { obsType },
  );
  const isReady = useReady([
    featureSelectionStatus,
    matrixIndicesStatus,
    obsSetsStatus,
    featureLabelsStatus,
  ]);
  const urls = useUrls([
    featureLabelsUrls,
    matrixIndicesUrls,
    obsSetsUrls,
  ]);

  const [expressionArr, setArr, expressionMax] = useExpressionByCellSet(
    expressionData, obsIndex, cellSets, additionalCellSets,
    geneSelection, cellSetSelection, cellSetColor,
    featureValueTransform, featureValueTransformCoefficient,
    theme,
  );

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? (featureLabelsMap?.get(geneSelection[0]) || geneSelection[0])
    : null;
  const selectedTransformName = transformOptions.find(
    o => o.value === featureValueTransform,
  )?.name;


  return (
    <TitleInfo
      title={`Expression by ${capitalize(obsType)} Set${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
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
        />
      )}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {expressionArr ? (
          <CellSetExpressionPlot
            domainMax={expressionMax}
            colors={setArr}
            data={expressionArr}
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
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
