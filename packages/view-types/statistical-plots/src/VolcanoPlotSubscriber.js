import React, { useMemo, useCallback } from 'react';
import {
  TitleInfo,
  useCoordination,
  useLoaders,
  useUrls,
  useReady,
  useGridItemSize,
  useFeatureSelection,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useComparisonMetadata,
  useFeatureStatsData,
  useMatchingLoader,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping, DataType } from '@vitessce/constants-internal';
import { setObsSelection } from '@vitessce/sets-utils';
import VolcanoPlot from './VolcanoPlot.js';
import { useStyles } from './styles.js';

/**
 * Using a loader object's options,
 * return a mapping from group name to column name.
 * @param {*} loader obsSets or sampleSets loader class
 * @returns {Record<string, string>} Mapping from group name to column name.
 */
function useColumnNameMapping(loader) {
  return useMemo(() => {
    let result = {};
    if(loader?.options) {
      const optionsArray = loader.options.obsSets ? loader.options.obsSets : loader.options.sampleSets;
      optionsArray.forEach((optionObject) => {
        const { name, path } = optionObject;
        const columnName = path.split("/").at(-1);
        result[name] = columnName;
      });
    }
    return result;
  }, [loader]);
}

/**
 * Transform set paths which use group names to those which use column names.
 * @param {Record<string, string>} columnNameMapping Return value of useColumnNameMapping.
 * @param {string[][]} setPaths Array of set paths, such as obsSetSelection.
 * @returns {string[][]} Transformed set paths.
 */
function useRawSetPaths(columnNameMapping, setPaths) {
  return useMemo(() => {
    return setPaths?.map(setPath => {
      const newSetPath = [...setPath];
      if(newSetPath?.[0] && columnNameMapping[newSetPath[0]]) {
        newSetPath[0] = columnNameMapping[newSetPath[0]];
      }
      return newSetPath;
    });
  }, [columnNameMapping, setPaths]);
}

export function VolcanoPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    yMin = 0,
    yUnits = null,
    helpText = ViewHelpMapping.VOLCANO_PLOT,
  } = props;

  const classes = useStyles();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
   // Get "props" from the coordination space.
   const [{
    dataset,
    obsType,
    sampleType,
    featureType,
    featureValueType,
    volcanoZoom: zoom,
    volcanoTargetX: targetX,
    volcanoTargetY: targetY,
    volcanoTargetZ: targetZ,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    obsSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    volcanoFeatureLabelsVisible: cellSetLabelsVisible, // TODO: rename
    volcanoFeatureLabelSize: cellSetLabelSize, // TODO: rename
    volcanoFeatureRadius: cellRadiusFixed,
    volcanoFeatureRadiusMode: cellRadiusMode,
    volcanoFeatureOpacity: cellOpacityFixed,
    volcanoFeatureOpacityMode: cellOpacityMode,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
    featureValueTransform,
    featureValueTransformCoefficient,
    gatingFeatureSelectionX,
    gatingFeatureSelectionY,
    featureSelection,
    sampleSetSelection,
  }, {
    setVolcanoZoom: setZoom,
    setVolcanoTargetX: setTargetX,
    setVolcanoTargetY: setTargetY,
    setVolcanoTargetZ: setTargetZ,
    setObsFilter: setCellFilter,
    setObsSetSelection,
    setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    setVolcanoFeatureLabelsVisible: setCellSetLabelsVisible,
    setVolcanoFeatureLabelSize: setCellSetLabelSize,
    setVolcanoFeatureRadius: setCellRadiusFixed,
    setVolcanoFeatureRadiusMode: setCellRadiusMode,
    setVolcanoFeatureOpacity: setCellOpacityFixed,
    setVolcanoFeatureOpacityMode: setCellOpacityMode,
    setFeatureValueColormap: setGeneExpressionColormap,
    setFeatureValueColormapRange: setGeneExpressionColormapRange,
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setGatingFeatureSelectionX,
    setGatingFeatureSelectionY,
    setFeatureSelection,
    setSampleSetSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.VOLCANO_PLOT],
    coordinationScopes,
  );
  const [width, height, containerRef] = useGridItemSize();

  console.log(sampleSetSelection, obsSetSelection);

  const obsSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.OBS_SETS, { obsType },
  );

  const sampleSetsLoader = useMatchingLoader(
    loaders,
    dataset,
    DataType.SAMPLE_SETS,
    { sampleType },
  );
  const obsSetsColumnNameMapping = useColumnNameMapping(obsSetsLoader);
  const sampleSetsColumnNameMapping = useColumnNameMapping(sampleSetsLoader);
  
  const rawSampleSetSelection = useRawSetPaths(sampleSetsColumnNameMapping, sampleSetSelection);
  const rawObsSetSelection = useRawSetPaths(obsSetsColumnNameMapping, obsSetSelection);


  const [{ comparisonMetadata }, cmpMetadataStatus, cmpMetadataUrls] = useComparisonMetadata(
    loaders, dataset, false, {}, {}, { obsType, sampleType },
  );
  const [featureStats, featureStatsStatus, featureStatsUrls] = useFeatureStatsData(
    loaders, dataset, false,
    { obsType, featureType, sampleType },
    // These volcanoOptions are passed to FeatureStatsAnndataLoader.loadMulti():
    { sampleSetSelection: rawSampleSetSelection, obsSetSelection: rawObsSetSelection },
  );
  

  console.log(comparisonMetadata, featureStatsStatus, featureStats);

  return (
    <p>Volcano plot2</p>
  );

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

  const onBarSelect = useCallback((obsId) => {
    const obsIdsToSelect = [obsId];
    setObsSelection(
      obsIdsToSelect, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
    );
  }, [additionalCellSets, cellSetColor, setCellColorEncoding,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection]);

  const onBarHighlight = useCallback((obsId) => {
    setCellHighlight(obsId);
  }, []);

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
        exprMax = Math.max(value, exprMax);
        return { obsId, value, feature: firstGeneSelected };
      });
      return [exprValues, exprMax];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection, theme,
    featureValueTransform, featureValueTransformCoefficient,
    firstGeneSelected,
  ]);

  return (
    <TitleInfo
      title={`Feature Values${(firstGeneSelected ? ` (${firstGeneSelected})` : '')}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {expressionArr ? (
          <VolcanoPlot
            yMin={yMin}
            yMax={expressionMax}
            yUnits={yUnits}
            data={expressionArr}
            theme={theme}
            width={width}
            height={height}
            obsType={obsType}
            cellHighlight={cellHighlight}
            cellSetSelection={cellSetSelection}
            additionalCellSets={additionalCellSets}
            cellSetColor={cellSetColor}
            featureType={featureType}
            featureValueType={featureValueType}
            featureName={firstGeneSelected}
            onBarSelect={onBarSelect}
            onBarHighlight={onBarHighlight}
          />
        ) : (
          <span>Select a {featureType}.</span>
        )}
      </div>
    </TitleInfo>
  );
}
