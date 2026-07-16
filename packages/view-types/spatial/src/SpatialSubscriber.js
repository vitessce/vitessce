import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';

// Returns true if ch and oc refer to the same channel.
// Matches by channelName first (stable string key), then by selection index (fallback).
function channelMatches(ch, oc) {
  if (ch.channelName && oc.channelName) return ch.channelName === oc.channelName;
  const chKey = ch.selection?.channel ?? ch.selection?.c;
  const ocKey = oc.selection?.channel ?? oc.selection?.c;
  return chKey !== undefined && chKey === ocKey;
}

// Merges channel/layer overrides from a captured or authored frame into the baseline.
//
// Two modes, detected by whether any override channel carries a `slider` property:
//
//   Full capture (slider present): the override IS the complete intended state.
//     - Use override channels as the definitive list (handles add/remove via LayerController).
//     - Merge baseline properties under override so format is preserved.
//     - Also applies color and slider from the captured state.
//
//   Sparse authored (no slider): only certain channels are called out.
//     - Start from baseline; apply visible (and color/slider if present) for matched channels.
//     - Channels in baseline but not override: kept unchanged.
//     - Channels in override but not baseline: appended (author added a new channel).
function mergeLayerVisibility(baseline, override) {
  if (!baseline || !override) return override ?? baseline;
  return baseline.map(layer => {
    const overrideLayer = override.find(l =>
      (layer.layerName && l.layerName && l.layerName === layer.layerName)
      || l.index === layer.index
    );
    if (!overrideLayer) return layer;

    if (!overrideLayer.channels) {
      return {
        ...layer,
        ...(overrideLayer.visible !== undefined && { visible: overrideLayer.visible }),
      };
    }

    const isFullCapture = overrideLayer.channels.some(oc => oc.slider !== undefined);
    const baselineChannels = layer.channels ?? [];

    let mergedChannels;
    if (isFullCapture) {
      // Override is the complete desired channel list — use it directly.
      // Baseline channel is merged under override so any extra baseline fields are preserved.
      mergedChannels = overrideLayer.channels.map(oc => {
        const baselineCh = baselineChannels.find(ch => channelMatches(ch, oc));
        return baselineCh ? { ...baselineCh, ...oc } : { ...oc };
      });
    } else {
      // Sparse authored: start from baseline, patch matched channels.
      const patched = baselineChannels.map(ch => {
        const overrideCh = overrideLayer.channels.find(oc => channelMatches(ch, oc));
        if (!overrideCh) return ch;
        return {
          ...ch,
          visible: overrideCh.visible ?? ch.visible,
          ...(overrideCh.color !== undefined && { color: overrideCh.color }),
          ...(overrideCh.slider !== undefined && { slider: overrideCh.slider }),
        };
      });
      // Append any override channels that weren't in the baseline.
      const extra = overrideLayer.channels.filter(
        oc => !baselineChannels.some(ch => channelMatches(ch, oc)),
      );
      mergedChannels = [...patched, ...extra];
    }

    return {
      ...layer,
      ...(overrideLayer.visible !== undefined && { visible: overrideLayer.visible }),
      channels: mergedChannels,
    };
  });
}
import { debounce } from 'lodash-es';
import {
  TitleInfo,
  useDeckCanvasSize, useReady, useUrls,
  useObsLocationsData,
  useObsSegmentationsData,
  useObsSetsData,
  useFeatureSelection,
  useImageData,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useNeighborhoodsData,
  useObsLabelsData,
  useMultiObsLabels,
  useUint8FeatureSelection,
  useExpressionValueGetter,
  useGetObsInfo,
  useInitialCoordination,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useAuxiliaryCoordination,
  useHasLoader,
  useExpandedFeatureLabelsMap,
  useViewConfigStoreApi,
} from '@vitessce/vit-s';
import {
  setObsSelection,
  mergeObsSets,
  colorArrayToString,
  getCellColors,
} from '@vitessce/sets-utils';
import { canLoadResolution } from '@vitessce/spatial-utils';
import { Legend } from '@vitessce/legend';
import { log } from '@vitessce/globals';
import { COMPONENT_COORDINATION_TYPES, ViewType, DataType, STATUS, ViewHelpMapping } from '@vitessce/constants-internal';
import { createPreviewLayer } from '@vitessce/gl';
import { Typography, makeStyles } from '@vitessce/styles';

const useStyles = makeStyles()(() => ({
  coordOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
    pointerEvents: 'none',
    zIndex: 10,
    background: 'rgba(0,0,0,0.45)',
    borderRadius: 3,
    padding: '1px 5px',
  },
}));
import Spatial from './Spatial.js';
import SpatialOptions from './SpatialOptions.js';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber.js';
import { makeSpatialSubtitle, getInitialSpatialTargets, HOVER_MODE } from './utils.js';

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
export function SpatialSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    observationsLabelOverride,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    theme,
    title = 'Spatial',
    disable3d,
    globalDisable3d,
    useFullResolutionImage = {},
    channelNamesVisible = false,
    helpText = ViewHelpMapping.SPATIAL,
    coordinatesVisible = false,
    logClickCoords = false,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

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
    spatialRotationX: rotationX,
    spatialRotationY: rotationY,
    spatialRotationZ: rotationZ,
    spatialRotationOrbit: rotationOrbit,
    spatialOrbitAxis: orbitAxis,
    spatialImageLayer: imageLayers,
    spatialSegmentationLayer: cellsLayer,
    spatialPointLayer: moleculesLayer,
    spatialNeighborhoodLayer: neighborhoodsLayer,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    moleculeHighlight,
    featureSelection: geneSelection,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    spatialAxisFixed,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
    tooltipsVisible,
    photometricInterpretation: photometricInterpretationFromCoordination,
    annotationFrames,
    annotationFrameIndex,
    annotationOverlayVisible,
    annotationTransitionDuration,
    annotationDiverged,
    annotationActiveTool,
    annotationCaptureViewStateTrigger,
    annotationSelectedShapeUid,
  }, {
    setAnnotationFrames,
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationOrbit: setRotationOrbit,
    setSpatialOrbitAxis: setOrbitAxis,
    setSpatialImageLayer: setRasterLayers,
    setSpatialSegmentationLayer: setCellsLayer,
    setSpatialPointLayer: setMoleculesLayer,
    setSpatialNeighborhoodLayer: setNeighborhoodsLayer,
    setAnnotationDiverged,
    setObsFilter: setCellFilter,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    setMoleculeHighlight,
    setSpatialAxisFixed,
    setFeatureValueColormap: setGeneExpressionColormap,
    setFeatureValueColormapRange: setGeneExpressionColormapRange,
    setTooltipsVisible,
    setSpatialPhysicalPixelSize,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL], coordinationScopes);

  const {
    spatialZoom: initialZoom,
    spatialTargetX: initialTargetX,
    spatialTargetY: initialTargetY,
    spatialTargetZ: initialTargetZ,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL], coordinationScopes,
  );

  const observationsLabel = observationsLabelOverride || obsType;

  const [
    {
      imageLayerCallbacks,
      segmentationLayerCallbacks,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );

  const use3d = imageLayers?.some(l => l.use3d);

  // Animated zoom/pan for frame transitions.
  // In deck.gl controlled mode we must feed interpolated values on every RAF
  // frame — setting transitionDuration in the viewState prop alone has no effect.
  // We keep local state for the animated position and drive it ourselves.
  // During normal panning we use the coordination values directly (no overhead).
  const [animZoom, setAnimZoom] = useState(zoom);
  const [animTargetX, setAnimTargetX] = useState(targetX);
  const [animTargetY, setAnimTargetY] = useState(targetY);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (annotationTransitionDuration <= 0) {
      // Keep animated state in sync with coordination space while not animating,
      // so the next frame transition always starts from the current actual position
      // rather than from stale mount-time values.
      if (zoom != null) setAnimZoom(zoom);
      if (targetX != null) setAnimTargetX(targetX);
      if (targetY != null) setAnimTargetY(targetY);
      return;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const startZoom = animZoom;
    const startX = animTargetX;
    const startY = animTargetY;
    const endZoom = zoom;
    const endX = targetX;
    const endY = targetY;
    const startTime = performance.now();
    const duration = annotationTransitionDuration;

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      // Cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      // Only interpolate when both endpoints are numbers — null means "not set"
      // and null arithmetic (null + 0 = 0) would silently move the view to origin.
      if (typeof startZoom === 'number' && typeof endZoom === 'number') {
        setAnimZoom(startZoom + (endZoom - startZoom) * ease);
      }
      if (typeof startX === 'number' && typeof endX === 'number') {
        setAnimTargetX(startX + (endX - startX) * ease);
      }
      if (typeof startY === 'number' && typeof endY === 'number') {
        setAnimTargetY(startY + (endY - startY) * ease);
      }
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, targetX, targetY, annotationTransitionDuration]);

  const effectiveZoom = annotationTransitionDuration > 0 ? animZoom : zoom;
  const effectiveTargetX = annotationTransitionDuration > 0 ? animTargetX : targetX;
  const effectiveTargetY = annotationTransitionDuration > 0 ? animTargetY : targetY;

  // Apply per-frame view state from the frame's viewStates[] entry for 'spatial',
  // falling back to the flat viewState for backward compatibility.
  // This is the same targetView + targetCoordinationValues pattern as shapes:
  // each view subscriber reads only the entry addressed to it.
  // spatialPointLayer and spatialNeighborhoodLayer are handled here (not via the
  // annotation controller) to avoid the scope initialization conflict that occurs
  // when a controller subscribes to a type set dynamically by a data hook.

  // Sync frames into a ref so the frame-apply effect reads the latest frames
  // without listing annotationFrames as a dep — which would cause the effect to
  // fire (and reset zoom) whenever a shape is added or view-state is captured.
  const annotationFramesRef = useRef(annotationFrames);
  annotationFramesRef.current = annotationFrames;

  const spatialDefaultsRef = useRef(null);

  useEffect(() => {
    const frames = annotationFramesRef.current;
    if (!frames) return;

    // Exit story: restore the pre-story baseline.
    if (annotationFrameIndex === null) {
      const d = spatialDefaultsRef.current;
      if (!d) return;
      if (d.spatialZoom != null) setZoom(d.spatialZoom);
      if (d.spatialTargetX != null) setTargetX(d.spatialTargetX);
      if (d.spatialTargetY != null) setTargetY(d.spatialTargetY);
      if (d.spatialTargetZ != null) setTargetZ(d.spatialTargetZ);
      if (d.spatialImageLayer !== undefined) setRasterLayers(d.spatialImageLayer);
      if (d.spatialSegmentationLayer !== undefined) setCellsLayer(d.spatialSegmentationLayer);
      if (d.spatialPointLayer !== undefined) setMoleculesLayer(d.spatialPointLayer);
      if (d.spatialNeighborhoodLayer !== undefined) setNeighborhoodsLayer(d.spatialNeighborhoodLayer);
      return;
    }

    const frame = frames[annotationFrameIndex];

    // Capture spatial baseline once, just before the first frame mutates anything.
    // Uses closure values (zoom, targetX, …) — only needed once and zoom/pan must
    // NOT be listed as deps (that would snap the view back on every pan/zoom).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (spatialDefaultsRef.current === null) {
      spatialDefaultsRef.current = {
        spatialZoom: zoom, spatialTargetX: targetX,
        spatialTargetY: targetY, spatialTargetZ: targetZ,
        spatialImageLayer: imageLayers,
        spatialSegmentationLayer: cellsLayer,
        spatialPointLayer: moleculesLayer,
        spatialNeighborhoodLayer: neighborhoodsLayer,
      };
    }
    const d = spatialDefaultsRef.current;

    // Find per-view entry: targetView === 'spatial'.
    const viewStateEntry = (frame?.viewStates ?? []).find(
      e => e.targetView === 'spatial',
    );
    // Fall back to flat viewState (backward compat)
    const vs = viewStateEntry ?? frame?.viewState ?? {};

    // Apply frame value if set, otherwise fall back to pre-story baseline.
    // This is safe now that annotationFrames is no longer a dep: the effect only
    // fires on navigation / recenter, never on shape-add or capture.
    const applyVal = (setter, key) => {
      const v = vs[key] !== undefined ? vs[key] : d?.[key];
      if (v !== undefined) setter(v);
    };
    applyVal(setZoom, 'spatialZoom');
    applyVal(setTargetX, 'spatialTargetX');
    applyVal(setTargetY, 'spatialTargetY');
    applyVal(setTargetZ, 'spatialTargetZ');
    applyVal(setCellsLayer, 'spatialSegmentationLayer');
    applyVal(setMoleculesLayer, 'spatialPointLayer');
    applyVal(setNeighborhoodsLayer, 'spatialNeighborhoodLayer');

    // spatialImageLayer: merge visibility overrides against the BASELINE config
    // so channel states are deterministic regardless of previous frame.
    if (vs.spatialImageLayer !== undefined) {
      setRasterLayers(mergeLayerVisibility(d?.spatialImageLayer, vs.spatialImageLayer));
    } else if (d?.spatialImageLayer !== undefined) {
      setRasterLayers(d.spatialImageLayer);
    }
  }, [
    annotationFrameIndex,
    // annotationTransitionDuration: included so Recenter (which sets it to 800
    // without changing annotationFrameIndex) still triggers re-apply.
    annotationTransitionDuration,
    setZoom, setTargetX, setTargetY, setTargetZ,
    setRasterLayers, setCellsLayer, setMoleculesLayer, setNeighborhoodsLayer,
  ]);

  // Filter annotation shapes to those that belong to the spatial view.
  // Shapes with no targetView default to 'spatial' for backwards compatibility.
  const activeShapes = useMemo(() => {
    if (!annotationOverlayVisible || !annotationFrames || annotationFrameIndex === null) return [];
    const frame = annotationFrames[annotationFrameIndex];
    return (frame?.shapes ?? []).filter(s => {
      if (s.visible === false) return false;
      return !s.targetView || s.targetView === 'spatial';
    });
  }, [annotationOverlayVisible, annotationFrames, annotationFrameIndex]);

  // ── Annotation drawing state ─────────────────────────────────────────────
  const [drawingVertices, setDrawingVertices] = useState([]);
  const [drawHoverCoord, setDrawHoverCoord] = useState(null);

  const appendAnnotationShape = useCallback((newShape) => {
    if (!annotationFrames || annotationFrameIndex === null) return;
    const updated = annotationFrames.map((f, idx) => (
      idx === annotationFrameIndex
        ? { ...f, shapes: [...(f.shapes ?? []), newShape] }
        : f
    ));
    setAnnotationFrames(updated);
  }, [annotationFrames, annotationFrameIndex, setAnnotationFrames]);

  const TWO_CLICK_TOOLS = ['rectangle', 'line', 'ellipse'];
  const lastAnnotationClickTimeRef = React.useRef(0);
  const DOUBLE_CLICK_MS = 350;

  const handleAnnotationClick = useCallback((coord) => {
    if (!annotationActiveTool || annotationFrameIndex === null) return;
    const tool = annotationActiveTool;

    if (TWO_CLICK_TOOLS.includes(tool)) {
      if (drawingVertices.length === 0) {
        setDrawingVertices([coord]);
      } else {
        const [ax, ay] = drawingVertices[0];
        const [bx, by] = coord;
        const uid = crypto.randomUUID();
        let shape;
        if (tool === 'rectangle') {
          shape = { uid, type: 'rectangle', x: Math.min(ax, bx), y: Math.min(ay, by), width: Math.abs(bx - ax), height: Math.abs(by - ay) };
        } else if (tool === 'line') {
          shape = { uid, type: 'line', x1: ax, y1: ay, x2: bx, y2: by };
        } else {
          shape = { uid, type: 'ellipse', x1: ax, y1: ay, radiusX: Math.abs(bx - ax), radiusY: Math.abs(by - ay) };
        }
        appendAnnotationShape(shape);
        setDrawingVertices([]);
        setDrawHoverCoord(null);
      }
    } else {
      // Multi-click tool: detect rapid successive clicks as a finish gesture.
      // Check timing BEFORE adding the vertex — if this click is within DOUBLE_CLICK_MS
      // of the previous one and we already have enough vertices, finish without adding this point.
      const now = Date.now();
      const elapsed = now - lastAnnotationClickTimeRef.current;
      lastAnnotationClickTimeRef.current = now;
      const minVerts = tool === 'polygon' ? 3 : 2;
      if (elapsed < DOUBLE_CLICK_MS && drawingVertices.length >= minVerts) {
        const uid = crypto.randomUUID();
        appendAnnotationShape({ uid, type: tool, points: drawingVertices });
        setDrawingVertices([]);
        setDrawHoverCoord(null);
        return;
      }
      setDrawingVertices(prev => [...prev, coord]);
    }
  }, [annotationActiveTool, annotationFrameIndex, drawingVertices, appendAnnotationShape]);

  const finishMultiClickShape = useCallback(() => {
    const tool = annotationActiveTool;
    if (!tool || TWO_CLICK_TOOLS.includes(tool)) return;
    const minVerts = tool === 'polygon' ? 3 : 2;
    if (drawingVertices.length < minVerts) return;
    const uid = crypto.randomUUID();
    appendAnnotationShape({ uid, type: tool, points: drawingVertices });
    setDrawingVertices([]);
    setDrawHoverCoord(null);
  }, [annotationActiveTool, drawingVertices, appendAnnotationShape]);


  // Reset drawing state when tool changes
  useEffect(() => {
    setDrawingVertices([]);
    setDrawHoverCoord(null);
  }, [annotationActiveTool]);

  // Keyboard: Enter to finish polygon/polyline, Escape to cancel.
  // Double-click: also finishes — but two single-click events fire first via deck.gl,
  // adding an extra vertex, so we trim it before finishing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') finishMultiClickShape();
      if (e.key === 'Escape') {
        setDrawingVertices([]);
        setDrawHoverCoord(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finishMultiClickShape]);


  const inProgress = annotationActiveTool && drawingVertices.length > 0
    ? { type: annotationActiveTool, vertices: drawingVertices }
    : null;
  const annotationPreviewLayer = createPreviewLayer(inProgress, drawHoverCoord);

  // ── View state capture (triggered by AnnotationController) ───────────────
  const storeApi = useViewConfigStoreApi();
  const spatialViewStateRef = useRef(null);
  useEffect(() => {
    spatialViewStateRef.current = { zoom, targetX, targetY, targetZ, imageLayers, cellsLayer, moleculesLayer, neighborhoodsLayer };
  });
  useEffect(() => {
    if (!annotationCaptureViewStateTrigger || annotationFrameIndex === null) return;
    const s = spatialViewStateRef.current;
    if (!s) return;
    // Read live frames from the store rather than the stale React-state closure,
    // so that sequential writes from sibling subscribers don't overwrite each other.
    const scope = coordinationScopes.annotationFrames;
    const currentFrames = storeApi.getState().viewConfig?.coordinationSpace?.annotationFrames?.[scope] ?? [];
    const entry = {
      targetView: 'spatial',
      spatialZoom: s.zoom,
      spatialTargetX: s.targetX,
      spatialTargetY: s.targetY,
      spatialTargetZ: s.targetZ,
      spatialImageLayer: s.imageLayers,
      spatialSegmentationLayer: s.cellsLayer,
      spatialPointLayer: s.moleculesLayer,
    };
    setAnnotationFrames(currentFrames.map((f, idx) => {
      if (idx !== annotationFrameIndex) return f;
      const filtered = (f.viewStates ?? []).filter(e => e.targetView !== 'spatial');
      return { ...f, viewStates: [...filtered, entry] };
    }));
  // annotationFrameIndex is intentionally excluded from deps: the trigger only
  // increments on a user click (fresh render → closure is current). Including it
  // would re-fire the capture on every navigation, silently overwriting the
  // destination frame's view state with the source frame's zoom.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotationCaptureViewStateTrigger]);
  // ── End view state capture ────────────────────────────────────────────────

  const [width, height, deckRef] = useDeckCanvasSize();

  const [
    // eslint-disable-next-line no-unused-vars
    obsLabelsTypes, obsLabelsData, obsLabelsStatusMulti, obsLabelsUrlsMulti, obsLabelsErrorsMulti,
  ] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  const hasExpressionData = useHasLoader(
    loaders, dataset, DataType.OBS_FEATURE_MATRIX,
    { obsType, featureType, featureValueType },
    // TODO: get per-spatialLayerType expression data once #1240 is merged.
  );
  const hasSegmentationsLoader = useHasLoader(
    loaders, dataset, DataType.OBS_SEGMENTATIONS,
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const hasLocationsData = useHasLoader(
    loaders, dataset, DataType.OBS_LOCATIONS,
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const hasImageData = useHasLoader(
    loaders, dataset, DataType.IMAGE,
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  // Get data from loaders using the data hooks.
  const [{
    obsIndex: obsLocationsIndex,
    obsLocations,
  }, obsLocationsStatus, obsLocationsUrls, obsLocationsError] = useObsLocationsData(
    loaders, dataset, false,
    { setSpatialPointLayer: setMoleculesLayer },
    { spatialPointLayer: moleculesLayer },
    { obsType: 'molecule' }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [{
    obsLabels: obsLocationsLabels,
  }, obsLabelsStatus, obsLabelsUrls, obsLabelsError] = useObsLabelsData(
    loaders, dataset, false, {}, {},
    { obsType: 'molecule' }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const [{
    obsIndex: obsCentroidsIndex,
    obsLocations: obsCentroids,
  }, obsCentroidsStatus, obsCentroidsUrls, obsCentroidsError] = useObsLocationsData(
    loaders, dataset, false, {}, {},
    { obsType }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [
    {
      obsIndex: obsSegmentationsIndex,
      obsSegmentations,
      obsSegmentationsType,
    },
    obsSegmentationsStatus,
    obsSegmentationsUrls,
    obsSegmentationsError,
  ] = useObsSegmentationsData(
    loaders, dataset, false,
    { setSpatialSegmentationLayer: setCellsLayer },
    { spatialSegmentationLayer: cellsLayer },
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  // In the case of obsSegmentations.raster.json files that have been
  // auto-upgraded from raster.json in older config versions,
  // it is possible to have an obsSegmentations file type in the dataset,
  // but one that returns `null` if all of the raster layers end up being
  // images rather than segmentation bitmasks.
  const hasSegmentationsData = hasSegmentationsLoader && !(
    obsSegmentationsStatus === STATUS.SUCCESS
    && !(obsSegmentations || obsSegmentationsType)
  );
  const [
    { obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls, obsSetsError,
  ] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );

  const [
    // eslint-disable-next-line no-unused-vars
    expressionData, loadedFeatureSelection, featureSelectionStatus, featureSelectionErrors,
  ] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  const [
    { obsIndex: matrixObsIndex }, matrixIndicesStatus, matrixIndicesUrls, matrixIndicesError,
  ] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [{ image }, imageStatus, imageUrls, imageError] = useImageData(
    loaders, dataset, false,
    { setSpatialImageLayer: setRasterLayers },
    { spatialImageLayer: imageLayers },
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  const { loaders: imageLayerLoaders = [], meta = [], instance } = image || {};

  const physicalPixelSize = useMemo(() => {
    const source = imageLayerLoaders?.[0]?.data?.[0];
    const ps = source?.meta?.physicalSizes;
    return (ps?.x?.size && ps?.y?.size)
      ? { x: ps.x.size, y: ps.y.size, unit: ps.x.unit ?? '' }
      : null;
  }, [image]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (physicalPixelSize) {
      setSpatialPhysicalPixelSize(physicalPixelSize);
    }
  }, [physicalPixelSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const [
    neighborhoods, neighborhoodsStatus, neighborhoodsUrls, neighborhoodsError,
  ] = useNeighborhoodsData(
    loaders, dataset, false,
    { setSpatialNeighborhoodLayer: setNeighborhoodsLayer },
    { spatialNeighborhoodLayer: neighborhoodsLayer },
  );
  const [
    { featureLabelsMap: featureLabelsMapOrig },
    featureLabelsStatus,
    featureLabelsUrls,
    featureLabelsError,
  ] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [featureLabelsMap, expandedFeatureLabelsStatus] = useExpandedFeatureLabelsMap(
    featureType, featureLabelsMapOrig, { stripCuriePrefixes: true },
  );

  const errors = [
    ...obsLabelsErrorsMulti,
    obsLocationsError,
    obsLabelsError,
    obsCentroidsError,
    obsSegmentationsError,
    obsSetsError,
    ...featureSelectionErrors,
    matrixIndicesError,
    imageError,
    neighborhoodsError,
    featureLabelsError,
  ];

  const photometricInterpretation = (
    photometricInterpretationFromCoordination
    ?? instance?.getPhotometricInterpretation()
  );


  const isReady = useReady([
    obsLocationsStatus,
    obsLabelsStatus,
    obsCentroidsStatus,
    obsSegmentationsStatus,
    obsSetsStatus,
    featureSelectionStatus,
    matrixIndicesStatus,
    imageStatus,
    neighborhoodsStatus,
    featureLabelsStatus,
    expandedFeatureLabelsStatus,
  ]);
  const urls = useUrls([
    obsLocationsUrls,
    obsLabelsUrls,
    obsCentroidsUrls,
    obsSegmentationsUrls,
    obsSetsUrls,
    matrixIndicesUrls,
    imageUrls,
    neighborhoodsUrls,
    featureLabelsUrls,
  ]);

  const obsLocationsFeatureIndex = useMemo(() => {
    if (obsLocationsLabels) {
      return Array.from(new Set(obsLocationsLabels));
    }
    return null;
  }, [obsLocationsLabels]);
  const moleculesCount = obsLocationsFeatureIndex?.length || 0;
  const locationsCount = obsLocationsIndex?.length || 0;

  const [originalViewState, setOriginalViewState] = useState(null);

  // Compute initial viewState values to use if targetX and targetY are not
  // defined in the initial configuration.
  const {
    initialTargetX: defaultTargetX, initialTargetY: defaultTargetY,
    initialTargetZ: defaultTargetZ, initialZoom: defaultZoom,
  } = useMemo(() => getInitialSpatialTargets({
    width,
    height,
    obsCentroids,
    obsSegmentations,
    obsSegmentationsType,
    // TODO: use obsLocations (molecules) here too.
    imageLayerLoaders,
    useRaster: Boolean(hasImageData),
    use3d,
    modelMatrices: meta.map(({ metadata }) => metadata?.transform?.matrix),
  }),
  // Deliberate dependency omissions: imageLayerLoaders and meta - using `image` as
  // an indirect dependency instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [image, use3d, hasImageData, obsCentroids, obsSegmentations, obsSegmentationsType,
    width, height,
  ]);

  useEffect(() => {
    // If it has not already been set, set the initial view state using
    // the auto-computed values from the useMemo above.
    if (typeof initialTargetX !== 'number' || typeof initialTargetY !== 'number') {
      const notYetInitialized = (typeof targetX !== 'number' || typeof targetY !== 'number');
      const stillDefaultInitialized = (targetX === defaultTargetX && targetY === defaultTargetY);
      if (notYetInitialized || stillDefaultInitialized) {
        setTargetX(defaultTargetX);
        setTargetY(defaultTargetY);
        setTargetZ(defaultTargetZ);
        setZoom(defaultZoom);
      }
      setOriginalViewState(
        { target: [defaultTargetX, defaultTargetY, defaultTargetZ], zoom: defaultZoom },
      );
    } else if (!originalViewState) {
      // originalViewState has not yet been set and
      // the view config defined an initial viewState.
      setOriginalViewState({
        target: [initialTargetX, initialTargetY, initialTargetZ], zoom: initialZoom,
      });
    }
    // Deliberate dependency omissions: targetX, targetY
    // since we do not this to re-run on every single zoom/pan interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTargetX, defaultTargetY, defaultTargetZ, defaultZoom,
    initialTargetX, initialTargetY, initialTargetZ, initialZoom,
  ]);

  const mergedCellSets = useMemo(() => mergeObsSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const setCellSelectionProp = useCallback((v) => {
    setObsSelection(
      v, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
    );
  }, [additionalCellSets, cellSetColor, setCellColorEncoding,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection]);

  const cellColors = useMemo(() => getCellColors({
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex: matrixObsIndex,
    theme,
  }), [mergedCellSets, theme,
    cellSetColor, cellSetSelection, matrixObsIndex]);

  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const getObsInfo = useGetObsInfo(
    observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  );

  const getTooltipObsInfo = useCallback((tooltipObsId, tooltipObsType) => {
    if (tooltipObsType === HOVER_MODE.MOLECULE_LAYER) {
      // TODO: Augment getObsInfo to work with molecule obsTypes and obsLocationsLabels.
      return {
        'Molecule ID': tooltipObsId,
        'Molecule Name': obsLocationsLabels[tooltipObsId],
      };
    }
    return getObsInfo(tooltipObsId);
  }, [getObsInfo, obsLocationsLabels]);

  const [hoverCoords, setHoverCoords] = useState(null);
  const onCoordHover = useCallback((coord) => {
    if (coordinatesVisible) setHoverCoords(coord);
    if (annotationActiveTool) setDrawHoverCoord(coord);
  }, [coordinatesVisible, annotationActiveTool]);
  const onCoordClick = useCallback((coord) => {
    if (annotationActiveTool) {
      handleAnnotationClick(coord);
      return;
    }
    if (logClickCoords) {
      // eslint-disable-next-line no-console
      console.log(
        `[Vitessce] spatial`
        + `  click: x=${coord[0].toFixed(2)}, y=${coord[1].toFixed(2)}`
        + `  zoom: ${zoom?.toFixed(3) ?? 'null'}`
        + `  center: x=${targetX?.toFixed(2) ?? 'null'}, y=${targetY?.toFixed(2) ?? 'null'}`,
      );
    }
  }, [annotationActiveTool, handleAnnotationClick, logClickCoords, zoom, targetX, targetY]);

  const [hoverData, setHoverData] = useState(null);
  const [hoverCoord, setHoverCoord] = useState(null);
  const [hoverMode, setHoverMode] = useState(null);

  // Should hover position be used for tooltips?
  // If there are centroids for each observation, then we can use those
  // to position tooltips. However if there are not centroids,
  // the other option is to use the mouse location.
  const useHoverInfoForTooltip = !obsCentroids;

  const setHoverInfo = useCallback(debounce((data, coord, hoveredMode) => {
    setHoverData(data);
    setHoverCoord(coord);
    setHoverMode(hoveredMode);
  }, 10, { trailing: true }),
  [setHoverData, setHoverCoord, setHoverMode]);

  const getObsIdFromHoverData = useCallback((data) => {
    if (data) {
      // TODO: When there is support for multiple segmentation channels that may
      // contain different obsTypes, then do not hard-code the zeroth channel.
      const spatialTargetC = 0;
      const obsId = data?.[spatialTargetC];
      return obsId;
    }
    return null;
  }, [useHoverInfoForTooltip]);

  const setViewState = ({
    zoom: newZoom,
    target,
    rotationX: newRotationX,
    rotationOrbit: newRotationOrbit,
    orbitAxis: newOrbitAxis,
  }) => {
    // Suppress coordination updates during annotation frame transitions so
    // deck.gl can animate unimpeded — intermediate viewState values from
    // onViewStateChange would otherwise fight the animation.
    if (annotationTransitionDuration > 0) return;
    // If the user pans/zooms while a frame is active, mark as diverged
    // so the annotation controller can show the indicator.
    if (annotationFrameIndex !== null) setAnnotationDiverged(true);
    setZoom(newZoom);
    setTargetX(target[0]);
    setTargetY(target[1]);
    setTargetZ(target[2] || null);
    setRotationX(newRotationX);
    setRotationOrbit(newRotationOrbit);
    setOrbitAxis(newOrbitAxis || null);
  };

  const subtitle = makeSpatialSubtitle({
    observationsCount: obsSegmentationsIndex?.length || matrixObsIndex?.length,
    observationsLabel,
    subobservationsCount: moleculesCount,
    subobservationsLabel,
    locationsCount,
  });

  const {
    normData: uint8ExpressionData,
    extents: expressionExtents,
  } = useUint8FeatureSelection(expressionData);

  // The bitmask layer needs access to a array (i.e a texture) lookup of cell -> expression value
  // where each cell id indexes into the array.
  // Cell ids in `attrs.rows` do not necessaryily correspond to indices in that array, though,
  // so we create a "shifted" array where this is the case.
  const shiftedExpressionDataForBitmask = useMemo(() => {
    if (matrixObsIndex && uint8ExpressionData && obsSegmentationsType === 'bitmask') {
      const maxId = matrixObsIndex.reduce((max, curr) => Math.max(max, Number(curr)));
      const result = new Uint8Array(maxId + 1);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < matrixObsIndex.length; i++) {
        const id = matrixObsIndex[i];
        result.set(uint8ExpressionData[0].slice(i, i + 1), Number(id));
      }
      return [result];
    } return [new Uint8Array()];
  }, [matrixObsIndex, uint8ExpressionData, obsSegmentationsType]);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({
    // eslint-disable-next-line no-unneeded-ternary
    instanceObsIndex: (obsSegmentationsIndex
      // When there are polygon cell segmentations.
      ? obsSegmentationsIndex
      // When there are not polygon cell segmentations, and we need to make fake diamonds.
      : obsCentroidsIndex
    ),
    matrixObsIndex,
    expressionData: uint8ExpressionData,
  });
  const canLoad3DLayers = imageLayerLoaders.some(loader => Boolean(
    Array.from({
      length: loader.data.length,
    }).filter((_, res) => canLoadResolution(loader.data, res)).length,
  ));
  // Only show 3D options if we can theoretically load the data and it is allowed to be loaded.
  const canShow3DOptions = canLoad3DLayers
    && !(disable3d?.length === imageLayerLoaders.length) && !globalDisable3d;

  const options = useMemo(() => {
    // Only show button if there is expression or 3D data because only cells data
    // does not have any options (i.e for color encoding, you need to switch to expression data)
    if (canShow3DOptions || hasExpressionData) {
      return (
        <SpatialOptions
          observationsLabel={observationsLabel}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
          setSpatialAxisFixed={setSpatialAxisFixed}
          spatialAxisFixed={spatialAxisFixed}
          use3d={use3d}
          tooltipsVisible={tooltipsVisible}
          setTooltipsVisible={setTooltipsVisible}
          geneExpressionColormap={geneExpressionColormap}
          setGeneExpressionColormap={setGeneExpressionColormap}
          geneExpressionColormapRange={geneExpressionColormapRange}
          setGeneExpressionColormapRange={setGeneExpressionColormapRange}
          canShowExpressionOptions={hasExpressionData}
          canShowColorEncodingOption={
            (hasLocationsData || hasSegmentationsData) && hasExpressionData
          }
          canShow3DOptions={canShow3DOptions}
        />
      );
    }
    return null;
  }, [canShow3DOptions, cellColorEncoding, geneExpressionColormap,
    geneExpressionColormapRange, setGeneExpressionColormap,
    hasLocationsData, hasSegmentationsData, hasExpressionData,
    observationsLabel, setCellColorEncoding,
    setGeneExpressionColormapRange, setSpatialAxisFixed, spatialAxisFixed, use3d,
    tooltipsVisible, setTooltipsVisible,
  ]);

  useEffect(() => {
    // For backwards compatibility (diamond case).
    // Log to the console to alert the user that the auto-generated diamonds are being used.
    if (!hasSegmentationsData
      && cellsLayer && !obsSegmentations && !obsSegmentationsIndex
      && obsCentroids && obsCentroidsIndex
    ) {
      log.warn('Rendering cell segmentation diamonds for backwards compatibility.');
    }
  }, [hasSegmentationsData, cellsLayer, obsSegmentations, obsSegmentationsIndex,
    obsCentroids, obsCentroidsIndex,
  ]);

  // Without useMemo, this would propagate a change every time the component
  // re - renders as opposed to when it has to.
  const resolutionFilteredImageLayerLoaders = useMemo(() => {
    // eslint-disable-next-line max-len
    const shouldUseFullData = (ll, index) => Array.isArray(useFullResolutionImage) && useFullResolutionImage.includes(meta[index].name) && Array.isArray(ll.data);
    // eslint-disable-next-line max-len
    return imageLayerLoaders.map((ll, index) => (shouldUseFullData(ll, index) ? { ...ll, data: ll.data[0] } : ll));
  }, [imageLayerLoaders, useFullResolutionImage, meta]);

  const [channelNames, channelColors] = useMemo(() => {
    let names = [];
    let colors = [];

    if (
      imageLayers && imageLayers.length > 0
      && imageLayerLoaders && imageLayerLoaders.length > 0
    ) {
      const firstImageLayer = imageLayers[0];
      const firstImageLayerLoader = imageLayerLoaders?.[firstImageLayer?.index];
      if (
        firstImageLayer && !firstImageLayer.colormap && firstImageLayer.channels
        && firstImageLayerLoader
      ) {
        const allChannels = firstImageLayerLoader.channels;
        // Bioformats-Zarr uses selection.channel but OME-TIFF and OME-Zarr use selection.c
        names = firstImageLayer.channels
          .map(c => allChannels[
            c.selection.channel === undefined ? c.selection.c : c.selection.channel
          ]);
        colors = firstImageLayer
          .channels.map(c => c.color);
      }
    }

    return [names, colors];
  }, [imageLayers, imageLayerLoaders]);

  return (
    <TitleInfo
      title={title}
      info={subtitle}
      isSpatial
      urls={urls}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      options={options}
      helpText={helpText}
      errors={errors}
    >
      <div style={{
        position: 'absolute',
        bottom: '5px',
        left: '5px',
        zIndex: 6,
      }}
      >
        {channelNamesVisible && channelNames ? channelNames.map((name, i) => (
          <Typography
            variant="h6"
            key={`${name}-${colorArrayToString(channelColors[i])}`}
            style={{
              color: colorArrayToString(channelColors[i]),
              fontSize: '14px',
            }}
          >
            {name}
          </Typography>
        )) : null}
      </div>
      <Spatial
        ref={deckRef}
        uuid={uuid}
        width={width}
        height={height}
        viewState={{
          zoom: effectiveZoom,
          target: [effectiveTargetX, effectiveTargetY, targetZ],
          rotationX,
          rotationY,
          rotationZ,
          rotationOrbit,
          orbitAxis,
        }}
        setViewState={setViewState}
        originalViewState={originalViewState}
        imageLayerDefs={imageLayers}
        obsSegmentationsLayerDefs={cellsLayer}
        obsLocationsLayerDefs={moleculesLayer}
        neighborhoodLayerDefs={neighborhoodsLayer}
        obsLocationsIndex={obsLocationsIndex}
        obsSegmentationsIndex={obsSegmentationsIndex}
        obsLocations={obsLocations}
        obsLocationsLabels={obsLocationsLabels}
        obsLocationsFeatureIndex={obsLocationsFeatureIndex}
        hasSegmentations={hasSegmentationsData}
        obsSegmentations={obsSegmentations}
        obsSegmentationsType={obsSegmentationsType}
        obsCentroids={obsCentroids}
        obsCentroidsIndex={obsCentroidsIndex}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}
        neighborhoods={neighborhoods}
        imageLayerLoaders={resolutionFilteredImageLayerLoaders}
        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        setCellHighlight={setCellHighlight}
        setHoverInfo={setHoverInfo}
        setMoleculeHighlight={setMoleculeHighlight}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        imageLayerCallbacks={imageLayerCallbacks}
        segmentationLayerCallbacks={segmentationLayerCallbacks}
        spatialAxisFixed={spatialAxisFixed}
        geneExpressionColormap={geneExpressionColormap}
        geneExpressionColormapRange={geneExpressionColormapRange}
        expressionData={shiftedExpressionDataForBitmask}
        cellColorEncoding={cellColorEncoding}
        getExpressionValue={getExpressionValue}
        theme={theme}
        useFullResolutionImage={useFullResolutionImage}
        photometricInterpretation={photometricInterpretation}
        annotationShapes={activeShapes}
        annotationActiveTool={annotationActiveTool}
        annotationPreviewLayer={annotationPreviewLayer}
        annotationSelectedShapeUid={annotationSelectedShapeUid}
        physicalPixelSize={physicalPixelSize}
        onCoordHover={onCoordHover}
        onCoordClick={onCoordClick}
      />
      {coordinatesVisible && hoverCoords && (
        <div className={classes.coordOverlay}>
          {`x: ${hoverCoords[0].toFixed(2)}  y: ${hoverCoords[1].toFixed(2)}`}
        </div>
      )}
      {tooltipsVisible && (
        <SpatialTooltipSubscriber
          parentUuid={uuid}
          obsHighlight={cellHighlight || moleculeHighlight}
          width={width}
          height={height}
          getObsInfo={getTooltipObsInfo}
          useHoverInfoForTooltip={useHoverInfoForTooltip}
          hoverData={hoverData}
          hoverCoord={hoverCoord}
          hoverMode={hoverMode}
          getObsIdFromHoverData={getObsIdFromHoverData}
          featureType={featureType}
          featureLabelsMap={featureLabelsMap}
        />
      )}
      <Legend
        visible
        // Fix to dark theme due to black background of spatial plot.
        theme="dark"
        featureType={featureType}
        featureValueType={featureValueType}
        obsColorEncoding={cellColorEncoding}
        obsSetSelection={cellSetSelection}
        featureSelection={geneSelection}
        featureLabelsMap={featureLabelsMap}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
        setFeatureValueColormapRange={setGeneExpressionColormapRange}
        extent={expressionExtents?.[0]}
      />
    </TitleInfo>
  );
}
