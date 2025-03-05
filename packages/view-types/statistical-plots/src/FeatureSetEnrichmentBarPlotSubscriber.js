/* eslint-disable no-unused-vars */
import React, { useMemo, useCallback } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useReady,
  useGridItemSize,
  useFeatureSetStatsData,
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
import FeatureSetEnrichmentBarPlot from './FeatureSetEnrichmentBarPlot.js';
import { useStyles } from './styles.js';
import { useRawSetPaths } from './utils.js';


export function FeatureSetEnrichmentBarPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.FEATURE_SET_ENRICHMENT_BAR_PLOT,
  } = props;

  const classes = useStyles();
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
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_SET_ENRICHMENT_BAR_PLOT],
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

  const [{ featureSetStats }, featureSetStatsStatus] = useFeatureSetStatsData(
    loaders, dataset, false,
    { obsType, featureType, sampleType },
    // These volcanoOptions are passed to ObsSetStatsAnndataLoader.loadMulti():
    { sampleSetSelection: rawSampleSetSelection, obsSetSelection: rawObsSetSelection },
  );

  const isReady = useReady([
    featureSetStatsStatus,
  ]);

  // Support a click handler which selects individual cell set bars.
  const onBarSelect = useCallback((featureSetName, featureSetTerm, isShiftDown = false) => {
    // TODO: Implement different behavior when isShiftDown
    // TODO: get feature IDs using AsyncFunction
    // (pathway term in, gene names out).
    
    //setFeatureSelection(featureIds);
  }, [setFeatureSelection]);

  // TODO: support the following options
  // - p-value threshold for which bars to show

  return (
    <TitleInfo
      title={`${capitalize(featureType)} Set Enrichment Plot`}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {featureSetStats ? (
          <FeatureSetEnrichmentBarPlot
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            featureType={featureType}
            obsSetsColumnNameMapping={obsSetsColumnNameMapping}
            obsSetsColumnNameMappingReversed={obsSetsColumnNameMappingReversed}
            sampleSetsColumnNameMapping={sampleSetsColumnNameMapping}
            sampleSetsColumnNameMappingReversed={sampleSetsColumnNameMappingReversed}
            sampleSetSelection={sampleSetSelection}
            obsSetSelection={obsSetSelection}
            obsSetColor={obsSetColor}
            sampleSetColor={sampleSetColor}
            data={featureSetStats}
            onBarSelect={onBarSelect}
            pValueThreshold={0.01}
          />
        ) : (
          <span>Select at least one {obsType} set.</span>
        )}
      </div>
    </TitleInfo>
  );
}
