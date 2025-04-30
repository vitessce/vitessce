/* eslint-disable no-unused-vars */
import React from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useReady,
  useFeatureStatsData,
  useMatchingLoader,
  useColumnNameMapping,
} from '@vitessce/vit-s';
import {
  ViewType,
  COMPONENT_COORDINATION_TYPES,
  ViewHelpMapping,
  DataType,
} from '@vitessce/constants-internal';
import FeatureStatsTable from './FeatureStatsTable.js';
import { useRawSetPaths } from './utils.js';

export function FeatureStatsTableSubscriber(props) {
  const {
    title = 'Differential Expression Results',
    coordinationScopes,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.FEATURE_STATS_TABLE,
  } = props;

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
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setGatingFeatureSelectionX,
    setGatingFeatureSelectionY,
    setFeatureSelection,
    setSampleSetSelection,
    setSampleSetColor,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_STATS_TABLE],
    coordinationScopes,
  );

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

  const [{ featureStats }, featureStatsStatus] = useFeatureStatsData(
    loaders, dataset, false,
    { obsType, featureType, sampleType },
    // These volcanoOptions are passed to FeatureStatsAnndataLoader.loadMulti():
    { sampleSetSelection: rawSampleSetSelection, obsSetSelection: rawObsSetSelection },
  );

  const isReady = useReady([
    featureStatsStatus,
  ]);

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      withPadding={false}
    >
      {featureStats ? (
        <FeatureStatsTable
          theme={theme}
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
          data={featureStats}
          featureSelection={featureSelection}
          setFeatureSelection={setFeatureSelection}
          featurePointSignificanceThreshold={featurePointSignificanceThreshold}
          featurePointFoldChangeThreshold={featurePointFoldChangeThreshold}
        />
      ) : (
        <p style={{ padding: '12px' }}>Select at least one {obsType} set.</p>
      )}
    </TitleInfo>
  );
}
