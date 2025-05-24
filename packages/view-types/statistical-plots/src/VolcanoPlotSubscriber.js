/* eslint-disable no-unused-vars */
import React, { useMemo, useCallback } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useReady,
  useGridItemSize,
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
import VolcanoPlot from './VolcanoPlot.js';
import { useStyles } from './styles.js';
import VolcanoPlotOptions from './VolcanoPlotOptions.js';
import { useRawSetPaths } from './utils.js';

export function VolcanoPlotSubscriber(props) {
  const {
    title = 'Volcano Plot',
    coordinationScopes,
    removeGridComponent,
    theme,
    helpText = ViewHelpMapping.VOLCANO_PLOT,
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
    COMPONENT_COORDINATION_TYPES[ViewType.VOLCANO_PLOT],
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

  const [{ featureStats }, featureStatsStatus] = useFeatureStatsData(
    loaders, dataset, false,
    { obsType, featureType, sampleType },
    // These volcanoOptions are passed to FeatureStatsAnndataLoader.loadMulti():
    { sampleSetSelection: rawSampleSetSelection, obsSetSelection: rawObsSetSelection },
  );

  const isReady = useReady([
    featureStatsStatus,
  ]);

  const onFeatureClick = useCallback((featureId) => {
    setFeatureSelection([featureId]);
  }, [setFeatureSelection]);

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      options={(
        <VolcanoPlotOptions
          obsType={obsType}
          featureType={featureType}

          featurePointSignificanceThreshold={featurePointSignificanceThreshold}
          featurePointFoldChangeThreshold={featurePointFoldChangeThreshold}
          featureLabelSignificanceThreshold={featureLabelSignificanceThreshold}
          featureLabelFoldChangeThreshold={featureLabelFoldChangeThreshold}

          setFeaturePointSignificanceThreshold={setFeaturePointSignificanceThreshold}
          setFeaturePointFoldChangeThreshold={setFeaturePointFoldChangeThreshold}
          setFeatureLabelSignificanceThreshold={setFeatureLabelSignificanceThreshold}
          setFeatureLabelFoldChangeThreshold={setFeatureLabelFoldChangeThreshold}
        />
      )}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {featureStats ? (
          <VolcanoPlot
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
            data={featureStats}
            onFeatureClick={onFeatureClick}

            featurePointSignificanceThreshold={featurePointSignificanceThreshold}
            featurePointFoldChangeThreshold={featurePointFoldChangeThreshold}
            featureLabelSignificanceThreshold={featureLabelSignificanceThreshold}
            featureLabelFoldChangeThreshold={featureLabelFoldChangeThreshold}
          />
        ) : (
          <span>Select at least one {obsType} set.</span>
        )}
      </div>
    </TitleInfo>
  );
}
