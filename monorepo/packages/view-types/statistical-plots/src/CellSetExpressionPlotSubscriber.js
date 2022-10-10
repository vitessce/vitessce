import React from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useFeatureSelection, useObsSetsData, useObsFeatureMatrixIndices
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { useExpressionByCellSet } from '@vitessce/sets';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions';
import CellSetExpressionPlot from './CellSetExpressionPlot';
import { VALUE_TRANSFORM_OPTIONS, capitalize } from '@vitessce/utils';
import { useStyles } from './styles';

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

  const classes = useStyles();

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  const transformOptions = VALUE_TRANSFORM_OPTIONS;

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
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
  ]);

  const [expressionArr, setArr, expressionMax] = useExpressionByCellSet(
    expressionData, obsIndex, cellSets, additionalCellSets,
    geneSelection, cellSetSelection, cellSetColor,
    featureValueTransform, featureValueTransformCoefficient,
    theme,
  );

  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? geneSelection[0]
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
