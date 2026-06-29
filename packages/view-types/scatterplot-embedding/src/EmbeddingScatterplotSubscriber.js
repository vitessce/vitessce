import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from 'react';
import { extent, quantileSorted } from 'd3-array';
import { isEqual } from 'lodash-es';
import { circle } from '@turf/circle';
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
  useCoordinationScopes,
  useViewConfigStoreApi,
} from '@vitessce/vit-s';
import {
  setObsSelection, mergeObsSets, getCellSetPolygons, getCellColors,
  stratifyArrays,
} from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber, aggregateFeatureArrays } from '@vitessce/utils';
import {
  Scatterplot, ScatterplotTooltipSubscriber, ScatterplotOptions,
  getPointSizeDevicePixels,
  getPointOpacity,
} from '@vitessce/scatterplot';
import { Legend } from '@vitessce/legend';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { makeStyles } from '@vitessce/styles';
import { createPreviewLayer } from '@vitessce/gl';
import { DEFAULT_CONTOUR_PERCENTILES } from './constants.js';

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

const DEFAULT_FEATURE_AGGREGATION_STRATEGY = 'first';

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
    coordinationScopes: coordinationScopesRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    observationsLabelOverride,
    title: titleOverride,
    helpText = ViewHelpMapping.SCATTERPLOT,
    coordinatesVisible = false,
    logClickCoords = false,
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,
    // For the dual scatterplot:
    sampleSetSelection: sampleSetSelectionFromProps,
    // Circle scale factor:
    circleScaleFactor = 0.8,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    sampleType,
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    embeddingType: mapping,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    featureSelection: geneSelection,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    embeddingObsSetPolygonsVisible: cellSetPolygonsVisible,
    embeddingObsSetLabelsVisible: cellSetLabelsVisible,
    embeddingObsSetLabelSize: cellSetLabelSize,
    embeddingObsRadius: cellRadiusFixed,
    embeddingObsRadiusMode: cellRadiusMode,
    embeddingObsOpacity: cellOpacityFixed,
    embeddingObsOpacityMode: cellOpacityMode,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
    tooltipsVisible,
    sampleSetSelection: sampleSetSelectionFromCoordination,
    sampleSetColor,
    embeddingPointsVisible,
    embeddingContoursVisible,
    embeddingContoursFilled,
    embeddingContourPercentiles: contourPercentiles,
    contourColorEncoding,
    contourColor,
    featureAggregationStrategy,
    annotationFrames,
    annotationFrameIndex,
    annotationOverlayVisible,
    annotationTransitionDuration,
    annotationActiveTool,
    annotationCaptureViewStateTrigger,
    annotationSelectedShapeUid,
  }, {
    setEmbeddingZoom: setZoom,
    setAnnotationDiverged,
    setAnnotationFrames,
    setEmbeddingTargetX: setTargetX,
    setEmbeddingTargetY: setTargetY,
    setEmbeddingTargetZ: setTargetZ,
    setObsFilter: setCellFilter,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    setEmbeddingObsSetPolygonsVisible: setCellSetPolygonsVisible,
    setEmbeddingObsSetLabelsVisible: setCellSetLabelsVisible,
    setEmbeddingObsSetLabelSize: setCellSetLabelSize,
    setEmbeddingObsRadius: setCellRadiusFixed,
    setEmbeddingObsRadiusMode: setCellRadiusMode,
    setEmbeddingObsOpacity: setCellOpacityFixed,
    setEmbeddingObsOpacityMode: setCellOpacityMode,
    setFeatureValueColormap: setGeneExpressionColormap,
    setFeatureValueColormapRange: setGeneExpressionColormapRange,
    setTooltipsVisible,
    setEmbeddingPointsVisible,
    setEmbeddingContoursVisible,
    setEmbeddingContoursFilled,
    setEmbeddingContourPercentiles: setContourPercentiles,
    setContourColorEncoding,
    setFeatureAggregationStrategy,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT], coordinationScopes);

  const {
    embeddingZoom: initialZoom,
    embeddingTargetX: initialTargetX,
    embeddingTargetY: initialTargetY,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT], coordinationScopes,
  );

  // Filter annotation shapes to those targeting this specific scatterplot instance.
  // `mapping` (embeddingType) disambiguates UMAP vs PCA vs tSNE scatterplots.
  const activeShapes = useMemo(() => {
    if (!annotationOverlayVisible || !annotationFrames || annotationFrameIndex === null) return [];
    const frame = annotationFrames[annotationFrameIndex];
    return (frame?.shapes ?? []).filter(s => {
      if (s.visible === false) return false;
      if (s.targetView !== 'scatterplot') return false;
      const tcv = s.targetCoordinationValues ?? {};
      if (tcv.embeddingType && tcv.embeddingType !== mapping) return false;
      return true;
    });
  }, [annotationOverlayVisible, annotationFrames, annotationFrameIndex, mapping]);

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
          shape = { uid, type: 'rectangle', x: Math.min(ax, bx), y: Math.min(ay, by), width: Math.abs(bx - ax), height: Math.abs(by - ay), targetView: 'scatterplot', targetCoordinationValues: { embeddingType: mapping } };
        } else if (tool === 'line') {
          shape = { uid, type: 'line', x1: ax, y1: ay, x2: bx, y2: by, targetView: 'scatterplot', targetCoordinationValues: { embeddingType: mapping } };
        } else {
          shape = { uid, type: 'ellipse', x1: ax, y1: ay, radiusX: Math.abs(bx - ax), radiusY: Math.abs(by - ay), targetView: 'scatterplot', targetCoordinationValues: { embeddingType: mapping } };
        }
        appendAnnotationShape(shape);
        setDrawingVertices([]);
        setDrawHoverCoord(null);
      }
    } else {
      const now = Date.now();
      const elapsed = now - lastAnnotationClickTimeRef.current;
      lastAnnotationClickTimeRef.current = now;
      const minVerts = tool === 'polygon' ? 3 : 2;
      if (elapsed < DOUBLE_CLICK_MS && drawingVertices.length >= minVerts) {
        const uid = crypto.randomUUID();
        appendAnnotationShape({ uid, type: tool, points: drawingVertices, targetView: 'scatterplot', targetCoordinationValues: { embeddingType: mapping } });
        setDrawingVertices([]);
        setDrawHoverCoord(null);
        return;
      }
      setDrawingVertices(prev => [...prev, coord]);
    }
  }, [annotationActiveTool, annotationFrameIndex, drawingVertices, appendAnnotationShape, mapping]);

  const finishMultiClickShape = useCallback(() => {
    const tool = annotationActiveTool;
    if (!tool || TWO_CLICK_TOOLS.includes(tool)) return;
    const minVerts = tool === 'polygon' ? 3 : 2;
    if (drawingVertices.length < minVerts) return;
    const uid = crypto.randomUUID();
    appendAnnotationShape({ uid, type: tool, points: drawingVertices, targetView: 'scatterplot', targetCoordinationValues: { embeddingType: mapping } });
    setDrawingVertices([]);
    setDrawHoverCoord(null);
  }, [annotationActiveTool, drawingVertices, appendAnnotationShape, mapping]);


  useEffect(() => {
    setDrawingVertices([]);
    setDrawHoverCoord(null);
  }, [annotationActiveTool]);

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
  // ── End annotation drawing state ─────────────────────────────────────────

  // ── View state capture (triggered by AnnotationController) ───────────────
  const storeApi = useViewConfigStoreApi();
  const embeddingViewStateRef = useRef(null);
  useEffect(() => {
    embeddingViewStateRef.current = { zoom, targetX, targetY };
  });
  useEffect(() => {
    if (!annotationCaptureViewStateTrigger || annotationFrameIndex === null) return;
    const s = embeddingViewStateRef.current;
    if (!s) return;
    // Read live frames from the store to avoid stale-closure overwrites when
    // multiple scatterplot subscribers write in the same effect flush.
    const scope = coordinationScopes.annotationFrames;
    const currentFrames = storeApi.getState().viewConfig?.coordinationSpace?.annotationFrames?.[scope] ?? [];
    const entry = {
      targetView: 'scatterplot',
      targetCoordinationValues: { embeddingType: mapping },
      embeddingZoom: s.zoom,
      embeddingTargetX: s.targetX,
      embeddingTargetY: s.targetY,
    };
    setAnnotationFrames(currentFrames.map((f, idx) => {
      if (idx !== annotationFrameIndex) return f;
      const filtered = (f.viewStates ?? []).filter(e => !(
        e.targetView === 'scatterplot'
        && (e.targetCoordinationValues?.embeddingType ?? null) === mapping
      ));
      return { ...f, viewStates: [...filtered, entry] };
    }));
  // annotationFrameIndex and mapping are intentionally excluded from deps: the
  // trigger only increments on a user click (fresh render → closures are current).
  // Including them would re-fire the capture on every navigation, silently
  // overwriting the destination frame with the source frame's zoom.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotationCaptureViewStateTrigger]);
  // ── End view state capture ────────────────────────────────────────────────

  // Apply per-frame embedding view state from the frame's viewStates[] entry.
  // Matching uses targetView === 'scatterplot' AND targetCoordinationValues.embeddingType
  // === mapping, so a UMAP entry applies only to the UMAP panel and a PCA entry
  // applies only to the PCA panel — independently, without any extra coordination types.

  // Sync frames into a ref so the effect does not list annotationFrames as a dep —
  // that would cause zoom to snap back every time a shape is added or captured.
  const annotationFramesEmbedRef = useRef(annotationFrames);
  annotationFramesEmbedRef.current = annotationFrames;

  const embeddingDefaultsRef = useRef(null);

  useEffect(() => {
    const frames = annotationFramesEmbedRef.current;
    if (!frames) return;

    // Exit story: restore the pre-story embedding baseline.
    if (annotationFrameIndex === null) {
      const d = embeddingDefaultsRef.current;
      if (!d) return;
      if (d.embeddingZoom != null) setZoom(d.embeddingZoom);
      if (d.embeddingTargetX != null) setTargetX(d.embeddingTargetX);
      if (d.embeddingTargetY != null) setTargetY(d.embeddingTargetY);
      return;
    }

    const frame = frames[annotationFrameIndex];

    // Capture baseline once (closure values — only read once, must not be in deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (embeddingDefaultsRef.current === null) {
      embeddingDefaultsRef.current = {
        embeddingZoom: zoom, embeddingTargetX: targetX, embeddingTargetY: targetY,
      };
    }

    // Find the viewStates entry addressed to this specific scatterplot instance.
    const viewStateEntry = (frame?.viewStates ?? []).find(e => {
      if (e.targetView !== 'scatterplot') return false;
      const tcv = e.targetCoordinationValues ?? {};
      if (tcv.embeddingType && tcv.embeddingType !== mapping) return false;
      return true;
    });
    // Fall back to flat viewState (backward compat)
    const vs = viewStateEntry ?? frame?.viewState ?? {};

    // Apply frame value or fall back to pre-story baseline.
    // Safe because annotationFrames is no longer a dep — only navigation/recenter
    // triggers this effect, never shape-add or capture.
    const d = embeddingDefaultsRef.current;
    const applyVal = (setter, key) => {
      const v = vs[key] !== undefined ? vs[key] : d?.[key];
      if (v !== undefined) setter(v);
    };
    applyVal(setZoom, 'embeddingZoom');
    applyVal(setTargetX, 'embeddingTargetX');
    applyVal(setTargetY, 'embeddingTargetY');
  }, [
    annotationFrameIndex, mapping,
    annotationTransitionDuration,
    setZoom, setTargetX, setTargetY,
  ]);

  // Animated embedding zoom/pan — same RAF-driven approach as SpatialSubscriber.
  const [animZoom, setAnimZoom] = useState(zoom);
  const [animTargetX, setAnimTargetX] = useState(targetX);
  const [animTargetY, setAnimTargetY] = useState(targetY);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (annotationTransitionDuration <= 0) {
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

  const observationsLabel = observationsLabelOverride || obsType;
  const sampleSetSelection = (
    sampleSetSelectionFromProps
    || sampleSetSelectionFromCoordination
  );

  const featureAggregationStrategyToUse = featureAggregationStrategy
    ?? DEFAULT_FEATURE_AGGREGATION_STRATEGY;

  const [width, height, deckRef] = useDeckCanvasSize();

  const title = titleOverride || `Scatterplot (${mapping})`;

  const [
    // eslint-disable-next-line no-unused-vars
    obsLabelsTypes, obsLabelsData, obsLabelsStatus, obsLabelsUrls, obsLabelsErrors,
  ] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  // Get data from loaders using the data hooks.
  const [
    { obsIndex: obsEmbeddingIndex, obsEmbedding },
    obsEmbeddingStatus,
    obsEmbeddingUrls,
    obsEmbeddingError,
  ] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );
  const cellsCount = obsEmbeddingIndex?.length || 0;
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

  const [{ sampleSets }, sampleSetsStatus, sampleSetsUrl, sampleSetsError] = useSampleSetsData(
    loaders, dataset, false, {}, {},
    { sampleType },
  );

  const [{ sampleEdges }, sampleEdgesStatus, sampleEdgesUrl, sampleEdgesError] = useSampleEdgesData(
    loaders, dataset, false, {}, {},
    { obsType, sampleType },
  );

  const errors = [
    ...obsLabelsErrors,
    obsEmbeddingError,
    obsSetsError,
    ...featureSelectionErrors,
    matrixIndicesError,
    featureLabelsError,
    sampleSetsError,
    sampleEdgesError,
  ];

  const isReady = useReady([
    obsEmbeddingStatus,
    obsSetsStatus,
    featureSelectionStatus,
    featureLabelsStatus,
    expandedFeatureLabelsStatus,
    matrixIndicesStatus,
    sampleSetsStatus,
    sampleEdgesStatus,
  ]);
  const urls = useUrls([
    obsEmbeddingUrls,
    obsSetsUrls,
    matrixIndicesUrls,
    featureLabelsUrls,
    sampleSetsUrl,
    sampleEdgesUrl,
  ]);

  const [dynamicCellRadius, setDynamicCellRadius] = useState(cellRadiusFixed);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(cellOpacityFixed);

  const [originalViewState, setOriginalViewState] = useState(null);
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
        `[Vitessce] ${mapping}`
        + `  click: x=${coord[0].toFixed(4)}, y=${coord[1].toFixed(4)}`
        + `  zoom: ${zoom?.toFixed(3) ?? 'null'}`
        + `  center: x=${targetX?.toFixed(4) ?? 'null'}, y=${targetY?.toFixed(4) ?? 'null'}`,
      );
    }
  }, [annotationActiveTool, handleAnnotationClick, logClickCoords, mapping, zoom, targetX, targetY]);

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
    cellSetSelection, cellSetColor, matrixObsIndex]);

  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [cellSetPolygonCache, setCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const cellSetPolygons = useMemo(() => {
    if ((cellSetLabelsVisible || cellSetPolygonsVisible)
      && !cacheHas(cellSetPolygonCache, cellSetSelection)
      && mergedCellSets?.tree?.length
      && obsEmbedding
      && obsEmbeddingIndex
      && cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        obsIndex: obsEmbeddingIndex,
        obsEmbedding,
        cellSets: mergedCellSets,
        cellSetSelection,
        cellSetColor,
        theme,
      });
      setCellSetPolygonCache(cache => [...cache, [cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(cellSetPolygonCache, cellSetSelection) || [];
  }, [cellSetPolygonsVisible, cellSetPolygonCache, cellSetLabelsVisible, theme,
    obsEmbeddingIndex, obsEmbedding, mergedCellSets, cellSetSelection, cellSetColor]);


  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    if (obsEmbedding && obsEmbedding.data && obsEmbedding.shape) {
      const cellCount = obsEmbedding.shape[1];
      const xE = extent(obsEmbedding.data[0]);
      const yE = extent(obsEmbedding.data[1]);
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellCount];
    }
    return [null, null, null, null, null];
  }, [obsEmbedding]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (xRange && yRange && width && height) {
      const pointSizeDevicePixels = getPointSizeDevicePixels(
        window.devicePixelRatio, zoom, xRange, yRange, width, height, numCells,
      );
      setDynamicCellRadius(pointSizeDevicePixels);

      const nextCellOpacityScale = getPointOpacity(
        zoom, xRange, yRange, width, height, numCells, averageFillDensity,
      );
      setDynamicCellOpacity(nextCellOpacityScale);

      if (typeof initialTargetX !== 'number' || typeof initialTargetY !== 'number') {
        // The view config did not define an initial viewState so
        // we calculate one based on the data and set it.
        const newTargetX = xExtent[0] + xRange / 2;
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
        const notYetInitialized = (typeof targetX !== 'number' || typeof targetY !== 'number');
        const stillDefaultInitialized = (targetX === newTargetX && targetY === -newTargetY);
        if (notYetInitialized || stillDefaultInitialized) {
          setTargetX(newTargetX);
          // Graphics rendering has the y-axis going south so we need to multiply by negative one.
          setTargetY(-newTargetY);
          setZoom(newZoom);
        }
        setOriginalViewState({ target: [newTargetX, -newTargetY, 0], zoom: newZoom });
      } else if (!originalViewState) {
        // originalViewState has not yet been set and
        // the view config defined an initial viewState.
        setOriginalViewState({ target: [initialTargetX, initialTargetY, 0], zoom: initialZoom });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells,
    width, height, initialZoom, zoom, initialTargetX, initialTargetY, averageFillDensity]);

  const getObsInfo = useGetObsInfo(
    observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  );

  const cellSelectionSet = useMemo(() => new Set(cellSelection), [cellSelection]);
  const getCellIsSelected = useCallback((object, { index }) => (
    (cellSelectionSet || new Set([])).has(obsEmbeddingIndex[index]) ? 1.0 : 0.0
  ), [cellSelectionSet, obsEmbeddingIndex]);

  const cellRadius = (cellRadiusMode === 'manual' ? cellRadiusFixed : dynamicCellRadius);
  const cellOpacity = (cellOpacityMode === 'manual' ? cellOpacityFixed : dynamicCellOpacity);

  // Compute aggregated expression data if featureAggregationStrategyToUse is not null
  // and we have multiple features to aggregate.
  const aggregatedExpressionData = useMemo(() => {
    if (featureAggregationStrategyToUse != null && expressionData && expressionData.length > 1) {
      const aggregated = aggregateFeatureArrays(expressionData, featureAggregationStrategyToUse);
      // Return as array with single element to match expressionData structure
      return [aggregated];
    }
    return expressionData;
  }, [expressionData, featureAggregationStrategyToUse]);

  const {
    normData: uint8ExpressionData,
    extents: expressionExtents,
    missing: expressionMissing,
  } = useUint8FeatureSelection(aggregatedExpressionData);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({
    instanceObsIndex: obsEmbeddingIndex,
    matrixObsIndex,
    expressionData: uint8ExpressionData,
  });

  // Sort the expression data array so that we can compute percentiles
  // using the d3 quantileSorted function for improved performance.
  const sortedWeights = useMemo(() => {
    if (uint8ExpressionData?.[0]) {
      const weights = uint8ExpressionData[0];
      return weights.toSorted();
    }
    return null;
  }, [uint8ExpressionData]);

  // Compute contour thresholds based on the entire expression data distribution
  // (not per-cellSet or per-sampleSet).
  const contourThresholds = useMemo(() => {
    if (sortedWeights) {
      const thresholds = (contourPercentiles || DEFAULT_CONTOUR_PERCENTILES)
        .map(p => quantileSorted(sortedWeights, p))
        .map(t => Math.max(t, 1.0));
      return thresholds;
    }
    return [1, 10, 100];
  }, [contourPercentiles, sortedWeights]);

  // Construct a circle polygon using Turf's circle function,
  // which surrounds all points in the scatterplot,
  // which we can use to position text labels along.
  const circleInfo = useMemo(() => {
    if (!originalViewState || !width || !height || !xRange || !yRange) {
      return null;
    }
    const center = [
      originalViewState.target[0],
      originalViewState.target[1],
    ];
    const scaleFactor = (2 ** originalViewState.zoom);
    if (!(typeof scaleFactor === 'number' && typeof center[0] === 'number' && typeof center[1] === 'number') || Number.isNaN(scaleFactor)) {
      return null;
    }
    const size = Math.max(xRange, yRange);
    // TODO: figure out a better solution than
    // scaling the radius by the arbitrary 0.8?
    const radius = ((size * Math.sqrt(2)) / 2) * circleScaleFactor;
    const numPoints = 96;
    const options = { steps: numPoints, units: 'degrees' };
    const circlePolygon = circle(center, radius, options);
    return {
      center,
      radius,
      polygon: circlePolygon,
      steps: numPoints,
    };
  }, [originalViewState, width, height, xRange, yRange, circleScaleFactor]);

  // It is possible for the embedding index+data to be out of order
  // with respect to the matrix index+data. Here, we align the embedding
  // data so that the rows are ordered the same as the matrix rows.
  // TODO: refactor this as a hook that can be used elsewhere to align data
  // from different data types with the expression matrix data.
  // Need to fallback to the original ordering if no matrix data is present.
  // TODO: do this everywhere and remove the need for the
  // useExpressionValueGetter hook and getter function.
  const [alignedEmbeddingIndex, alignedEmbeddingData] = useMemo(() => {
    // Sort the embedding data according to the matrix obsIndex.
    if (obsEmbedding?.data && obsEmbeddingIndex && matrixObsIndex) {
      const matrixIndexMap = new Map(matrixObsIndex.map((key, i) => ([key, i])));
      const toMatrixIndex = obsEmbeddingIndex.map(key => matrixIndexMap.get(key));

      const newEmbeddingIndex = new Array(obsEmbeddingIndex.length);
      const newEmbeddingData = [
        new obsEmbedding.data[0].constructor(obsEmbedding.data[0].length),
        new obsEmbedding.data[1].constructor(obsEmbedding.data[1].length),
      ];
      for (let i = 0; i < obsEmbeddingIndex.length; i++) {
        const matrixRowIndex = toMatrixIndex[i];
        newEmbeddingData[0][matrixRowIndex] = obsEmbedding.data[0][i];
        newEmbeddingData[1][matrixRowIndex] = obsEmbedding.data[1][i];
        newEmbeddingIndex[matrixRowIndex] = obsEmbeddingIndex[i];
      }
      return [newEmbeddingIndex, { ...obsEmbedding, data: newEmbeddingData }];
    }
    // Fall back to original ordering if no matrix data is present to align with.
    return [obsEmbeddingIndex, obsEmbedding];
  }, [matrixObsIndex, obsEmbeddingIndex, obsEmbedding]);

  const sampleIdToObsIdsMap = useMemo(() => {
    // sampleEdges maps obsId -> sampleId.
    // However when we stratify we want to map sampleId -> [obsId1, obsId2, ...].
    // Here we create this reverse mapping.
    if (sampleEdges) {
      const result = new Map();
      Array.from(sampleEdges.entries()).forEach(([obsId, sampleId]) => {
        if (!result.has(sampleId)) {
          result.set(sampleId, [obsId]);
        } else {
          result.get(sampleId).push(obsId);
        }
      });
      return result;
    }
    return null;
  }, [sampleEdges]);

  // Stratify multiple arrays: per-cellSet and per-sampleSet.
  const [stratifiedData, stratifiedDataCount] = useMemo(() => {
    if (alignedEmbeddingData?.data) {
      const [result, cellCountResult] = stratifyArrays(
        sampleEdges, sampleIdToObsIdsMap,
        sampleSets, sampleSetSelection,
        alignedEmbeddingIndex, mergedCellSets, cellSetSelection, {
          obsEmbeddingX: alignedEmbeddingData.data[0],
          obsEmbeddingY: alignedEmbeddingData.data[1],
          ...(uint8ExpressionData?.[0] ? { featureValue: uint8ExpressionData } : {}),
        }, featureAggregationStrategyToUse,
      );
      return [result, cellCountResult];
    }
    return [null, null];
  }, [alignedEmbeddingIndex, alignedEmbeddingData, uint8ExpressionData,
    sampleEdges, sampleIdToObsIdsMap, sampleSets, sampleSetSelection,
    cellSetSelection, mergedCellSets, featureAggregationStrategyToUse,
  ]);

  const setViewState = ({ zoom: newZoom, target }) => {
    if (annotationTransitionDuration > 0) return;
    if (annotationFrameIndex !== null) setAnnotationDiverged(true);
    setZoom(newZoom);
    setTargetX(target[0]);
    setTargetY(target[1]);
    setTargetZ(target[2] || 0);
  };

  // TODO: Update this once the rendered points reflects the selection/filtering.
  const cellCountToUse = embeddingPointsVisible
    ? cellsCount
    : (stratifiedDataCount ?? cellsCount);

  return (
    <TitleInfo
      title={title}
      info={`${commaNumber(cellCountToUse)} ${plur(observationsLabel, cellCountToUse)}`}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
      errors={errors}
      options={(
        <ScatterplotOptions
          observationsLabel={observationsLabel}
          cellRadius={cellRadiusFixed}
          setCellRadius={setCellRadiusFixed}
          cellRadiusMode={cellRadiusMode}
          setCellRadiusMode={setCellRadiusMode}
          cellOpacity={cellOpacityFixed}
          setCellOpacity={setCellOpacityFixed}
          cellOpacityMode={cellOpacityMode}
          setCellOpacityMode={setCellOpacityMode}
          cellSetLabelsVisible={cellSetLabelsVisible}
          setCellSetLabelsVisible={setCellSetLabelsVisible}
          tooltipsVisible={tooltipsVisible}
          setTooltipsVisible={setTooltipsVisible}
          cellSetLabelSize={cellSetLabelSize}
          setCellSetLabelSize={setCellSetLabelSize}
          cellSetPolygonsVisible={cellSetPolygonsVisible}
          setCellSetPolygonsVisible={setCellSetPolygonsVisible}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
          geneExpressionColormap={geneExpressionColormap}
          setGeneExpressionColormap={setGeneExpressionColormap}
          geneExpressionColormapRange={geneExpressionColormapRange}
          setGeneExpressionColormapRange={setGeneExpressionColormapRange}
          embeddingPointsVisible={embeddingPointsVisible}
          setEmbeddingPointsVisible={setEmbeddingPointsVisible}
          embeddingContoursVisible={embeddingContoursVisible}
          setEmbeddingContoursVisible={setEmbeddingContoursVisible}
          embeddingContoursFilled={embeddingContoursFilled}
          setEmbeddingContoursFilled={setEmbeddingContoursFilled}
          contourPercentiles={contourPercentiles}
          setContourPercentiles={setContourPercentiles}
          defaultContourPercentiles={DEFAULT_CONTOUR_PERCENTILES}
          contourColorEncoding={contourColorEncoding}
          setContourColorEncoding={setContourColorEncoding}
          featureAggregationStrategy={featureAggregationStrategy}
          setFeatureAggregationStrategy={setFeatureAggregationStrategy}
        />
      )}
    >
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{ zoom: effectiveZoom, target: [effectiveTargetX, effectiveTargetY, targetZ] }}
        setViewState={setViewState}
        originalViewState={originalViewState}
        obsEmbeddingIndex={obsEmbeddingIndex}
        obsEmbedding={obsEmbedding}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}
        cellSetPolygons={cellSetPolygons}
        cellSetLabelSize={cellSetLabelSize}
        cellSetLabelsVisible={cellSetLabelsVisible}
        cellSetPolygonsVisible={cellSetPolygonsVisible}
        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        setCellHighlight={setCellHighlight}
        cellRadius={cellRadius}
        cellOpacity={cellOpacity}
        cellColorEncoding={cellColorEncoding}
        geneExpressionColormap={geneExpressionColormap}
        geneExpressionColormapRange={geneExpressionColormapRange}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        getExpressionValue={getExpressionValue}
        getCellIsSelected={getCellIsSelected}

        obsSetSelection={cellSetSelection}
        sampleSetSelection={sampleSetSelection}
        // InternMap data structures where keys are
        // obsSet -> sampleSet -> arrayKey -> [].
        stratifiedData={stratifiedData}
        obsSetColor={cellSetColor}
        sampleSetColor={sampleSetColor}
        contourThresholds={contourThresholds}
        contourColorEncoding={contourColorEncoding}
        contourColor={contourColor}
        contoursFilled={embeddingContoursFilled}
        embeddingPointsVisible={embeddingPointsVisible}
        embeddingContoursVisible={embeddingContoursVisible}

        circleInfo={circleInfo}
        featureSelection={geneSelection}
        annotationShapes={activeShapes}
        annotationActiveTool={annotationActiveTool}
        annotationPreviewLayer={annotationPreviewLayer}
        annotationSelectedShapeUid={annotationSelectedShapeUid}
        onCoordHover={onCoordHover}
        onCoordClick={onCoordClick}
      />
      {coordinatesVisible && hoverCoords && (
        <div className={classes.coordOverlay}>
          {`x: ${hoverCoords[0].toFixed(2)}  y: ${hoverCoords[1].toFixed(2)}`}
        </div>
      )}
      {tooltipsVisible && width && height ? (
        <ScatterplotTooltipSubscriber
          parentUuid={uuid}
          obsHighlight={cellHighlight}
          width={width}
          height={height}
          getObsInfo={getObsInfo}
          featureType={featureType}
          featureLabelsMap={featureLabelsMap}
        />
      ) : null}
      <Legend
        visible
        theme={theme}
        featureType={featureType}
        featureValueType={featureValueType}
        obsColorEncoding={cellColorEncoding}
        featureSelection={geneSelection}
        featureLabelsMap={featureLabelsMap}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
        setFeatureValueColormapRange={setGeneExpressionColormapRange}
        obsSetSelection={cellSetSelection}
        extent={expressionExtents}
        missing={expressionMissing}
        // Contour percentile legend
        pointsVisible={embeddingPointsVisible}
        contoursVisible={embeddingContoursVisible}
        contoursFilled={embeddingContoursFilled}
        contourPercentiles={contourPercentiles || DEFAULT_CONTOUR_PERCENTILES}
        contourThresholds={contourThresholds}
        featureAggregationStrategy={featureAggregationStrategyToUse}
      />
    </TitleInfo>
  );
}
