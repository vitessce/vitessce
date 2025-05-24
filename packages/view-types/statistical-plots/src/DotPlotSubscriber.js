import React from 'react';
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
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { VALUE_TRANSFORM_OPTIONS } from '@vitessce/utils';
import CellSetExpressionPlotOptions from './CellSetExpressionPlotOptions.js';
import DotPlot from './DotPlot.js';
import { useStyles } from './styles.js';
import { useExpressionSummaries } from './dot-plot-hook.js';


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
    helpText = ViewHelpMapping.DOT_PLOT,
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
      helpText={helpText}
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
            sampleType={sampleType}
            featureType={featureType}
            featureValueType={featureValueType}
            featureValueTransformName={selectedTransformName}
            featureValueColormap={featureValueColormap}
            obsSetSelection={cellSetSelection}
            obsSetColor={cellSetColor}
          />
        ) : (
          <span>Select at least one {featureType}.</span>
        )}
      </div>
    </TitleInfo>
  );
}
