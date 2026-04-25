/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect, useState, useReducer } from 'react';
import { throttle } from 'lodash-es';
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
  getViewportBoundingBox,
  getIntersectingChunkCoords,
  parseAnnotationChunkSegmentIds,
} from './utils.js';


const VITESSCE_INTERACTION_DELAY = 50;
const INIT_VIT_ZOOM = -3.6;
const ZOOM_EPS = 1e-2;
const ROTATION_EPS = 1e-3;
const TARGET_EPS = 0.5;
const NG_ROT_COOLDOWN_MS = 120;
const MESH_LOAD_THRESHOLD_NM = 1000;

const GUIDE_URL = 'https://vitessce.io/docs/ng-guide/';

const ANNOTATION_HEADER_OFFSET = 8;
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
    showAxisLines = false,
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

  const { classes } = useStyles();

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
  const annotationInfoRef = useRef(null);
  const annotationTransformRef = useRef(null);
  const visibleSegmentIdsRef = useRef(null);
  const chunkCacheRef = useRef(new Map());

  const [annotationReady, setAnnotationReady] = useState(false);

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
      CoordinationType.SPATIAL_POINT_STROKE_WIDTH,
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


  // console.log("NG Subs Render orbit", spatialRotationX, spatialRotationY, spatialRotationOrbit);


  const segmentationColorMapping = useMemoCustomComparison(() => {
    // TODO: ultimately, segmentationColorMapping becomes cellColorMapping, and makes its way into the viewerState.
    // It may make sense to merge the multiple useMemoCustomComparisons upstream of derivedViewerState into one.
    // This would complicate the comparison function, but the multiple separate useMemos are not really necessary.
    const result = {};



    segmentationLayerScopes?.forEach((layerScope) => {
      result[layerScope] = {};
      segmentationChannelScopesByLayer?.[layerScope]?.forEach((channelScope) => {
        const { obsSets: layerSets, obsIndex: layerIndexFromSets } = obsSegmentationsSetsData
          ?.[layerScope]?.[channelScope] || {};
        const layerIndex = layerIndexFromSets ?? null;
        const {
          obsSetColor,
          obsColorEncoding,
          obsSetSelection,
          additionalObsSets,
          spatialChannelColor,
          spatialChannelOpacity,
        } = segmentationChannelCoordination[0][layerScope][channelScope];
        if (obsColorEncoding === 'spatialChannelColor') {
          // All segments get the same static channel color
          if (spatialChannelColor) {
            const hex = rgbToHex(spatialChannelColor);
            const ngCellColors = {};
            if (layerIndex) {
              // Has obs sets — use layerIndex for IDs
              if (obsSetSelection?.length > 0) {
                const mergedCellSets = mergeObsSets(layerSets, additionalObsSets);
                const selectedIds = new Set();
                obsSetSelection.forEach((setPath) => {
                  const rootNode = mergedCellSets?.tree?.find(n => n.name === setPath[0]);
                  const leafNode = setPath.length > 1
                    ? rootNode?.children?.find(n => n.name === setPath[1])
                    : rootNode;
                  leafNode?.set?.forEach(([id]) => selectedIds.add(String(id)));
                });
                layerIndex.forEach((id) => {
                  if (selectedIds.has(String(id))) {
                    ngCellColors[id] = hex;
                  }
                });
              } else { 
                // null or empty selection - show ALL segments
                layerIndex.forEach((id) => {
                  ngCellColors[id] = hex;
                });
              }
            }
            
            // Store hex as default even if no layerIndex
            // so applyColorsAndVisibility knows the intended color
            result[layerScope][channelScope] = ngCellColors;
            result[layerScope].opacity = spatialChannelOpacity ?? 1.0;
            result[layerScope].defaultColor = hex; // store default color
          }
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
    showAxisLines,
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
  const updateVisibleSegments = useCallback(async () => {
    if (!annotationInfoRef.current) return;
    if (!annotationTransformRef.current) return;
    if (!segmentationLayerScopes?.length) return;
    if (!pointLayerScopes?.length) return;

    const { position, projectionScale, projectionOrientation } = latestViewerStateRef.current;
    if (!position || !projectionScale) return;

    // Only load meshes when zoomed in past threshold
    // projectionScale is in nm/pixel — smaller = more zoomed in

    if (projectionScale > MESH_LOAD_THRESHOLD_NM) {
      // Zoomed out — clear meshes
      if (visibleSegmentIdsRef.current?.length !== 0) {
        visibleSegmentIdsRef.current = [];
        incrementLatestViewerStateIteration();
      }
      console.log("ZOOMED OUT", projectionScale)
      return;
    }

    const orientation = projectionOrientation ?? [0, 0, 0, 1];
    const transform = annotationTransformRef.current;
    const info = annotationInfoRef.current;
    const spatialLevel = info.spatial[info.spatial.length - 1];
    const lowerBound = info.lower_bound;
    const chunkSize = spatialLevel.chunk_size;
    const gridShape = spatialLevel.grid_shape;
    const { key } = spatialLevel;


    // Step 1: compute viewport bbox in layer space
    const bbox = getViewportBoundingBox(
      position,
      projectionScale * 0.001, // nm  -> um
      orientation,
      ngWidth,
      ngHeight,
    );
    // console.log('bbox:', bbox);

    // Step 2: convert to annotation coordinate space
    const annotBbox = {
      min: [
        bbox.min[0] * transform.x,
        bbox.min[1] * transform.y,
        bbox.min[2] * transform.z,
      ],
      max: [
        bbox.max[0] * transform.x,
        bbox.max[1] * transform.y,
        bbox.max[2] * transform.z,
      ],
    };

    // console.log('annotBbox:', annotBbox);

    // Step 3: get intersecting chunk coords
    const coords = getIntersectingChunkCoords(
      annotBbox, lowerBound, chunkSize, gridShape,
    );
    if (coords.length === 0) return;
    // console.log('coords length:', coords.length);

    // Step 4: fetch chunks (with cache) that intersect with viewport and parse them
    const cellsUrl = annotationInfoRef.current.url;
    // console.log('cellsUrl', cellsUrl);

    const { x, y, z, serializer } = annotationTransformRef.current;

    const fetchChunk = async ([cx, cy]) => {
      const cacheKey = `${key}/${cx}_${cy}_0`;
      if (chunkCacheRef.current.has(cacheKey)) {
        return chunkCacheRef.current.get(cacheKey);
      }
      try {
        const res = await fetch(`${cellsUrl}/${cacheKey}`);
        if (!res.ok) {
          chunkCacheRef.current.set(cacheKey, []);
          return [];
        }
        const buffer = await res.arrayBuffer();
        
        const ids = parseAnnotationChunkSegmentIds(buffer, serializer);
        chunkCacheRef.current.set(cacheKey, ids);
        return ids;

      } catch (e) {
        console.error('fetchChunk error:', e);
        chunkCacheRef.current.set(cacheKey, []);
        return [];
      }
    };

    const results = await Promise.all(coords.map(fetchChunk));
    const visibleIds = [...new Set(results.flat())];

    if (visibleIds.length === 0) return;

    // console.log('visible segment IDs:', visibleIds.length);
    visibleSegmentIdsRef.current = visibleIds;
    incrementLatestViewerStateIteration();
  }, [ngWidth, ngHeight, segmentationLayerScopes, pointLayerScopes]);


  const updateVisibleSegmentsThrottled = useMemo(
    () => throttle(updateVisibleSegments, 500),
    [updateVisibleSegments],
  );

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
    updateVisibleSegments();
  }, [initalViewerState]);

  // Track layer loading state for showing loading indicator
  const [isLayersLoaded, setIsLayersLoaded] = useState(false);

  // Get cells URL from obsPointsUrls
  const cellsUrl = useMemo(() => {
    const firstScope = pointLayerScopes?.[0];
    return obsPointsUrls?.[firstScope]?.[0]?.url ?? null;
  }, [pointLayerScopes, obsPointsUrls]);

  const hasAnnotationSource = !!cellsUrl;

  useEffect(() => {
    if (!cellsUrl) return;

    // Fetch annotation info
    fetch(`${cellsUrl}/info`)
      .then(r => r.json())
      .then((info) => {
        // store URL on the info object
        info.url = cellsUrl;
        annotationInfoRef.current = info;
        console.log('annotation info loaded, spatial levels:', info.spatial.length);
        if (annotationTransformRef.current) setAnnotationReady(true);
      })
      .catch(err => console.error('failed to fetch annotation info:', err));
  }, [cellsUrl]);

  useEffect(() => {
    if (annotationReady) {
        // Points are loaded and showing — mark as loaded
      // Meshes will load on demand when zoomed in
      setIsLayersLoaded(true);
      updateVisibleSegments();

    }
  }, [annotationReady]);


  const onAnnotationSourceReady = useCallback((transform) => {
    annotationTransformRef.current = transform;
    if (annotationInfoRef.current) setAnnotationReady(true);
  }, []);


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
    updateVisibleSegmentsThrottled();
  }, [updateVisibleSegmentsThrottled]);

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

      result[layerScope] = {
        colors: segmentationColorMapping?.[layerScope]?.[channelScope] ?? {},
        opacity: segmentationColorMapping?.[layerScope]?.opacity ?? 1.0,
        defaultColor: segmentationColorMapping?.[layerScope]?.defaultColor ?? null,
      };
      // console.log('cellColorMappingByLayer recomputing');
      // ...
      // console.log('defaultColor:', segmentationColorMapping?.[layerScope]?.defaultColor);
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
      if (layer.type !== 'segmentation') return layer;

      const layerScope = segmentationLayerScopes?.find(
        scope => layer.name?.includes(scope)
      );
      if (!layerScope) return layer;
      const layerColorMapping = cellColorMappingByLayer?.[layerScope]?.colors ?? {};
      const defaultColor = cellColorMappingByLayer?.[layerScope]?.defaultColor;
 // Use viewport-culled IDs if available, otherwise fall back to all IDs
      const segments = hasAnnotationSource
        ? (visibleSegmentIdsRef.current ?? []) // when zoomed out []
        : Object.keys(layerColorMapping).length > 0 
          ? Object.keys(layerColorMapping)
          : []; // meshes-only fallback handled below

            // If no color mapping, build one from spatialChannelColor for visible segments
      let derivedSegmentColors = layerColorMapping;
      if (Object.keys(layerColorMapping).length === 0 && defaultColor && segments.length > 0) {
        derivedSegmentColors = Object.fromEntries(segments.map(id => [id, defaultColor]));
      }
     
//       console.log('defaultColor in updatedLayers:', defaultColor);
// console.log('segmentColors sample:', Object.entries(derivedSegmentColors).slice(0, 3));




  // console.log('segments set:', new Set(segments));
  // console.log('segmentColors keys set:', new Set(Object.keys(derivedSegmentColors)));
  // const missingColors = segments.filter(id => !(id in derivedSegmentColors));
  // console.log('segments missing colors:', missingColors.length, missingColors.slice(0, 10));
  // const extraColors = Object.keys(derivedSegmentColors).filter(id => !segments.includes(id));
  // console.log('colors for non-segments:', extraColors.length, extraColors.slice(0, 10));
      return {
        ...layer,
        segments,
        segmentColors: derivedSegmentColors,
        objectAlpha: cellColorMappingByLayer?.[layerScope]?.opacity ?? 1.0,
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

  const handleLayerLoadingChange = useCallback((isLoaded) => {
    setIsLayersLoaded(isLoaded);
  }, []);

  // TODO: if all cells are deselected, a black view is shown, rather we want to show empty NG view?
  // if (!cellColorMapping || Object.keys(cellColorMapping).length === 0) {
  //   return;
  // }

  const hasLayers = derivedViewerState?.layers?.length > 0;

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
      isReady={isReady && isLayersLoaded}
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

              // Segmentations
              segmentationLayerScopes={segmentationLayerScopes}
              segmentationLayerCoordination={segmentationLayerCoordination}
              segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
              segmentationChannelCoordination={segmentationChannelCoordination}

              // Points
              pointLayerScopes={pointLayerScopes}
              pointLayerCoordination={pointLayerCoordination}
              pointMultiIndicesData={pointMultiIndicesData}
            />
          </div>

          <NeuroglancerComp
            classes={classes}
            onSegmentClick={onSegmentClick}
            onSelectHoveredCoords={onSegmentHighlight}
            viewerState={derivedViewerState}
            cellColorMapping={cellColorMappingByLayer}
            setViewerState={handleStateUpdate}
            onLayerLoadingChange={handleLayerLoadingChange}
            onAnnotationSourceReady={onAnnotationSourceReady}
          />
        </div>
      ) : null}
    </TitleInfo>

  );
}
