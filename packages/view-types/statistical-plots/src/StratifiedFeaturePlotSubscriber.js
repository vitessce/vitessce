import React, { useMemo } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsFeatureMatrixData,
  useFeatureSelection,
  registerPluginViewType,
  useMultiCoordinationScopes,
  useMultiCoordinationValues,
} from '@vitessce/vit-s';
import { ViewType, CoordinationType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { capitalize } from '@vitessce/utils';
import StratifiedFeaturePlot2 from './StratifiedFeaturePlot2';
import { useStyles } from './styles';


export function StratifiedFeaturePlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title: titleOverride,
    filterBy,
    groupBy,
  } = props;

  const classes = useStyles();

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    featureSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_VALUE_HISTOGRAM],
    coordinationScopes,
  );

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  // Get data from loaders using the data hooks.
  const [{ obsIndex, featureIndex, obsFeatureMatrix }, matrixStatus] = useObsFeatureMatrixData(
    loaders, dataset, addUrl, true, {}, {},
    { obsType, featureType, featureValueType },
  );
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, featureSelection,
    { obsType, featureType, featureValueType },
  );
  // eslint-disable-next-line no-unused-vars
  const [groupBySelection, filterBySelection] = useMemo(() => (
    [[groupBy], [filterBy]]
  ), [groupBy, filterBy]);
  const [
    stratificationData, loadedStratificationSelection, stratificationSelectionStatus,
  ] = useFeatureSelection(
    loaders, dataset, false, groupBySelection,
    { obsType, featureType, featureValueType },
  );
  const [
    filterData, loadedFilterSelection, filterSelectionStatus,
  ] = useFeatureSelection(
    loaders, dataset, false, filterBySelection,
    { obsType, featureType, featureValueType },
  );

  const isReady = useReady([
    matrixStatus,
    featureSelectionStatus,
  ]);

  const firstFeatureSelected = loadedFeatureSelection && loadedFeatureSelection.length >= 1
    ? loadedFeatureSelection[0]
    : null;
  const firstStratificationSelected = loadedStratificationSelection
    && loadedStratificationSelection.length >= 1
    ? loadedStratificationSelection[0]
    : null;
  const firstFilterSelected = loadedFilterSelection
    && loadedFilterSelection.length >= 1
    ? loadedFilterSelection[0]
    : null;

  // From the expression matrix and the list of selected genes,
  // generate the array of data points for the histogram.
  const data = useMemo(() => {
    if (firstFeatureSelected && firstStratificationSelected && firstFilterSelected && obsFeatureMatrix && expressionData && stratificationData && filterData) {
      // Create new cellColors map based on the selected gene.
      return Array.from(expressionData[0]).flatMap((_, index) => {
        const value = expressionData[0][index];
        // PTC in Cortex
        const inCortex = filterData[0][index];
        // PTC in IFTA
        const groupVal = stratificationData[0][index] ? "in IFTA" : "in non-IFTA cortex";
        return inCortex ? [
          { value, group: "in total cortex", feature: firstFeatureSelected },
          { value, group: groupVal, feature: firstFeatureSelected },
        ] : [];
      });
    }
    return null;
  }, [obsIndex, featureIndex, obsFeatureMatrix, firstFeatureSelected, firstStratificationSelected, firstFilterSelected, expressionData, stratificationData, filterData]);

  return (
    <TitleInfo
      title={`${capitalize(obsType)} Distributions${(firstFeatureSelected ? ` (${firstFeatureSelected})` : '')}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {data ? (
          <StratifiedFeaturePlot2
            data={data}
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            featureName={firstFeatureSelected}
          />
        ) : (<p>Select a feature.</p>)}
      </div>
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    ViewType.STRATIFIED_FEATURE_VALUE_DISTRIBUTION,
    StratifiedFeaturePlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_SIZES],
  );
}
