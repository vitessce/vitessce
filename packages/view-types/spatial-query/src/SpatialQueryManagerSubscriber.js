import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  TitleInfo,
  useDeckCanvasSize,
  useReady,
  useUrls,
  useMultiObsSpots,
  useMultiObsPoints,
  useSpotMultiObsSets,
  useMultiObsSegmentations,
  useMultiImages,
  usePointMultiObsLabels,
  useSpotMultiFeatureSelection,
  useSpotMultiObsFeatureMatrixIndices,
  useSegmentationMultiFeatureSelection,
  useSegmentationMultiObsFeatureMatrixIndices,
  useSegmentationMultiObsLocations,
  useSegmentationMultiObsSets,
  useInitialCoordination,
  useCoordination,
  useLoaders,
  useMergeCoordination,
  useSetComponentHover,
  useSetComponentViewInfo,
  useComplexCoordination,
  useMultiCoordinationScopesNonNull,
  useMultiCoordinationScopesSecondaryNonNull,
  useComplexCoordinationSecondary,
  useCoordinationScopes,
  useCoordinationScopesBy,
  useSpotMultiFeatureLabels,
  useGridItemSize,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping, CoordinationType } from '@vitessce/constants-internal';
import Flatbush from 'flatbush';
import { FPGrowth, Itemset } from 'node-fpgrowth';


export function SpatialQueryManagerSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Spatial Query Manager',
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);
  const mergeCoordination = useMergeCoordination();

  // Acccount for possible meta-coordination.
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    spatialZoom: zoom,
    spatialTargetX: targetX,
    spatialTargetY: targetY,
    spatialTargetZ: targetZ,
    spatialTargetT: targetT,
    spatialRenderingMode,
    spatialRotationX: rotationX,
    spatialRotationY: rotationY,
    spatialRotationZ: rotationZ,
    spatialRotationOrbit: rotationOrbit,
    spatialOrbitAxis: orbitAxis,
    spatialAxisFixed,

    // TODO: get obsSets per-layer or per-channel
    additionalObsSets,
    obsSetColor,
    obsColorEncoding,
    obsSetSelection,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationY: setRotationY,
    setSpatialRotationZ: setRotationZ,
    setSpatialRotationOrbit: setRotationOrbit,

    // TODO: get obsSets per-layer or per-channel
    setAdditionalObsSets,
    setObsSetColor,
    setObsColorEncoding,
    setObsSetSelection,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_QUERY_MANAGER], coordinationScopes);

  const {
    spatialZoom: initialZoom,
    spatialTargetX: initialTargetX,
    spatialTargetY: initialTargetY,
    spatialTargetZ: initialTargetZ,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_QUERY_MANAGER], coordinationScopes,
  );

  const [segmentationLayerScopes, segmentationChannelScopesByLayer] = useMultiCoordinationScopesSecondaryNonNull(
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SEGMENTATION_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  const spotLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.SPOT_LAYER,
    coordinationScopes,
  );

  const pointLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.POINT_LAYER,
    coordinationScopes,
  );

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
      CoordinationType.SEGMENTATION_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
  );

  // Object keys are coordination scope names for spatialSegmentationChannel.
  const segmentationChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_OPACITY,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
      CoordinationType.SPATIAL_SEGMENTATION_FILLED,
      CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );

  // Spot layer
  const spotLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_SPOT_RADIUS,
      CoordinationType.SPATIAL_SPOT_FILLED,
      CoordinationType.SPATIAL_SPOT_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );

  // Point layer
  const pointLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.POINT_LAYER,
  );

  // Points data
  const [obsPointsData, obsPointsDataStatus, obsPointsUrls] = useMultiObsPoints(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [pointMultiObsLabelsData, pointMultiObsLabelsDataStatus] = usePointMultiObsLabels(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Spots data
  const [obsSpotsData, obsSpotsDataStatus, obsSpotsUrls] = useMultiObsSpots(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [obsSpotsSetsData, obsSpotsSetsDataStatus] = useSpotMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSpotsFeatureLabelsData, obsSpotsFeatureLabelsDataStatus] = useSpotMultiFeatureLabels(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  console.log(obsSpotsData, obsSpotsSetsData);

  const [
    spotMultiExpressionData,
    spotMultiLoadedFeatureSelection,
    spotMultiExpressionExtents,
    spotMultiExpressionNormData,
    spotMultiFeatureSelectionStatus,
  ] = useSpotMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [spotMultiIndicesData, spotMultiIndicesDataStatus] = useSpotMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Segmentations data
  const [obsSegmentationsLocationsData, obsSegmentationsLocationsDataStatus] = useSegmentationMultiObsLocations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSegmentationsData, obsSegmentationsDataStatus, obsSegmentationsUrls] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [obsSegmentationsSetsData, obsSegmentationsSetsDataStatus] = useSegmentationMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    segmentationMultiExpressionData,
    segmentationMultiLoadedFeatureSelection,
    segmentationMultiExpressionExtents,
    segmentationMultiExpressionNormData,
    segmentationMultiFeatureSelectionStatus,
  ] = useSegmentationMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [segmentationMultiIndicesData, segmentationMultiIndicesDataStatus] = useSegmentationMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const isReady = useReady([
    // Spots
    obsSpotsDataStatus,
    obsSpotsSetsDataStatus,
    spotMultiFeatureSelectionStatus,
    spotMultiIndicesDataStatus,
    // Points
    obsPointsDataStatus,
    pointMultiObsLabelsDataStatus,
    // Segmentations
    obsSegmentationsDataStatus,
    obsSegmentationsSetsDataStatus,
    segmentationMultiFeatureSelectionStatus,
    segmentationMultiIndicesDataStatus,
    obsSegmentationsLocationsDataStatus,
  ]);

  const onFindPatterns = useCallback(() => {

  }, []);

  return (
    <TitleInfo
      title={title}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <p>SpatialQuery</p>
      <button onClick={onFindPatterns}>Find patterns</button>
    </TitleInfo>
  );
}
