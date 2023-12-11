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
import { VALUE_TRANSFORM_OPTIONS, getValueTransformFunction } from '@vitessce/utils';
import FeatureBarPlot from './FeatureBarPlot.js';
import { useStyles } from './styles.js';


export function FeatureBarPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    yMin = 0,
    yUnits = null,
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
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_BAR_PLOT],
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
  const [
    { obsIndex }, matrixIndicesStatus, matrixIndicesUrls,
  ] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const isReady = useReady([
    featureSelectionStatus,
    matrixIndicesStatus,
    featureLabelsStatus,
  ]);
  const urls = useUrls([
    featureLabelsUrls,
    matrixIndicesUrls,
  ]);
  
  const firstGeneSelected = geneSelection && geneSelection.length >= 1
    ? (featureLabelsMap?.get(geneSelection[0]) || geneSelection[0])
    : null;

  const [expressionArr, expressionMax] = useMemo(() => {
    if (firstGeneSelected && expressionData && obsIndex) {
      let exprMax = -Infinity;
      const cellIndices = {};
      for (let i = 0; i < obsIndex.length; i += 1) {
        cellIndices[obsIndex[i]] = i;
      }
      const exprValues = obsIndex.map((obsId, cellIndex) => {
        const value = expressionData[0][cellIndex];
        const normValue = value * 100 / 255;
        const transformFunction = getValueTransformFunction(
          featureValueTransform, featureValueTransformCoefficient,
        );
        const transformedValue = transformFunction(normValue);
        exprMax = Math.max(transformedValue, exprMax);
        return { value: transformedValue, feature: firstGeneSelected, obsId };
      });
      return [exprValues, exprMax];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection, theme,
    featureValueTransform, featureValueTransformCoefficient,
  ]);

  
  const selectedTransformName = transformOptions.find(
    o => o.value === featureValueTransform,
  )?.name;


  return (
    <TitleInfo
      title={`Feature Values${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {expressionArr ? (
          <FeatureBarPlot
            yMin={yMin}
            yMax={expressionMax}
            yUnits={yUnits}
            data={expressionArr}
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            featureType={featureType}
            featureValueType={featureValueType}
            featureValueTransformName={selectedTransformName}
            featureName={firstGeneSelected}
          />
        ) : (
          <span>Select a {featureType}.</span>
        )}
      </div>
    </TitleInfo>
  );
}
