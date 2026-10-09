/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useCallback, useMemo, useRef, useEffect, useState, useReducer } from 'react';
import { isEqual, throttle } from 'lodash-es';
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
  useSegmentationMultiObsColors,
  useGridItemSize,
  useMemoCustomComparison,
} from '@vitessce/vit-s';
import {
  ViewHelpMapping,
  ViewType,
  DataType,
  CoordinationType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { Chip } from '@vitessce/styles';
import { mergeObsSets, getCellColors, setObsSelection } from '@vitessce/sets-utils';
import { MultiLegend } from '@vitessce/legend';
import { NeuroglancerComp } from './Neuroglancer.js';
import {
  useNeuroglancerViewerState,
  classifyPointLayers,
  toNgLayerName,
} from './data-hook-ng-utils.js';
import { customIsEqualForCellColors } from './use-memo-custom-equals.js';
import { useStyles } from './styles.js';
import {
  eulerToQuaternion,
  valueGreaterThanEpsilon,
  nearEq,
  multiplyQuat,
  deg2rad,
  Q_Y_UP,
  applyColormap,
  parseAnnotationChunkSegmentsWithPositions,
  GREY_HEX,
  remapCellColors,
  autoColorForId,
  rgbToHex,
  reuseIfShallowEqual,
} from './utils.js';


const ROTATION_EPS = 1e-3;
const TARGET_EPS = 0.5;
const MESH_LOAD_THRESHOLD = 100;
const MESH_LOADING_OVERLAY_TIMEOUT = 1500;


const GUIDE_URL = 'https://vitessce.io/docs/ng-guide/';
const MESH_OPACITY = 0.6;

const LAST_INTERACTION_SOURCE = {
  vitessce: 'vitessce',
  neuroglancer: 'neuroglancer',
};

export function NeuroglancerSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    showAxisLines = true,
    title = 'Spatial',
    subtitle = 'Powered by Neuroglancer',
    helpText = ViewHelpMapping.NEUROGLANCER,
    meshLoadProjectionScaleThreshold,
    // Note: this is a temporary mechanism
    // to pass an initial NG camera state.
    // Ideally, all camera state should be passed via
    // the existing spatialZoom, spatialTargetX, spatialRotationOrbit, etc,
    // and then NeuroglancerSubscriber should internally convert
    // to NG-compatible values, which would eliminate the need for this.
    initialNgCameraState,
    // Optional global NG coordinate space, e.g.
    // { x: [1e-9, 'm'], y: [1e-9, 'm'], z: [1e-9, 'm'] }.
    // Overrides dimensions inferred from point layer transforms.
    viewerDimensions,
  } = props;

  const loaders = useLoaders();
  const mergeCoordination = useMergeCoordination();

  const { classes } = useStyles();

  const initialRotationPushedRef = useRef(false);
  const getViewProjectionMatRef = useRef(null);
  const obsIdToMeshIdRef = useRef({});
  const meshIdToCellIdRef = useRef({});
  // TODO: maynot be needed for other dataset
  const cellIdToMeshIdRef = useRef({});

  const lastInteractionSource = useRef(null);
  const initialRenderCalibratorRef = useRef(null);
  const translationOffsetRef = useRef([0, 0, 0]);
  // Keyed by (centroid) point layer scope: { ...info JSON, url }.
  const annotationInfoByScopeRef = useRef({});
  // Keyed by point layer scope: { x, y, z, serializers, serializer }.
  const annotationTransformByScopeRef = useRef({});
  // Keyed by segmentation layer scope: mesh IDs currently in view.
  const visibleSegmentIdsBySegLayerRef = useRef({});
  const chunkCacheRef = useRef(new Map());
  const resizeObserverRef = useRef(null);

  // Track layer loading state for showing loading indicator
  const [isLayersLoaded, setIsLayersLoaded] = useState(false);
  // For overlay when meshes are loaded on demand
  const [isMeshLoading, setIsMeshLoading] = useState(false);

  // Incremented whenever a centroid point layer has both its info JSON and
  // its NG chunk transform available (one bump per newly-ready layer).
  const [annotationReadyIteration, bumpAnnotationReady] = useReducer(x => x + 1, 0);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const updateVisibleSegmentsThrottledRef = useRef(null);
  const viewportSizeRef = useRef({ width: 0, height: 0 });
  // Counter that forces derivedViewerState to re-run when visibleSegmentIdsBySegLayerRef changes.
  // Since refs don't trigger re-renders, incrementing this value (used as a dep in the useMemo)
  // is the mechanism to propagate culling updates to the NG viewer state.
  const [latestViewerStateIteration, incrementLatestViewerStateIteration] = useReducer(x => x + 1, 0);

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
    obsHighlight: cellHighlight,
    spatialCameraSnapshot,
  }, {
    setSpatialCameraSnapshot,
    setAdditionalObsSets: setAdditionalCellSets,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.NEUROGLANCER],
    coordinationScopes,
  );

  const csvUrlRef = useRef(null);
  const csvUrl = useMemo(() => {
    if (csvUrlRef.current) return csvUrlRef.current;
    const obsSetsMap = loaders?.[dataset]?.loaders?.obsSets;
    if (!obsSetsMap) return null;
    const firstLoader = obsSetsMap.values().next().value;
    const url = firstLoader?.url ?? null;
    if (url) csvUrlRef.current = url;
    return url;
  }, [loaders, dataset]);

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
      CoordinationType.SPATIAL_LAYER_LABEL,
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
      CoordinationType.FEATURE_TYPE,
      CoordinationType.FEATURE_VALUE_TYPE,
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
      CoordinationType.SPATIAL_LAYER_OPACITY_UNSELECTED,
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
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
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

  // Optional: per-observation RGB colors, if an obsColors file is present.
  const [obsSegmentationsColorsData, obsSegmentationsColorsDataStatus, obsSegmentationsColorsDataErrors] = useSegmentationMultiObsColors(
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

  // Stabilize by value so an inline object prop doesn't rebuild the viewer state each render.
  const viewerDimensionsKey = viewerDimensions ? JSON.stringify(viewerDimensions) : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const viewerDimensionsOverride = useMemo(() => viewerDimensions ?? null, [viewerDimensionsKey]);


  // Obtain the Neuroglancer viewerState object.
  const initialViewerState = useNeuroglancerViewerState(
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
    viewerDimensionsOverride,
  );

  const [hasResolvedInitialCamera, setHasResolvedInitialCamera] = useState(!!initialNgCameraState);

  const latestViewerStateRef = useRef({
    ...initialViewerState,
    ...(initialNgCameraState ?? {}),
  });

  const segmentationUrl = useMemo(() => {
    const firstScope = segmentationLayerScopes?.[0];
    return obsSegmentationsUrls?.[firstScope]?.[0]?.url ?? null;
  }, [segmentationLayerScopes, obsSegmentationsUrls]);

  // Split point layers into centroids (obsType matches a segmentation channel,
  // drive on-demand mesh culling + hover-to-cell) vs. standalone points such as
  // transcripts (rendered + shown in the legend only). Keyed on an obsType
  // signature so the classification stays referentially stable across renders.
  const pointObsTypeSignature = (pointLayerScopes ?? [])
    .map(scope => `${scope}:${pointLayerCoordination[0]?.[scope]?.obsType}`).join('|');
  const segObsTypeSignature = (segmentationLayerScopes ?? [])
    .map(layerScope => (segmentationChannelScopesByLayer?.[layerScope] ?? [])
      .map(ch => `${layerScope}/${ch}:${segmentationChannelCoordination[0]?.[layerScope]?.[ch]?.obsType}`).join(','))
    .join('|');
  const pointLayerRoles = useMemo(() => classifyPointLayers({
    pointLayerScopes,
    pointLayerCoordination,
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    segmentationChannelCoordination,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [pointObsTypeSignature, segObsTypeSignature]);

  // Keep the previous object when every value is identical, so loader results
  // that are new containers each render don't re-trigger effects downstream.
  const pointLayerUrlsCacheRef = useRef({});
  const pointLayerUrls = useMemo(() => {
    const next = Object.fromEntries(
      (pointLayerScopes ?? []).map(scope => [scope, obsPointsUrls?.[scope]?.[0]?.url ?? null]),
    );
    return reuseIfShallowEqual(pointLayerUrlsCacheRef, next);
  }, [pointLayerScopes, obsPointsUrls]);

  // NG annotation layer name -> point layer scope.
  const pointScopeByNgLayerName = useMemo(() => Object.fromEntries(
    (pointLayerScopes ?? []).map(scope => [toNgLayerName(DataType.OBS_POINTS, scope), scope]),
  ), [pointLayerScopes]);

  // NG annotation layer name -> annotation source URL, centroid layers only.
  // Used by the hover handler to resolve a picked centroid back to its mesh ID.
  const centroidAnnotationUrlsByLayerName = useMemo(() => Object.fromEntries(
    pointLayerRoles.centroidScopes
      .filter(scope => pointLayerUrls[scope])
      .map(scope => [toNgLayerName(DataType.OBS_POINTS, scope), pointLayerUrls[scope]]),
  ), [pointLayerRoles, pointLayerUrls]);

  // Contents of the precomputed `info` JSON files, fetched by the data loaders.
  const segmentationInfo = obsSegmentationsData?.[segmentationLayerScopes?.[0]]
    ?.neuroglancerInfo ?? null;


  const annotationInfoByScopeCacheRef = useRef({});
  const annotationInfoByScope = useMemo(() => {
    const next = Object.fromEntries(
      (pointLayerScopes ?? [])
        .map(scope => [scope, obsPointsData?.[scope]?.neuroglancerInfo ?? null])
        .filter(([, info]) => info),
    );
    return reuseIfShallowEqual(annotationInfoByScopeCacheRef, next);
  }, [pointLayerScopes, obsPointsData]);


  const derivedCenter = useMemo(() => {
    // Prefer the annotation layer's real content bounds when available --
    // the raw raster volume's declared size can span far more empty space
    // than where the actual data sits (e.g. a thin tissue section inside
    // a much taller declared Z range). Mirrors the priority order in
    // tissue-map-tools' compute_initial_camera_state (mesh bounds > point
    // annotation bounds > raw volume bounds), minus the mesh-vertex tier,
    // which would need fetching actual mesh geometry rather than a single
    // info JSON.
    // With multiple point layers, take the union of bounds -- centroid layers
    // first, falling back to all point layers (e.g. transcripts-only).
    // Assumes all point layers share one annotation coordinate space.
    const validBounds = scopes => scopes
      .map(scope => annotationInfoByScope[scope])
      .map(info => [info?.lower_bound, info?.upper_bound])
      .filter(([lo, up]) => Array.isArray(lo) && Array.isArray(up)
        && lo.length === 3 && up.length === 3
        && lo.every(Number.isFinite) && up.every(Number.isFinite));
    let bounds = validBounds(pointLayerRoles.centroidScopes);
    if (!bounds.length) bounds = validBounds(Object.keys(annotationInfoByScope));
    if (bounds.length) {
      const lower = [0, 1, 2].map(i => Math.min(...bounds.map(([lo]) => lo[i])));
      const upper = [0, 1, 2].map(i => Math.max(...bounds.map(([, up]) => up[i])));
      return lower.map((lo, i) => (lo + upper[i]) / 2);
    }
    const scale = segmentationInfo?.scales?.[0];
    const size = scale?.size;
    const voxelOffset = scale?.voxel_offset ?? [0, 0, 0];
    const resolution = scale?.resolution ?? [1, 1, 1];
    if (Array.isArray(size) && size.length === 3 && size.every(Number.isFinite)) {
      return size.map((s, i) => ((voxelOffset[i] ?? 0) + s / 2) * (resolution[i] ?? 1));
    }
    return null;
  }, [segmentationInfo, annotationInfoByScope, pointLayerRoles]);

  useEffect(() => {
    if (initialNgCameraState || !segmentationUrl) {
      setHasResolvedInitialCamera(true);
      return;
    }
    if (derivedCenter) {
      latestViewerStateRef.current = {
        ...latestViewerStateRef.current,
        position: derivedCenter,
      };
      incrementLatestViewerStateIteration();
    }
    setHasResolvedInitialCamera(true);
  }, [segmentationUrl, derivedCenter, initialNgCameraState]);

  const errors = [
    ...obsPointsErrors,
    ...obsSegmentationsDataErrors,
    ...obsSegmentationsSetsDataErrors,
    ...obsSegmentationsColorsDataErrors,
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
    obsSegmentationsColorsDataStatus,
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

  // The most recent camera snapshot that was either published by this view
  // or already applied to it. Used to ignore our own writes when they
  // come back to us via the coordination space.
  const lastSeenCameraSnapshotRef = useRef(null);
  const spatialBetaJustPushedRef = useRef(false);

  // Sync in the reverse direction (spatialBeta -> NG), for direct dragging
  // inside spatialBeta's own panel. The snapshot is shared via the
  // spatialCameraSnapshot coordination type.
  useEffect(() => {
    if (!spatialCameraSnapshot) return;
    if (spatialCameraSnapshot === lastSeenCameraSnapshotRef.current) return;
    lastSeenCameraSnapshotRef.current = spatialCameraSnapshot;

    const { position, quaternion, projectionScale } = spatialCameraSnapshot;
    if (!Array.isArray(position) || !Array.isArray(quaternion)) return;
    // The snapshot quaternion lives in the Q_Y_UP-flipped frame (see the
    // matching multiplyQuat(..., Q_Y_UP) applied when publishing NG's state
    // in handleStateUpdate below). Q_Y_UP is self-inverse, so
    // applying it again un-does that flip before pushing back into NG.
    const unflipped = multiplyQuat(quaternion, Q_Y_UP);

    lastInteractionSource.current = LAST_INTERACTION_SOURCE.vitessce;
    spatialBetaJustPushedRef.current = true;
    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      position,
      projectionOrientation: unflipped,
      projectionScale,
    };
    incrementLatestViewerStateIteration();
  }, [spatialCameraSnapshot]);

  const segmentationColorMapping = useMemoCustomComparison(() => {
    // TODO: ultimately, segmentationColorMapping becomes cellColorMapping, and makes its way into the viewerState.
    // It may make sense to merge the multiple useMemoCustomComparisons upstream of derivedViewerState into one.
    // This would complicate the comparison function, but the multiple separate useMemos are not really necessary.
    const result = {};
    segmentationLayerScopes?.forEach((layerScope) => {
      result[layerScope] = {};
      segmentationChannelScopesByLayer?.[layerScope]?.forEach((channelScope) => {
        // Prefer obsFeatureMatrix.obsIndex from segmentationMultiIndicesData,
        // but fall back to obsSets.obsIndex if not available.
        const { obsSets: layerSets, obsIndex: layerIndexFromSets } = obsSegmentationsSetsData
          ?.[layerScope]?.[channelScope] || {};
        const { obsIndex: layerIndexFromMatrix } = segmentationMultiIndicesData
          ?.[layerScope]?.[channelScope] || {};
        const { obsIndex: layerIndexFromColors, obsColorMap } = obsSegmentationsColorsData
          ?.[layerScope]?.[channelScope] || {};

        // Prefer the observation index from obsFeatureMatrix,
        // then from the per-observation colors,
        // and finally, if neither of those are provided, from obsSets.
        const rawLayerIndex = layerIndexFromMatrix
        ?? (layerIndexFromColors
          ?? (layerIndexFromSets ?? null)
        );
        // obsFeatureMatrix's own index can carry a dataset-specific prefix
        // (e.g. "F8iia-quantification3_1") for the same segment IDs NG's
        // own mesh/segments use in plain numeric form ("1") -- normalize so
        // every downstream consumer (idsToColor, knownIdSet, cellColors
        // lookups) works with one consistent id per segment, matching the
        // same stripping already applied in the geneSelection branch below.
        const layerIndex = rawLayerIndex
          ? Array.from(new Set(rawLayerIndex.map(id => String(id).replace(/^.*_/, ''))))
          : rawLayerIndex;
        const idsToColor = layerIndex;
        const knownIdSet = new Set((layerIndex ?? []).map(String));

        const {
          obsSetColor,
          obsColorEncoding,
          obsSetSelection,
          additionalObsSets,
          spatialChannelColor,
          spatialChannelOpacity,
          featureValueColormap,
          featureValueColormapRange,
        } = segmentationChannelCoordination[0][layerScope][channelScope];

        // Applies the explicit segmentColors override (if any) on top of
        // whatever colors were computed, then commits to `result`.
        const finalizeChannelColors = (ngCellColors, opacity, defaultColor) => {
          const merged = ngCellColors;
          // Store hex as default even if no layerIndex
          // so applyColorsAndVisibility knows the intended color
          // result[layerScope][channelScope] = ngCellColors;
          // TODO: Remove remapping when Meshid/cellID mismatch is fixed
          result[layerScope][channelScope] = remapCellColors(merged, cellIdToMeshIdRef);
          result[layerScope].opacity = opacity ?? 1.0;
          if (defaultColor !== undefined) {
            result[layerScope].defaultColor = defaultColor;
          }
        };

        if (obsColorEncoding === 'obsColors') {
          // Each segment gets its own color, from the obsColors data type.
          if (obsColorMap) {
            const ngCellColors = {};
            idsToColor.forEach((id) => {
              if (knownIdSet.has(String(id))) {
                const color = obsColorMap.get(id);
                if (color) {
                  ngCellColors[id] = rgbToHex(color);
                } else {
                  // Not part of obsColors at all - use a default grey.
                  ngCellColors[id] = GREY_HEX;
                }
              }
            });
            finalizeChannelColors(ngCellColors, spatialChannelOpacity);
          } else if (idsToColor) {
            // No obsColors data available yet (e.g. still loading, or none
            // provided) -- fall back to flat grey for every
            // known segment rather than leaving colors unset entirely.
            const ngCellColors = {};
            idsToColor.forEach((id) => {
              if (knownIdSet.has(String(id))) {
                ngCellColors[id] = GREY_HEX;
              }
            });
            finalizeChannelColors(ngCellColors, spatialChannelOpacity, GREY_HEX);
          }
        } else if (obsColorEncoding === 'spatialChannelColor') {
          // All segments get the same static channel color
          const hex = spatialChannelColor ? rgbToHex(spatialChannelColor) : autoColorForId(layerScope + channelScope);
          if (spatialChannelColor) {
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
            finalizeChannelColors(ngCellColors, spatialChannelOpacity, hex);
          }
        } else if (obsColorEncoding === 'geneSelection') {
          // For NG mesh segmentations, obsIndex comes from obsSegmentationsSetsData
          const instanceObsIndex = obsSegmentationsSetsData
            ?.[layerScope]?.[channelScope]?.obsIndex;
          const restrictedObsIndex = instanceObsIndex?.filter(id => knownIdSet.has(String(id)));
          const matrixObsIndex = segmentationMultiIndicesData
            ?.[layerScope]?.[channelScope]?.obsIndex;
          const expressionData = segmentationMultiExpressionNormData
            ?.[layerScope]?.[channelScope];
          if (restrictedObsIndex && matrixObsIndex && expressionData?.[0]) {
            // matrixObsIndex uses 'MIS_X' format, instanceObsIndex uses 'X'
            // Strip prefix to align the two index spaces
            const matrixIndexMap = new Map(
              restrictedObsIndex.map((key, i) => {
                // Strip any non-numeric prefix (e.g. 'MIS_0' -> '0')
                const normalizedKey = key.replace(/^.*_/, '');
                return [normalizedKey, i];
              }),
            );
            const toMatrixIndex = restrictedObsIndex.map(key => matrixIndexMap.get(String(key)));
            const [low, high] = featureValueColormapRange ?? [0, 1];
            const ngCellColors = {};
            restrictedObsIndex.forEach((id, i) => {
              const rowIndex = toMatrixIndex[i];
              const rawVal = expressionData[0][rowIndex] ?? 0;
              // Uint8Array values are 0-255, already normalized — convert to 0-1
              const t = rawVal / 255;
              // Apply colormapRange scaling
              const tScaled = (t - low) / Math.max(high - low, 0.0001);
              const tClamped = Math.max(0, Math.min(1, tScaled));
              const color = applyColormap(featureValueColormap ?? 'viridis', tClamped);
              ngCellColors[id] = rgbToHex(color);
            });
            finalizeChannelColors(ngCellColors, spatialChannelOpacity);
          } else if (restrictedObsIndex) {
            // No expression data available — use default color for all segments
            const fallbackColor = spatialChannelColor ? rgbToHex(spatialChannelColor) : GREY_HEX;
            const ngCellColors = {};
            restrictedObsIndex.forEach((id) => {
              ngCellColors[id] = fallbackColor;
            });
            finalizeChannelColors(ngCellColors, spatialChannelOpacity);
          }
        } else if (layerSets && layerIndex) {
          // cellSetSelection encoding — color by obs set membership
          const mergedCellSets = mergeObsSets(layerSets, additionalObsSets);
          const cellColors = getCellColors({
            cellSets: mergedCellSets,
            cellSetSelection: obsSetSelection,
            cellSetColor: obsSetColor,
            obsIndex: layerIndex,
            theme,
          });
          const ngCellColors = {};
          // cellColors is a Map keyed by segment ID
          idsToColor.forEach((id) => {
            if (knownIdSet.has(String(id))) {
              const color = cellColors.get(String(id));
              if (color) {
                ngCellColors[id] = rgbToHex(color);
              } else {
                // Not part of obsSets at all — auto-color deterministically.
                ngCellColors[id] = GREY_HEX;
              }
            }
          });
          finalizeChannelColors(ngCellColors, spatialChannelOpacity);
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
    obsSegmentationsColorsData,
    segmentationChannelCoordination,
    theme,
    segmentationMultiExpressionNormData,
    segmentationMultiIndicesData,
    csvLoaded,
  }, customIsEqualForCellColors);

  // TODO: For debugging in console uncomment
  // useEffect(() => {
  //   // eslint-disable-next-line no-underscore-dangle
  //   window.__chunkCache = chunkCacheRef.current;
  // }, []);

  useEffect(() => {
    if (!csvUrl) return;
    fetch(csvUrl)
      .then(r => r.text())
      .then((text) => {
        const lines = text.split('\n');
        const header = lines[0].split(',');
        const meshIdIdx = header.indexOf('MeshID');
        const cellIdIdx = header.indexOf('CellID');
        const meshMap = {};
        const cellMap = {};
        lines.slice(1).forEach((l) => {
          const cols = l.split(',');
          const meshId = cols[meshIdIdx]?.trim();
          const cellId = cols[cellIdIdx]?.trim();
          if (meshId && cellId) {
            meshMap[meshId] = cellId;
            cellMap[cellId] = meshId; // ← add reverse map
          }
        });
        meshIdToCellIdRef.current = meshMap;
        cellIdToMeshIdRef.current = cellMap;
        setCsvLoaded(true);
        // TODO: For debugging
        // window.__meshIdToCellId = meshIdToCellIdRef.current;
        // window.__cellIdToMeshIdRef = cellIdToMeshIdRef.current
      });
  }, [csvUrl]);

  // clear cache when annotation source changes
  useEffect(() => {
    chunkCacheRef.current.clear();
  }, [obsPointsData]);

  // Keep ref in sync with latest dimensions
  useEffect(() => {
    if (ngWidth && ngHeight) {
      viewportSizeRef.current = { width: ngWidth, height: ngHeight };
    }
  }, [ngWidth, ngHeight]);

  // Fallback: directly observe the container's own size.
  // The shared/global grid-resize signal (useGridItemSize) can race with this
  // view's mount order relative to sibling views, leaving viewportSizeRef
  // stuck at {0, 0} until an unrelated resize event happens to fire again.
  // A local ResizeObserver guarantees we get real dimensions as soon as
  // this container has a layout size, regardless of that timing.
  const setContainerNode = useCallback((node) => {
    containerRef.current = node; // keep useGridItemSize's internal logic in sync
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    if (node) {
      // Seed synchronously in case the first ResizeObserver callback is delayed,
      // so updateVisibleSegments doesn't wait an extra tick for real dimensions.
      const rect = node.getBoundingClientRect();
      if (rect.width && rect.height) {
        viewportSizeRef.current = { width: rect.width, height: rect.height };
      }
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const { width, height } = entry.contentRect;
        if (width && height) {
          viewportSizeRef.current = { width, height };
        }
      });
      observer.observe(node);
      resizeObserverRef.current = observer;
    }
  }, []);

  // Core viewport culling function — determines which mesh segments are visible
  // in the current camera view and updates visibleSegmentIdsBySegLayerRef accordingly.
  // Note: When loading overlay stops after zooming, the meshes appears after some time as fetching takes time
  /**
   ** Following are the steps/Pseudocode that provide the on-demand-mesh-loading
      Zoom in past threshold
      updateVisibleSegments() fires (throttled 500ms)
      Fetch all chunks across all spatial levels (cached after first fetch)
      Parse binary to array of { id, x, y, z, ... } per point
      Deduplicate by id across LOD levels
      Project each centroid through NG's view-projection matrix to screen pixels
      Keep only centroids within [-margin, ngWidth+margin] × [-margin, ngHeight+margin]
      visibleSegmentIdsBySegLayerRef[segLayer] = surviving IDs (per centroid layer, routed by obsType)
      Increment latestViewerStateIteration, derivedViewerState re-runs
      derivedViewerState puts IDs into segmentation layer's segments array
      componentDidUpdate in ReactNeuroglancer.js detects segments changed and calls restoreState({ layers })
      NG receives updated segments and fetches and renders meshes for those IDs
   */
  const updateVisibleSegments = useCallback(async () => {
    // TODO: For Debugging
    // if (window.__disableCulling) return;
    if (!segmentationLayerScopes?.length) return;
    const { centroidToSegLayers } = pointLayerRoles;
    const infoByScope = annotationInfoByScopeRef.current;
    const transformByScope = annotationTransformByScopeRef.current;
    // Only centroid layers that have both info JSON and NG chunk transform.
    const readyScopes = Object.keys(infoByScope)
      .filter(scope => centroidToSegLayers[scope] && transformByScope[scope]);
    if (!readyScopes.length) return;

    const { position, projectionScale } = latestViewerStateRef.current;
    if (!position || !projectionScale) return;

    // Commit per-segmentation-layer visible IDs; only bump NG state on real change.
    // Returns the number of newly-added IDs across all segmentation layers.
    const commitVisibleIds = (nextBySegLayer) => {
      const prevBySegLayer = visibleSegmentIdsBySegLayerRef.current ?? {};
      const segLayers = new Set([...Object.keys(prevBySegLayer), ...Object.keys(nextBySegLayer)]);
      let changed = false;
      let added = 0;
      segLayers.forEach((segLayer) => {
        const prevIds = prevBySegLayer[segLayer] ?? [];
        const nextIds = nextBySegLayer[segLayer] ?? [];
        const prevSet = new Set(prevIds);
        added += nextIds.filter(id => !prevSet.has(id)).length;
        if ([...prevIds].sort().join(',') !== [...nextIds].sort().join(',')) changed = true;
      });
      if (changed) {
        visibleSegmentIdsBySegLayerRef.current = nextBySegLayer;
        incrementLatestViewerStateIteration();
      }
      return added;
    };

    // Threshold check - too zoomed out, clear segments
    const maxProjectionScale = meshLoadProjectionScaleThreshold ?? MESH_LOAD_THRESHOLD;
    if (projectionScale > maxProjectionScale) {
      commitVisibleIds({});
      setIsMeshLoading(false);
      return;
    }
    const { width, height } = viewportSizeRef.current;
    if (!width || !height) return;

    const fetchChunkWithPositions = async (cellsInfoUrl, serializer, { level, cx, cy, cz }) => {
      const cacheKey = `${cellsInfoUrl}/${level}/${cx}_${cy}_${cz}`;
      if (chunkCacheRef.current.has(cacheKey)) {
        return chunkCacheRef.current.get(cacheKey);
      }
      try {
        const res = await fetch(cacheKey);
        if (!res.ok) {
          chunkCacheRef.current.set(cacheKey, []);
          return [];
        }
        const buffer = await res.arrayBuffer();
        const entries = parseAnnotationChunkSegmentsWithPositions(buffer, serializer);
        chunkCacheRef.current.set(cacheKey, entries);
        return entries;
      } catch (e) {
        chunkCacheRef.current.set(cacheKey, []);
        return [];
      }
    };

    // Fetch all annotation chunks across all spatial levels of one centroid layer,
    // deduplicated by mesh ID across LOD levels.
    const collectEntriesForScope = async (scope) => {
      const info = infoByScope[scope];
      const { serializers, serializer: defaultSerializer } = transformByScope[scope];
      // TODO: confirm for all datasets
      // All spatial levels use serializer[0] (32-byte property block).
      // Although serializer[1] (44 bytes) exists for rank-3 spatial levels spatial1/2/3,
      // the actual chunk data was generated with 32-byte properties regardless of level.
      const serializer = serializers?.[0] ?? defaultSerializer;
      if (!serializer || !Array.isArray(info.spatial)) return [];
      const allLevelCoords = info.spatial.flatMap((level) => {
        const [gx, gy, gz] = level.grid_shape;
        const coords = [];
        for (let cx = 0; cx < gx; cx++) {
          for (let cy = 0; cy < gy; cy++) {
            for (let cz = 0; cz < gz; cz++) {
              coords.push({ level: level.key, cx, cy, cz });
            }
          }
        }
        return coords;
      });
      const results = await Promise.all(
        allLevelCoords.map(c => fetchChunkWithPositions(info.url, serializer, c)),
      );
      const seenIds = new Set();
      return results.flat().filter(({ id }) => {
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      });
    };

    try {
      const entriesByScope = await Promise.all(readyScopes.map(collectEntriesForScope));

      // Get current view-projection matrix from NG panel
      const mat = getViewProjectionMatRef.current?.();
      if (!mat) {
        // Fallback: load all if projection matrix not available
        console.warn('No viewProjectionMatrix, loading all');
      }
      // Extend the viewport by 50% on each side (to allow mesh-loading when panning around)
      const margin = Math.max(width, height) * 0.5;

      const nextBySegLayer = {};
      const obsIdToMeshIdByScope = {};
      readyScopes.forEach((scope, i) => {
        const allEntries = entriesByScope[i];
        const transform = transformByScope[scope];

        // obsId → meshId lookup for hover, kept per centroid layer.
        const obsIdToMeshId = {};
        allEntries.forEach(({ id, obsId }) => {
          obsIdToMeshId[obsId] = id;
        });
        obsIdToMeshIdByScope[scope] = obsIdToMeshId;

        // Screen-space culling: project each centroid from annotation space
        // to screen pixels and keep only those within the viewport bounds.
        const visibleEntries = !mat ? allEntries : allEntries.filter(({ x, y, z }) => {
          // Annotation to viewer coordinates (per-layer transform)
          const vx = x / transform.x;
          const vy = y / transform.y;
          const vz = (z || 0) / transform.z;
          // Project to clip space (column-major matrix)
          const cx = mat[0] * vx + mat[4] * vy + mat[8] * vz + mat[12];
          const cy = mat[1] * vx + mat[5] * vy + mat[9] * vz + mat[13];
          const cw = mat[3] * vx + mat[7] * vy + mat[11] * vz + mat[15];
          // Perspective divide to screen pixels
          const screenX = ((cx / cw) + 1) * 0.5 * width;
          const screenY = (1 - (cy / cw)) * 0.5 * height;
          return screenX >= -margin && screenX <= width + margin
            && screenY >= -margin && screenY <= height + margin;
        });

        // Route this centroid layer's visible IDs to every segmentation layer
        // it is the centroid source for (matched by obsType).
        centroidToSegLayers[scope].forEach((segLayer) => {
          const merged = new Set(nextBySegLayer[segLayer] ?? []);
          visibleEntries.forEach(({ id }) => merged.add(id));
          nextBySegLayer[segLayer] = Array.from(merged);
        });
      });
      obsIdToMeshIdRef.current = obsIdToMeshIdByScope;

      const addedIdsCount = commitVisibleIds(nextBySegLayer);
      const totalVisible = Object.values(nextBySegLayer)
        .reduce((acc, ids) => acc + ids.length, 0);

      // If panned into an empty area
      if (totalVisible === 0) {
        setIsMeshLoading(false);
        return;
      }

      // Only show overlay if significant number of new meshes need loading
      const hasSignificantChange = addedIdsCount > 20;
      if (hasSignificantChange) {
        setIsMeshLoading(true);
        setTimeout(() => setIsMeshLoading(false), MESH_LOADING_OVERLAY_TIMEOUT);
      }
    } catch (e) {
      console.warn('[updateVisibleSegments] error:', e);
      setIsMeshLoading(false);
    }
  }, [segmentationLayerScopes, pointLayerRoles, meshLoadProjectionScaleThreshold]);

  useEffect(() => {
    updateVisibleSegmentsThrottledRef.current = throttle(updateVisibleSegments, 500);
    return () => updateVisibleSegmentsThrottledRef.current?.cancel();
  }, [updateVisibleSegments]);

  useEffect(() => {
    const prevNgCameraState = {
      position: latestViewerStateRef.current.position,
      projectionOrientation: latestViewerStateRef.current.projectionOrientation,
      projectionScale: latestViewerStateRef.current.projectionScale,
    };
    latestViewerStateRef.current = {
      ...initialViewerState,
      ...prevNgCameraState,
    };
    // Force a re-render by incrementing a piece of state.
    // This works because we have made latestViewerStateIteration
    // a dependency for derivedViewerState, triggering the useMemo downstream.
    incrementLatestViewerStateIteration();
  }, [initialViewerState]);

  // True when at least one centroid point layer (obsType matches a segmentation
  // channel) has a source URL -- i.e., on-demand mesh culling is active for
  // at least one segmentation layer. Transcript-only point layers never set this.
  const hasCentroidLayers = useMemo(
    () => pointLayerRoles.centroidScopes.some(scope => pointLayerUrls[scope]),
    [pointLayerRoles, pointLayerUrls],
  );

  // Annotation info (<url>/info) for each centroid point layer, along with its URL,
  // used to fetch spatial chunk files for viewport culling.

  // Scopes that have already been signalled as ready (info + transform).
  // Bumping is idempotent per scope: re-running the effects below with
  // unchanged data must never trigger another render (avoids an update loop).
  const readyCentroidScopesRef = useRef(new Set());
  const markScopeReadyIfComplete = useCallback((scope) => {
    if (readyCentroidScopesRef.current.has(scope)) return;
    if (annotationInfoByScopeRef.current[scope] && annotationTransformByScopeRef.current[scope]) {
      readyCentroidScopesRef.current.add(scope);
      bumpAnnotationReady();
    }
  }, []);

  useEffect(() => {
    const prev = annotationInfoByScopeRef.current;
    const next = {};
    pointLayerRoles.centroidScopes.forEach((scope) => {
      const url = pointLayerUrls[scope];
      const info = annotationInfoByScope[scope];
      if (url && info) next[scope] = { ...info, url };
    });
    // A scope whose source changed (or went away) must become ready again.
    Object.keys(prev).forEach((scope) => {
      if (prev[scope]?.url !== next[scope]?.url) readyCentroidScopesRef.current.delete(scope);
    });
    annotationInfoByScopeRef.current = next;
    Object.keys(next).forEach(markScopeReadyIfComplete);
  }, [pointLayerRoles, pointLayerUrls, annotationInfoByScope, markScopeReadyIfComplete]);


  // Whenever a centroid layer becomes ready (info + transform), mark loaded and
  // re-run culling so its meshes are included. Keyed only on the ready contouner.
  const updateVisibleSegmentsRef = useRef(updateVisibleSegments);
  updateVisibleSegmentsRef.current = updateVisibleSegments;
  useEffect(() => {
    if (annotationReadyIteration > 0) {
      // Points are loaded and showing — mark as loaded
      // Meshes will load on demand when zoomed in
      setIsLayersLoaded(true);
      updateVisibleSegmentsRef.current();
    }
  }, [annotationReadyIteration]);


  // Callback passed to ReactNeuroglancer when an annotation layer's first chunk loads.
  // Called once per NG annotation layer, with its layerName, layerToChunkTransform
  // (for coordinate space conversion) and NG property serializers (for binary chunk parsing).
  const onAnnotationSourceReady = useCallback(({ layerName, ...transform }) => {
    const scope = pointScopeByNgLayerName[layerName];
    if (!scope) return;
    annotationTransformByScopeRef.current = {
      ...annotationTransformByScopeRef.current,
      [scope]: transform,
    };
    markScopeReadyIfComplete(scope);
    }, [pointScopeByNgLayerName, markScopeReadyIfComplete]);


  /*
   * handleStateUpdate - Interactions from NG to Vitessce are pushed here
   */
  const handleStateUpdate = useCallback((newState) => {
    lastInteractionSource.current = LAST_INTERACTION_SOURCE.neuroglancer;
    const { projectionScale, projectionOrientation, position } = newState;
    // Publish NG's raw camera state via the spatialCameraSnapshot
    // coordination type -- no Euler decomposition, position/quaternion pass
    // through unchanged. spatialBeta's RawView reads this directly.
    if (Array.isArray(position) && Array.isArray(projectionOrientation)) {
      const flippedQuaternion = multiplyQuat(projectionOrientation, Q_Y_UP);
      const snapshot = {
        position: Array.from(position),
        quaternion: Array.from(flippedQuaternion),
        projectionScale,
        fovDegrees: 45,
      };
      lastSeenCameraSnapshotRef.current = snapshot;
      setSpatialCameraSnapshot(snapshot);
    }
    // NG updates it's current state
    latestViewerStateRef.current = {
      ...latestViewerStateRef.current,
      projectionOrientation,
      projectionScale,
      position,
    };
    updateVisibleSegmentsThrottledRef.current?.();
  }, [setSpatialCameraSnapshot]);

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
    });
    return result;
  }, [segmentationColorMapping, segmentationLayerScopes, segmentationChannelScopesByLayer]);


  useEffect(() => {
    if (!hasCentroidLayers && isReady && !segmentationLayerScopes?.length) {
      // If no segmentation layers at all — show the loading overlay
      setIsLayersLoaded(true);
    }
  }, [hasCentroidLayers, isReady, segmentationLayerScopes]);

  // For on-demand-mesh-loading use opacity to make the centroids obvious.
  // Applied only to segmentation layers that have a centroid point layer.
  // TODO: may be this should be a prop?
  const meshOpacityByLayer = useMemo(() => Object.fromEntries(
    [...pointLayerRoles.culledSegLayerScopes].map(segLayer => [segLayer, MESH_OPACITY]),
  ), [pointLayerRoles]);
  // TODO: try to simplify using useMemoCustomComparison?
  // This would allow us to refactor a lot of the checking-for-changes logic into a comparison function,
  // simplify some of the manual bookkeeping like with prevCoordsRef and lastInteractionSource,
  // and would allow us to potentially remove usage of some refs (e.g., latestViewerStateRef)
  // by relying on the memoization to prevent unnecessary updates.
  const derivedViewerState = useMemo(() => {
    // console.log('[derivedViewerState] iteration:', latestViewerStateIteration);
    // console.log('[derivedViewerState] visibleSegmentIdsBySegLayerRef:', visibleSegmentIdsBySegLayerRef.current);
    const { current } = latestViewerStateRef;
    // console.log("lastInteractionSource", lastInteractionSource.current)
    if (spatialBetaJustPushedRef.current) {
      // A direct spatialBeta drag already placed the correct raw
      // position/projectionOrientation/projectionScale into `current`
      // above -- skip the Euler-based rotation-source resolution below
      // entirely for this one pass, so it can't clobber the raw push with
      // stale spatialRotationX/spatialRotationOrbit-derived values.
      spatialBetaJustPushedRef.current = false;
      if (lastInteractionSource.current === LAST_INTERACTION_SOURCE.vitessce) {
        lastInteractionSource.current = null;
      }
      prevCoordsRef.current = {
        zoom: spatialZoom,
        rx: spatialRotationX,
        ry: spatialRotationY,
        rz: spatialRotationZ,
        orbit: spatialRotationOrbit,
        tx: spatialTargetX,
        ty: spatialTargetY,
      };
      return current;
    }

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

    // console.log('[zoom guard]', {
    //   spatialZoom,
    //   spatialZoomType: typeof spatialZoom,
    //   hasCalibrator: !!initialRenderCalibratorRef.current,
    //   lastInteractionSource: lastInteractionSource.current,
    //   zoomChangedNow,
    // });

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

    const changedNowOrIInitialVitPush = rotChangedNow
      || zoomChangedNow || transChangedNow || shouldForceInitialVitPush;

    const src = lastInteractionSource.current
      ?? (changedNowOrIInitialVitPush ? LAST_INTERACTION_SOURCE.vitessce : null);


    let nextOrientation = projectionOrientation; // start from NG's current quat


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
      if (lastInteractionSource.current === LAST_INTERACTION_SOURCE.vitessce) {
        lastInteractionSource.current = null;
      }
    } else if (src === LAST_INTERACTION_SOURCE.neuroglancer) {
      nextOrientation = projectionOrientation;
      lastInteractionSource.current = null;
    }

    const updatedLayers = current?.layers?.map((layer, idx) => {
      if (layer.type !== 'segmentation') return layer;

      const layerScope = segmentationLayerScopes?.find(
        scope => layer.name?.includes(scope),
      );
      if (!layerScope) return layer;
      const layerColorMapping = cellColorMappingByLayer?.[layerScope]?.colors ?? {};
      const defaultColor = cellColorMappingByLayer?.[layerScope]?.defaultColor;

      // Culling is per segmentation layer: only layers with a matching
      // centroid point layer are culled; others show all colored segments.
      const isCulled = pointLayerRoles.culledSegLayerScopes.has(layerScope);

      // Determine which segment IDs to pass to NG:
      let segments = [];
      if (isCulled) {
        // Viewport culling active — use only visible segment IDs
        segments = visibleSegmentIdsBySegLayerRef.current?.[layerScope] ?? [];
      } else if (Object.keys(layerColorMapping).length > 0) {
        // No culling — show all segments from color mapping
        segments = Object.keys(layerColorMapping);
      }
      // only include colors for visible segments
      let derivedSegmentColors = {};
      if (isCulled && segments.length > 0) {
        segments.forEach((meshId) => {
          const color = layerColorMapping[meshId] || defaultColor;
          if (color) derivedSegmentColors[meshId] = color;
        });
      } else if (!isCulled) {
        derivedSegmentColors = layerColorMapping;
      }
      return {
        ...layer,
        segments,
        segmentColors: derivedSegmentColors,
        objectAlpha: cellColorMappingByLayer?.[layerScope]?.opacity ?? 1.0,
      };
    }) ?? [];
    const layersChanged = !isEqual(current.layers, updatedLayers);
    const updated = {
      ...current,
      projectionScale: nextProjectionScale,
      projectionOrientation: nextOrientation,
      position: nextPosition,
      ...(layersChanged ? { layers: updatedLayers } : {}),
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
    spatialRotationZ, spatialTargetX, spatialTargetY, initialViewerState,
    latestViewerStateIteration, pointLayerRoles]);

  const onSegmentHighlight = useCallback((obsId) => {
    const next = obsId != null ? String(obsId) : null;
    if (next === cellHighlight) return;
    setCellHighlight(next);
  }, [setCellHighlight, cellHighlight]);

  const handleLayerLoadingChange = useCallback((isLoaded) => {
    if (!isLayersLoaded && isLoaded) {
      setIsLayersLoaded(true);
    }
  }, [isLayersLoaded]);

  // TODO: if all cells are deselected, a black view is shown, rather we want to show empty NG view?
  // if (!cellColorMapping || Object.keys(cellColorMapping).length === 0) {
  //   return;
  // }
  const hasLayers = derivedViewerState?.layers?.length > 0;

  // Legend shows standalone point layers (e.g. transcripts) only;
  // centroid layers are represented by their segmentation's legend entry.
  const legendPointLayerScopes = pointLayerRoles.transcriptScopes.length > 0
    ? pointLayerRoles.transcriptScopes
    : undefined;

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
      isReady={isReady && isLayersLoaded}// && !(hasCentroidLayers && isMeshLoading)}
      errors={errors}
      withPadding={false}
      guideUrl={GUIDE_URL}
    >
      {hasLayers && hasResolvedInitialCamera ? (
        <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={setContainerNode}>
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
              pointLayerScopes={legendPointLayerScopes}
              pointLayerCoordination={pointLayerCoordination}
              pointMultiIndicesData={pointMultiIndicesData}
            />
          </div>
          {isMeshLoading ? (
            <Chip
              label="Loading meshes..."
              size="small"
              color="primary"
              className={classes.meshLoadingIndicator}
            />
          ) : null}

          <NeuroglancerComp
            classes={classes}
            onSegmentClick={onSegmentClick}
            onSelectHoveredCoords={onSegmentHighlight}
            viewerState={derivedViewerState}
            cellColorMapping={cellColorMappingByLayer}
            setViewerState={handleStateUpdate}
            onLayerLoadingChange={handleLayerLoadingChange}
            onAnnotationSourceReady={onAnnotationSourceReady}
            onViewerReady={(getFn) => { getViewProjectionMatRef.current = getFn; }}
            getMeshIdToCellId={meshId => meshIdToCellIdRef.current[meshId]}
            centroidAnnotationUrlsByLayerName={centroidAnnotationUrlsByLayerName}
            meshOpacityByLayer={meshOpacityByLayer}
          />
        </div>
      ) : null}
    </TitleInfo>

  );
}
