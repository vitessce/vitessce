import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent, quantileSorted } from 'd3-array';
import { isEqual } from 'lodash-es';
import {
  TitleInfo,
  useReady, useUrls,
  useDeckCanvasSize,
  useUint8FeatureSelection,
  useExpressionValueGetter,
  useGetObsInfo,
  useObsEmbeddingData,
  useObsSetsData,
  useFeatureSelection,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useMultiObsLabels,
  useSampleSetsData,
  useSampleEdgesData,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useInitialCoordination,
  useExpandedFeatureLabelsMap,
} from '@vitessce/vit-s';
import {
  setObsSelection, mergeObsSets, getCellSetPolygons, getCellColors,
  stratifyArrays,
} from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber } from '@vitessce/utils';
import {
  Scatterplot, ScatterplotTooltipSubscriber, ScatterplotOptions,
  getPointSizeDevicePixels,
  getPointOpacity,
} from '@vitessce/scatterplot';
import { Legend } from '@vitessce/legend';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { DEFAULT_CONTOUR_PERCENTILES } from './constants.js';
import { SharedEmbeddingScatterplotSubscriber } from './SharedEmbeddingScatterplotSubscriber.js';


/**
 * A subscriber component for the scatterplot.
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title An override value for the component title.
 * @param {number} props.averageFillDensity Override the average fill density calculation
 * when using dynamic opacity mode.
 */
export function EmbeddingScatterplotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    observationsLabelOverride,
    title: titleOverride,
    helpText = ViewHelpMapping.SCATTERPLOT,
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    sampleType,
    embeddingZoom,
    embeddingTargetX,
    embeddingTargetY,
    embeddingTargetZ,
    embeddingType,
    obsFilter,
    obsHighlight,
    featureSelection,
    obsSetSelection,
    obsSetColor,
    obsColorEncoding,
    additionalObsSets,
    embeddingObsSetPolygonsVisible,
    embeddingObsSetLabelsVisible,
    embeddingObsSetLabelSize,
    embeddingObsRadius,
    embeddingObsRadiusMode,
    embeddingObsOpacity,
    embeddingObsOpacityMode,
    featureValueColormap,
    featureValueColormapRange,
    tooltipsVisible,
    sampleSetSelection,
    sampleSetColor,
    embeddingPointsVisible,
    embeddingContoursVisible,
    embeddingContoursFilled,
    embeddingContourPercentiles,
    contourColorEncoding,
    contourColor,
  }, {
    setEmbeddingZoom,
    setEmbeddingTargetX,
    setEmbeddingTargetY,
    setEmbeddingTargetZ,
    setObsFilter,
    setObsSetSelection,
    setObsHighlight,
    setObsSetColor,
    setObsColorEncoding,
    setAdditionalObsSets,
    setEmbeddingObsSetPolygonsVisible,
    setEmbeddingObsSetLabelsVisible,
    setEmbeddingObsSetLabelSize,
    setEmbeddingObsRadius,
    setEmbeddingObsRadiusMode,
    setEmbeddingObsOpacity,
    setEmbeddingObsOpacityMode,
    setFeatureValueColormap,
    setFeatureValueColormapRange,
    setTooltipsVisible,
    setEmbeddingPointsVisible,
    setEmbeddingContoursVisible,
    setEmbeddingContoursFilled,
    setEmbeddingContourPercentiles,
    setContourColorEncoding,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT], coordinationScopes);

  return (
    <SharedEmbeddingScatterplotSubscriber
      // Getters
      dataset={dataset}
      obsType={obsType}
      featureType={featureType}
      featureValueType={featureValueType}
      sampleType={sampleType}
      embeddingZoom={embeddingZoom}
      embeddingTargetX={embeddingTargetX}
      embeddingTargetY={embeddingTargetY}
      embeddingTargetZ={embeddingTargetZ}
      embeddingType={embeddingType}
      obsFilter={obsFilter}
      obsHighlight={obsHighlight}
      featureSelection={featureSelection}
      obsSetSelection={obsSetSelection}
      obsSetColor={obsSetColor}
      obsColorEncoding={obsColorEncoding}
      additionalObsSets={additionalObsSets}
      embeddingObsSetPolygonsVisible={embeddingObsSetPolygonsVisible}
      embeddingObsSetLabelsVisible={embeddingObsSetLabelsVisible}
      embeddingObsSetLabelSize={embeddingObsSetLabelSize}
      embeddingObsRadius={embeddingObsRadius}
      embeddingObsRadiusMode={embeddingObsRadiusMode}
      embeddingObsOpacity={embeddingObsOpacity}
      embeddingObsOpacityMode={embeddingObsOpacityMode}
      featureValueColormap={featureValueColormap}
      featureValueColormapRange={featureValueColormapRange}
      tooltipsVisible={tooltipsVisible}
      sampleSetSelection={sampleSetSelection}
      sampleSetColor={sampleSetColor}
      embeddingPointsVisible={embeddingPointsVisible}
      embeddingContoursVisible={embeddingContoursVisible}
      embeddingContoursFilled={embeddingContoursFilled}
      embeddingContourPercentiles={embeddingContourPercentiles}
      contourColorEncoding={contourColorEncoding}
      contourColor={contourColor}
      // Setters
      setEmbeddingZoom={setEmbeddingZoom}
      setEmbeddingTargetX={setEmbeddingTargetX}
      setEmbeddingTargetY={setEmbeddingTargetY}
      setEmbeddingTargetZ={setEmbeddingTargetZ}
      setObsFilter={setObsFilter}
      setObsSetSelection={setObsSetSelection}
      setObsHighlight={setObsHighlight}
      setObsSetColor={setObsSetColor}
      setObsColorEncoding={setObsColorEncoding}
      setAdditionalObsSets={setAdditionalObsSets}
      setEmbeddingObsSetPolygonsVisible={setEmbeddingObsSetPolygonsVisible}
      setEmbeddingObsSetLabelsVisible={setEmbeddingObsSetLabelsVisible}
      setEmbeddingObsSetLabelSize={setEmbeddingObsSetLabelSize}
      setEmbeddingObsRadius={setEmbeddingObsRadius}
      setEmbeddingObsRadiusMode={setEmbeddingObsRadiusMode}
      setEmbeddingObsOpacity={setEmbeddingObsOpacity}
      setEmbeddingObsOpacityMode={setEmbeddingObsOpacityMode}
      setFeatureValueColormap={setFeatureValueColormap}
      setFeatureValueColormapRange={setFeatureValueColormapRange}
      setTooltipsVisible={setTooltipsVisible}
      setEmbeddingPointsVisible={setEmbeddingPointsVisible}
      setEmbeddingContoursVisible={setEmbeddingContoursVisible}
      setEmbeddingContoursFilled={setEmbeddingContoursFilled}
      setEmbeddingContourPercentiles={setEmbeddingContourPercentiles}
      setContourColorEncoding={setContourColorEncoding}
      {...props}
    />
  );
}
