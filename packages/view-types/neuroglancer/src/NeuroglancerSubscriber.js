/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect, useState, useReducer } from 'react';
import {
  TitleInfo,
  useReady,
  useInitialCoordination,
  useCoordination,
  useCoordinationScopes,
  useCoordinationScopesBy,
  useComplexCoordination,
  useMultiCoordinationScopesNonNull,
  useMultiCoordinationScopesSecondaryNonNull,
  useComplexCoordinationSecondary,
  useLoaders,
  useMergeCoordination,
  useMultiObsPoints,
  usePointMultiObsFeatureMatrixIndices,
  useMultiObsSegmentations,
  useSegmentationMultiFeatureSelection,
  useSegmentationMultiObsFeatureMatrixIndices,
  useSegmentationMultiObsSets,
  useGridItemSize,
} from '@vitessce/vit-s';
import {
  ViewHelpMapping,
  ViewType,
  CoordinationType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { MultiLegend } from '@vitessce/legend';
import { NeuroglancerComp } from './Neuroglancer.js';
import { useNeuroglancerViewerState } from './data-hook-ng-utils.js';
import {
  useMemoCustomComparison,
  customIsEqualForCellColors,
} from './use-memo-custom-comparison.js';
import { useStyles } from './styles.js';
import {
  quaternionToEuler,
  eulerToQuaternion,
  valueGreaterThanEpsilon,
  nearEq,
  makeVitNgZoomCalibrator,
  conjQuat,
  multiplyQuat,
  rad2deg,
  deg2rad,
  Q_Y_UP,
} from './utils.js';

const VITESSCE_INTERACTION_DELAY = 50;
const INIT_VIT_ZOOM = -3.6;
const ZOOM_EPS = 1e-2;
const ROTATION_EPS = 1e-3;
const TARGET_EPS = 0.5;
const NG_ROT_COOLDOWN_MS = 120;

const GUIDE_URL = 'https://vitessce.io/docs/ng-guide/';

const LAST_INTERACTION_SOURCE = {
  vitessce: 'vitessce',
  neuroglancer: 'neuroglancer',
};

function rgbToHex(rgb) {
  return (typeof rgb === 'string'
    ? rgb
    : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`);
}

export function NeuroglancerSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Spatial',
    subtitle = 'Powered by Neuroglancer',
    helpText = ViewHelpMapping.NEUROGLANCER,
    // Note: this is a temporary mechanism
    // to pass an initial NG camera state.
    // Ideally, all camera state should be passed via
    // the existing spatialZoom, spatialTargetX, spatialRotationOrbit, etc,
    // and then NeuroglancerSubscriber should internally convert
    // to NG-compatible values, which would eliminate the need for this.
    initialNgCameraState,
  } = props;

  const loaders = useLoaders();
  const mergeCoordination = useMergeCoordination();

  // Acccount for possible meta-coordination.
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

  const [{
    dataset,
    obsType,
    spatialZoom,
    spatialTargetX,
    spatialTargetY,
    spatialRotationX,
    spatialRotationY,
    spatialRotationZ,
    spatialRotationOrbit,
    // spatialOrbitAxis, // always along Y-axis - not used in conversion
    embeddingType: mapping,
    obsSetColor: cellSetColor,
    obsSetSelection: cellSetSelection,
    additionalObsSets: additionalCellSets,
  }, {
    setAdditionalObsSets: setAdditionalCellSets,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialRotationX: setRotationX,
    // setSpatialRotationY: setRotationY,
    // setSpatialRotationZ: setRotationZ,
    setSpatialRotationOrbit: setRotationOrbit,
    setSpatialZoom: setZoom,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER],
    coordinationScopes,
  );

  const [ngWidth, ngHeight, containerRef] = useGridItemSize();

  const [
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
  ] = useMultiCoordinationScopesSecondaryNonNull(
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SEGMENTATION_LAYER,
    coordinationScopes,
    coordinationScopesBy,
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
      CoordinationType.FEATURE_AGGREGATION_STRATEGY,
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

  // Point layer
  const pointLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_COLOR,
      CoordinationType.FEATURE_FILTER_MODE,
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
  const [obsPointsData, obsPointsDataStatus, obsPointsUrls, obsPointsErrors] = useMultiObsPoints(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [pointMultiIndicesData, pointMultiIndicesDataStatus, pointMultiIndicesDataErrors] = usePointMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );


  // Segmentations data
  const [obsSegmentationsData, obsSegmentationsDataStatus, obsSegmentationsUrls, obsSegmentationsDataErrors] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [obsSegmentationsSetsData, obsSegmentationsSetsDataStatus, obsSegmentationsSetsDataErrors] = useSegmentationMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    segmentationMultiExpressionData,
    segmentationMultiLoadedFeatureSelection,
    segmentationMultiExpressionExtents,
    segmentationMultiExpressionNormData,
    segmentationMultiFeatureSelectionStatus,
    segmentationMultiFeatureSelectionErrors,
  ] = useSegmentationMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [segmentationMultiIndicesData, segmentationMultiIndicesDataStatus, segmentationMultiIndicesDataErrors] = useSegmentationMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const errors = [
    ...obsPointsErrors,
    ...obsSegmentationsDataErrors,
    ...obsSegmentationsSetsDataErrors,
    ...pointMultiIndicesDataErrors,
    ...segmentationMultiFeatureSelectionErrors,
    ...segmentationMultiIndicesDataErrors,
  ];

  const isReady = useReady([
    // Points
    obsPointsDataStatus,
    pointMultiIndicesDataStatus,
    // Segmentations
    obsSegmentationsDataStatus,
    obsSegmentationsSetsDataStatus,
    segmentationMultiFeatureSelectionStatus,
    segmentationMultiIndicesDataStatus,
  ]);

  // console.log("NG Subs Render orbit", spatialRotationX, spatialRotationY, spatialRotationOrbit);

  const { classes } = useStyles();

  const segmentationColorMapping = useMemoCustomComparison(() => {
    // TODO: ultimately, segmentationColorMapping becomes cellColorMapping, and makes its way into the viewerState.
    // It may make sense to merge the multiple useMemoCustomComparisons upstream of derivedViewerState into one.
    // This would complicate the comparison function, but the multiple separate useMemos are not really necessary.
    const result = {};
    segmentationLayerScopes?.forEach((layerScope) => {
      result[layerScope] = {};
      segmentationChannelScopesByLayer?.[layerScope]?.forEach((channelScope) => {
        const { obsSets: layerSets, obsIndex: layerIndex } = obsSegmentationsSetsData
          ?.[layerScope]?.[channelScope] || {};
        const {
          obsSetColor,
          obsColorEncoding,
          obsSetSelection,
          additionalObsSets,
          spatialChannelColor,
        } = segmentationChannelCoordination[0][layerScope][channelScope];

        if (obsColorEncoding === 'spatialChannelColor') {
          // All segments get the same static channel color
          if (layerIndex && spatialChannelColor) {
            const hex = rgbToHex(spatialChannelColor);
            const ngCellColors = {};
            layerIndex.forEach((id) => {
              ngCellColors[id] = hex;
            });
            result[layerScope][channelScope] = ngCellColors;
          }
        } else if (layerSets && layerIndex) {
          const mergedCellSets = mergeObsSets(layerSets, additionalObsSets);
          const cellColors = getCellColors({
            cellSets: mergedCellSets,
            cellSetSelection: obsSetSelection,
            cellSetColor: obsSetColor,
            obsIndex: layerIndex,
            theme,
          });
          // Convert the list of colors to an object of hex strings, which NG requires.
          const ngCellColors = {};
          cellColors.forEach((color, i) => {
            ngCellColors[i] = rgbToHex(color);
          });
          /* // TODO: Is this necessary?
          const obsColorIndices = treeToCellSetColorIndicesBySetNames(
            mergedLayerSets,
            obsSetSelection,
            obsSetColor,
          );
          */
          result[layerScope][channelScope] = ngCellColors;
        }
      });
    });
    return result;
  }, {
    // The dependencies for the comparison,
    // used by the custom equality function.
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    obsSegmentationsSetsData,
    segmentationChannelCoordination,
    theme,
  }, customIsEqualForCellColors);


  // Obtain the Neuroglancer viewerState object.
  const initalViewerState = useNeuroglancerViewerState(
    theme,
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    segmentationLayerCoordination,
    segmentationChannelCoordination,
    obsSegmentationsUrls,
    obsSegmentationsData,
    pointLayerScopes,
    pointLayerCoordination,
    obsPointsUrls,
    obsPointsData,
    pointMultiIndicesData,
  );


  const [latestViewerStateIteration, incrementLatestViewerStateIteration] = useReducer(x => x + 1, 0);
  const latestViewerStateRef = useRef({
    ...initalViewerState,
    ...(initialNgCameraState ?? {}),
  });

  useEffect(() => {
    const prevNgCameraState = {
      position: latestViewerStateRef.current.position,
      projectionOrientation: latestViewerStateRef.current.projectionOrientation,
      projectionScale: latestViewerStateRef.current.projectionScale,
    };
    latestViewerStateRef.current = {
      ...initalViewerState,
      ...prevNgCameraState,
    };
    // Force a re-render by incrementing a piece of state.
    // This works because we have made latestViewerStateIteration
    // a dependency for derivedViewerState, triggering the useMemo downstream.
    incrementLatestViewerStateIteration();
  }, [initalViewerState]);

  const initialRotationPushedRef = useRef(false);

  const ngRotPushAtRef = useRef(0);
  const lastInteractionSource = useRef(null);
  const applyNgUpdateTimeoutRef = useRef(null);
  const lastNgPushOrientationRef = useRef(null);
  const initialRenderCalibratorRef = useRef(null);
  const translationOffsetRef = useRef([0, 0, 0]);
  const zoomRafRef = useRef(null);
  const lastNgQuatRef = useRef([0, 0, 0, 1]);
  const lastNgScaleRef = useRef(null);
  const lastVitessceRotationRef = useRef({
    x: spatialRotationX,
    y: spatialRotationY,
    z: spatialRotationZ,
    orbit: spatialRotationOrbit,
  });

  // Track the last coord values we saw, and only mark "vitessce"
  // when *those* actually change. This prevents cell set renders
  // from spoofing the source.
  const prevCoordsRef = useRef({
    zoom: spatialZoom,
    rx: spatialRotationX,
    ry: spatialRotationY,
    rz: spatialRotationZ,
    orbit: spatialRotationOrbit,
    tx: spatialTargetX,
    ty: spatialTargetY,
  });

  /*
   * handleStateUpdate - Interactions from NG to Vitessce are pushed here
   */
  const handleStateUpdate = useCallback((newState) => {
    lastInteractionSource.current = LAST_INTERACTION_SOURCE.neuroglancer;
    const { projectionScale, projectionOrientation, position } = newState;

    // Set the views on first mount
    if (!initialRenderCalibratorRef.current) {
      // wait for a real scale
      if (!Number.isFinite(projectionScale) || projectionScale <= 0) return;

      // anchor to current Vitessce zoom
      const zRef = Number.isFinite(spatialZoom) ? spatialZoom : 0;
      initialRenderCalibratorRef.current = makeVitNgZoomCalibrator(projectionScale, zRef);

      const [px = 0, py = 0, pz = 0] = position;
      const tX = Number.isFinite(spatialTargetX) ? spatialTargetX : 0;
      const tY = Number.isFinite(spatialTargetY) ? spatialTargetY : 0;
      // TODO: translation off in the first render - turn pz to 0 if z-axis needs to be avoided
      translationOffsetRef.current = [px - tX, py - tY, pz];
      // console.log(" translationOffsetRef.current",  translationOffsetRef.current)
      const syncedZoom = initialRenderCalibratorRef.current.vitToNgZoom(INIT_VIT_ZOOM);
      latestViewerStateRef.current = {
        ...latestViewerStateRef.current,
        projectionScale: syncedZoom,
      };

      if (!Number.isFinite(spatialZoom) || Math.abs(spatialZoom - INIT_VIT_ZOOM) > ZOOM_EPS) {
        setZoom(INIT_VIT_ZOOM);
      }
      return;
    }

    // ZOOM (NG → Vitessce) — do this only after calibrator exists
    if (Number.isFinite(projectionScale) && projectionScale > 0) {
      const vitZoomFromNg = initialRenderCalibratorRef.current.ngToVitZoom(projectionScale);
      const scaleChanged = lastNgScaleRef.current == null
          || (Math.abs(projectionScale - lastNgScaleRef.current)
          > 1e-6 * Math.max(1, projectionScale));
      if (scaleChanged && Number.isFinite(vitZoomFromNg)
            && Math.abs(vitZoomFromNg - (spatialZoom ?? 0)) > ZOOM_EPS) {
        if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
        zoomRafRef.current = requestAnimationFrame(() => {
          setZoom(vitZoomFromNg);
          zoomRafRef.current = null;
        });
      }
      // remember last NG scale
      lastNgScaleRef.current = projectionScale;
    }

    // TRANSLATION
    if (Array.isArray(position) && position.length >= 2) {
      const [px, py] = position;
      const [ox, oy] = translationOffsetRef.current;
      const tx = px - ox; // map NG → Vitessce
      const ty = py - oy;
      if (Number.isFinite(tx) && Math.abs(tx - (spatialTargetX ?? tx)) > TARGET_EPS) setTargetX(tx);
      if (Number.isFinite(ty) && Math.abs(ty - (spatialTargetY ?? ty)) > TARGET_EPS) setTargetY(ty);
    }
    // ROTATION — only when NG quat actually changes
    const quatChanged = valueGreaterThanEpsilon(
      projectionOrientation, lastNgQuatRef.current, ROTATION_EPS,
    );

    if (quatChanged) {
      if (applyNgUpdateTimeoutRef.current) clearTimeout(applyNgUpdateTimeoutRef.current);
      lastNgPushOrientationRef.current = projectionOrientation;

      applyNgUpdateTimeoutRef.current = setTimeout(() => {
        // Remove the Y-up correction before converting to Euler for Vitessce
        const qVit = multiplyQuat(conjQuat(Q_Y_UP), projectionOrientation);
        const [pitchRad, yawRad] = quaternionToEuler(qVit); // radians
        const currPitchRad = deg2rad(spatialRotationX ?? 0);
        const currYawRad = deg2rad(spatialRotationOrbit ?? 0);

        if (Math.abs(pitchRad - currPitchRad) > ROTATION_EPS
              || Math.abs(yawRad - currYawRad) > ROTATION_EPS) {
          const pitchDeg = rad2deg(pitchRad);
          const yawDeg = rad2deg(yawRad);

          // Mark Vitessce as the source for the next derived pass
          lastInteractionSource.current = LAST_INTERACTION_SOURCE.vitessce;
          setRotationX(pitchDeg);
          setRotationOrbit(yawDeg);
          ngRotPushAtRef.current = performance.now();

          // // Test to verify rotation from NG to Vitessce and back to NG
          // requestAnimationFrame(() => {
          //   requestAnimationFrame(() => {
          //     // Recreate the Vitessce quaternion from the angles we *just set*
          //     const qVitJustSet = eulerToQuaternion(deg2rad(pitchDeg), deg2rad(yawDeg), 0);
          //     // Convert to NG frame (apply Y-up)
          //     const qNgExpected = multiplyQuat(Q_Y_UP, qVitJustSet);
          //     // What NG is currently holding (latest from ref, fallback to local)
          //     const qNgCurrent  = latestViewerStateRef.current?.projectionOrientation
          //  || projectionOrientation;

          //     const dot = quatdotAbs(qNgExpected, qNgCurrent);
          //     console.log('[POST-APPLY] |dot| =', dot.toFixed(6));
          //   });
          // });
        }
      }, VITESSCE_INTERACTION_DELAY);

      lastNgQuatRef.current = projectionOrientation;
    }

    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      projectionOrientation,
      projectionScale,
      position,
    };
  }, []);

  const onSegmentClick = useCallback((value) => {
    // Note: this callback is no longer called by the child component.
    // Reference: https://github.com/vitessce/vitessce/pull/2439
    if (value) {
      const id = String(value);
      const selectedCellIds = [id];
      const alreadySelectedId = cellSetSelection?.flat()?.some(sel => sel.includes(id));
      // Don't create new selection from same ids
      if (alreadySelectedId) {
        return;
      }
      // TODO: update this now that we are using layer/channel-based organization of segmentations.
      // There is no more "top-level" obsSets coordination; it is only on a per-layer basis.
      // We should probably just assume the first segmentation layer/channel when updating the logic,
      // since it is not clear how we would determine which layer/channel to update if there are multiple.
      setObsSelection(
        selectedCellIds, additionalCellSets, cellSetColor,
        setCellSetSelection, setAdditionalCellSets, setCellSetColor,
        setCellColorEncoding,
        'Selection ',
        `: based on selected segments ${value}`,
      );
    }
  }, [additionalCellSets, cellSetColor, setAdditionalCellSets,
    setCellColorEncoding, setCellSetColor, setCellSetSelection,
  ]);

  // Get the ultimate cellColorMapping for each layer to pass to NeuroglancerComp as a prop.

  const cellColorMappingByLayer = useMemo(() => {
    const result = {};
    segmentationLayerScopes?.forEach((layerScope) => {
      const channelScope = segmentationChannelScopesByLayer?.[layerScope]?.[0];
      result[layerScope] = segmentationColorMapping?.[layerScope]?.[channelScope] ?? {};
    });
    return result;
  }, [segmentationColorMapping, segmentationLayerScopes, segmentationChannelScopesByLayer]);

  // TODO: try to simplify using useMemoCustomComparison?
  // This would allow us to refactor a lot of the checking-for-changes logic into a comparison function,
  // simplify some of the manual bookkeeping like with prevCoordsRef and lastInteractionSource,
  // and would allow us to potentially remove usage of some refs (e.g., latestViewerStateRef)
  // by relying on the memoization to prevent unnecessary updates.
  const derivedViewerState = useMemo(() => {
    const { current } = latestViewerStateRef;
    if (current.layers.length <= 0) {
      return current;
    }

    const { projectionScale, projectionOrientation, position } = current;

    // Did Vitessce coords change vs the *previous* render?
    const rotChangedNow = !nearEq(spatialRotationX, prevCoordsRef.current.rx, ROTATION_EPS)
        || !nearEq(spatialRotationY, prevCoordsRef.current.ry, ROTATION_EPS)
        || !nearEq(spatialRotationZ, prevCoordsRef.current.rz, ROTATION_EPS)
        || !nearEq(spatialRotationOrbit, prevCoordsRef.current.orbit, ROTATION_EPS);

    const zoomChangedNow = !nearEq(spatialZoom, prevCoordsRef.current.zoom, ROTATION_EPS);

    const transChangedNow = !nearEq(spatialTargetX, prevCoordsRef.current.tx, ROTATION_EPS)
      || !nearEq(spatialTargetY, prevCoordsRef.current.ty, ROTATION_EPS);

    let nextProjectionScale = projectionScale;
    let nextPosition = position;

    // ** --- Zoom handling --- ** //
    if (typeof spatialZoom === 'number'
        && initialRenderCalibratorRef.current
        && lastInteractionSource.current !== LAST_INTERACTION_SOURCE.neuroglancer
        && zoomChangedNow) {
      const s = initialRenderCalibratorRef.current.vitToNgZoom(spatialZoom);
      if (Number.isFinite(s) && s > 0) {
        nextProjectionScale = s;
      }
    }

    // ** --- Translation handling --- ** //
    const [ox, oy, oz] = translationOffsetRef.current;
    const [px = 0, py = 0, pz = (current.position?.[2] ?? oz)] = current.position || [];
    const hasVitessceSpatialTarget = Number.isFinite(spatialTargetX)
       && Number.isFinite(spatialTargetY);
    if (hasVitessceSpatialTarget
        && lastInteractionSource.current !== LAST_INTERACTION_SOURCE.neuroglancer
        && transChangedNow) {
      const nx = spatialTargetX + ox; // Vitessce → NG
      const ny = spatialTargetY + oy;
      if (Math.abs(nx - px) > TARGET_EPS || Math.abs(ny - py) > TARGET_EPS) {
        nextPosition = [nx, ny, pz];
      }
    }

    // ** --- Orientation/Rotation handling --- ** //
    const vitessceRotationRaw = eulerToQuaternion(
      deg2rad(spatialRotationX ?? 0),
      deg2rad(spatialRotationOrbit ?? 0),
      deg2rad(spatialRotationZ ?? 0),
    );

    // Apply Y-up to have both views with same axis-direction (xy)
    const vitessceRotation = multiplyQuat(Q_Y_UP, vitessceRotationRaw);

    // // Round-trip check: NG -> Vit (remove Y-UP)
    // const qVitBack = multiplyQuat(conjQuat(Q_Y_UP), vitessceRotation);
    // const dotVitLoop = quatdotAbs(qVitBack, vitessceRotationRaw);

    // // Expect ~1 (± sign OK)
    // const fmt = (v) => Array.isArray(v) ? v.map(n => Number(n).toFixed(6)) : v;
    // console.log('[CHK Vit→NG→Vit] |dot| =', dotVitLoop.toFixed(6),
    //             ' qVitRaw=', fmt(vitessceRotationRaw),
    //             ' qVitBack=', fmt(qVitBack));

    // // Cross-view check: does the NG orientation we're about to send match our Vit -> NG?
    // const dotVsNg = quatdotAbs(vitessceRotation, projectionOrientation);
    // console.log('[CHK Vit→NG vs current NG] |dot| =', dotVsNg.toFixed(6));

    // If NG quat != Vitessce quat on first render, push Vitessce once.
    const shouldForceInitialVitPush = !initialRotationPushedRef.current
      && valueGreaterThanEpsilon(vitessceRotation, projectionOrientation, ROTATION_EPS);

    // Use explicit source if set; otherwise infer Vitessce when coords changed.
    const ngFresh = (performance.now() - (ngRotPushAtRef.current || 0)) < NG_ROT_COOLDOWN_MS;

    const changedNowOrIInitialVitPush = rotChangedNow
      || zoomChangedNow || transChangedNow || shouldForceInitialVitPush;

    const src = ngFresh ? LAST_INTERACTION_SOURCE.neuroglancer
      : (lastInteractionSource.current
      ?? (changedNowOrIInitialVitPush ? LAST_INTERACTION_SOURCE.vitessce : null));


    let nextOrientation = projectionOrientation; // start from NG's current quat

    // console.log('[ORIENT]',
    //   'srcResolved=', src,
    //   'lastSource=', lastInteractionSource.current,
    //   'dotLoop=', dotVitLoop.toFixed(6),
    //   'dotCross=', dotVsNg.toFixed(6)
    // );

    // console.log('[ORIENT Q]',
    //   'qVitRaw=', fmt(vitessceRotationRaw), // Vit frame (pre Y-up)
    //   'qVitToNg=', fmt(vitessceRotation), // NG frame (post Y-up)
    //   'qNgCurr=', fmt(projectionOrientation),
    // );


    if (src === LAST_INTERACTION_SOURCE.vitessce) {
      // Only push if Vitessce rotation actually changed since last time.
      const rotDiffers = valueGreaterThanEpsilon(
        vitessceRotation,
        projectionOrientation,
        ROTATION_EPS,
      );

      if (rotDiffers) {
        nextOrientation = vitessceRotation;
        lastVitessceRotationRef.current = {
          x: spatialRotationX,
          y: spatialRotationY,
          z: spatialRotationZ,
          orbit: spatialRotationOrbit,
        };
        initialRotationPushedRef.current = true;
        // Re-anchor NG -> Vitessce translation once we commit the initial orientation,
        // the center shows a right translated image
        const [cx = 0, cy = 0,
          cz = (nextPosition?.[2] ?? current.position?.[2] ?? 0),
        ] = nextPosition
          || current.position || [];
        const tX = Number.isFinite(spatialTargetX) ? spatialTargetX : 0;
        const tY = Number.isFinite(spatialTargetY) ? spatialTargetY : 0;
        translationOffsetRef.current = [cx - tX, cy - tY, cz];
      }
      // else {
      //   // No real Vitessce rotation change → do not overwrite NG's quat.
      //   console.log('Vitessce → NG: no rotation change, keep NG quat');
      // }
      if (lastInteractionSource.current === LAST_INTERACTION_SOURCE.vitessce) {
        lastInteractionSource.current = null;
      }
    } else if (src === LAST_INTERACTION_SOURCE.neuroglancer) {
      nextOrientation = lastNgPushOrientationRef.current ?? projectionOrientation;
      lastInteractionSource.current = null;
    }

    const updatedLayers = current?.layers?.map((layer, idx) => {
      const layerScope = segmentationLayerScopes?.[idx];
      const layerColorMapping = cellColorMappingByLayer?.[layerScope] ?? {};
      const layerSegments = Object.keys(layerColorMapping);
      return {
        ...layer,
        segments: layerSegments,
        segmentColors: layerColorMapping,
      };
    }) ?? [];

    const updated = {
      ...current,
      projectionScale: nextProjectionScale,
      projectionOrientation: nextOrientation,
      position: nextPosition,
      layers: updatedLayers,
    };

    latestViewerStateRef.current = updated;

    prevCoordsRef.current = {
      zoom: spatialZoom,
      rx: spatialRotationX,
      ry: spatialRotationY,
      rz: spatialRotationZ,
      orbit: spatialRotationOrbit,
      tx: spatialTargetX,
      ty: spatialTargetY,
    };

    return updated;
  }, [cellColorMappingByLayer, spatialZoom, spatialRotationX, spatialRotationY,
    spatialRotationZ, spatialTargetX, spatialTargetY, initalViewerState,
    latestViewerStateIteration]);

  const onSegmentHighlight = useCallback((obsId) => {
    setCellHighlight(String(obsId));
  }, [setCellHighlight]);

  // TODO: if all cells are deselected, a black view is shown, rather we want to show empty NG view?
  // if (!cellColorMapping || Object.keys(cellColorMapping).length === 0) {
  //   return;
  // }

  const hasLayers = derivedViewerState?.layers?.length > 0;
  // console.log(derivedViewerState);

  return (

    <TitleInfo
      title={title}
      info={subtitle}
      helpText={helpText}
      isSpatial
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      errors={errors}
      withPadding={false}
      guideUrl={GUIDE_URL}
    >
      {hasLayers ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={containerRef}>
          <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 50 }}>
            <MultiLegend
              theme="dark"
              maxHeight={ngHeight}
              segmentationLayerScopes={segmentationLayerScopes}
              segmentationLayerCoordination={segmentationLayerCoordination}
              segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
              segmentationChannelCoordination={segmentationChannelCoordination}
            />
          </div>

          <NeuroglancerComp
            classes={classes}
            onSegmentClick={onSegmentClick}
            onSelectHoveredCoords={onSegmentHighlight}
            viewerState={derivedViewerState}
            cellColorMapping={cellColorMappingByLayer}
            setViewerState={handleStateUpdate}
          />
        </div>
      ) : null}
    </TitleInfo>

  );
}
