/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
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
import { COMPONENT_COORDINATION_TYPES, ViewType, CoordinationType } from '@vitessce/constants-internal';
import { commaNumber, pluralize } from '@vitessce/utils';
import { setObsSelection } from '@vitessce/sets-utils';
import { MultiLegend, ChannelNamesLegend } from '@vitessce/legend';
import { SmallMultiples } from './SmallMultiples.js';


// Reference: https://deck.gl/docs/api-reference/core/orbit-view#view-state
const DEFAULT_VIEW_STATE = {
  zoom: 0,
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
};
const SET_VIEW_STATE_NOOP = () => {};



/**
 * A subscriber component for the spatial plot.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function SmallMultiplesSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Small Multiples',
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
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SMALL_MULTIPLES], coordinationScopes);

  const isReady = true;
  
  return (
    <TitleInfo
      title={title}
      isSpatial
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <SmallMultiples
      
      />
    </TitleInfo>
  );
}
