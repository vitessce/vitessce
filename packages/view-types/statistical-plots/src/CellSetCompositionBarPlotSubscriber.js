/* eslint-disable no-unused-vars */
import React, { useMemo, useCallback } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useReady,
  useGridItemSize,
  useObsSetStatsData,
  useMatchingLoader,
  useColumnNameMapping,
} from '@vitessce/vit-s';
import {
  ViewType,
  COMPONENT_COORDINATION_TYPES,
  ViewHelpMapping,
  DataType,
} from '@vitessce/constants-internal';
import { capitalize } from '@vitessce/utils';
import CellSetCompositionBarPlot from './CellSetCompositionBarPlot.js';
import { useStyles } from './styles.js';
import { useRawSetPaths } from './utils.js';


export function CellSetCompositionBarPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.OBS_SET_COMPOSITION_BAR_PLOT,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    sampleType,
    featureType,
    featureValueType,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    obsSetSelection,
    obsSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    featurePointSignificanceThreshold,
    featurePointFoldChangeThreshold,
    featureLabelSignificanceThreshold,
    featureLabelFoldChangeThreshold,
    featureValueTransform,
    featureValueTransformCoefficient,
    gatingFeatureSelectionX,
    gatingFeatureSelectionY,
    featureSelection,
    sampleSetSelection,
    sampleSetColor,
  }, {
    setObsFilter: setCellFilter,
    setObsSetSelection,
    setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    setFeaturePointSignificanceThreshold,
    setFeaturePointFoldChangeThreshold,
    setFeatureLabelSignificanceThreshold,
    setFeatureLabelFoldChangeThreshold,
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setGatingFeatureSelectionX,
    setGatingFeatureSelectionY,
    setFeatureSelection,
    setSampleSetSelection,
    setSampleSetColor,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_SET_COMPOSITION_BAR_PLOT],
    coordinationScopes,
  );
  const [width, height, containerRef] = useGridItemSize();

  const obsSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.OBS_SETS, { obsType },
  );
  const sampleSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.SAMPLE_SETS, { sampleType },
  );
  const obsSetsColumnNameMapping = useColumnNameMapping(obsSetsLoader);
  const obsSetsColumnNameMappingReversed = useColumnNameMapping(obsSetsLoader, true);
  const sampleSetsColumnNameMapping = useColumnNameMapping(sampleSetsLoader);
  const sampleSetsColumnNameMappingReversed = useColumnNameMapping(sampleSetsLoader, true);

  const rawSampleSetSelection = useRawSetPaths(sampleSetsColumnNameMapping, sampleSetSelection);
  const rawObsSetSelection = useRawSetPaths(obsSetsColumnNameMapping, obsSetSelection);

  const [{ obsSetStats }, obsSetStatsStatus] = useObsSetStatsData(
    loaders, dataset, false,
    { obsType, sampleType },
    // These volcanoOptions are passed to ObsSetStatsAnndataLoader.loadMulti():
    { sampleSetSelection: rawSampleSetSelection, obsSetSelection: rawObsSetSelection },
  );

  const isReady = useReady([
    obsSetStatsStatus,
  ]);

  // Support a click handler which selects individual cell set bars.
  const onBarSelect = useCallback((setNamePath, isShiftDown = false) => {
    // TODO: Implement different behavior when isShiftDown
    setObsSetSelection([setNamePath]);
  }, [setObsSetSelection]);

  // TODO: support the following options
  // - Use logFoldChange vs. intercept+effect for the bar y-value.
  // - Boolean flag to allow hiding non-significant bars.

  return (
    <TitleInfo
      title={`${capitalize(obsType)} Set Composition Analysis Plot`}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {obsSetStats ? (
          <CellSetCompositionBarPlot
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            obsSetsColumnNameMapping={obsSetsColumnNameMapping}
            obsSetsColumnNameMappingReversed={obsSetsColumnNameMappingReversed}
            sampleSetsColumnNameMapping={sampleSetsColumnNameMapping}
            sampleSetsColumnNameMappingReversed={sampleSetsColumnNameMappingReversed}
            sampleSetSelection={sampleSetSelection}
            obsSetSelection={obsSetSelection}
            obsSetColor={obsSetColor}
            sampleSetColor={sampleSetColor}
            data={obsSetStats}
            onBarSelect={onBarSelect}
          />
        ) : (
          <span>Select at least one {obsType} set and a pair of {sampleType} sets.</span>
        )}
      </div>
    </TitleInfo>
  );
}
