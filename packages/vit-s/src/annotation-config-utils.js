// Coordination types to strip from exported configs.
// These are ephemeral interaction state, auto-generated data, and internal
// annotation machinery that Vitessce recreates from defaults on every load.
const STRIP_CS_KEYS = new Set([
  // Internal annotation state (reset to defaults on load)
  'annotationActiveTool',
  'annotationCaptureViewStateTrigger',
  'annotationSelectedShapeUid',
  'annotationTransitionDuration',
  'annotationDiverged',
  // Ephemeral hover/filter state
  'obsHighlight',
  'featureHighlight',
  'obsSetHighlight',
  'obsSetExpansion',
  'moleculeHighlight',
  'obsFilter',
  'featureFilter',
  'obsSetFilter',
  // Auto-generated from data by initStrategy:'auto' (large, recreated on load)
  'obsSetColor',
  // Heatmap pan/zoom — always reset to 0 on load
  'heatmapZoomX',
  'heatmapZoomY',
  'heatmapTargetX',
  'heatmapTargetY',
  // Spatial rotation — all-zero defaults
  'spatialRotation',
  'spatialRotationX',
  'spatialRotationY',
  'spatialRotationZ',
  'spatialRotationOrbit',
  'spatialOrbitAxis',
  'spatialAxisFixed',
  // Rarely-used display defaults
  'photometricInterpretation',
  'embeddingRotation',
  'embeddingObsSetPolygonsVisible',
  'embeddingObsSetLabelsVisible',
  'embeddingObsSetLabelSize',
  'embeddingObsRadius',
  'embeddingObsOpacity',
  'embeddingObsRadiusMode',
  'embeddingObsOpacityMode',
  'embeddingContoursVisible',
  'embeddingContoursFilled',
  'embeddingContourPercentiles',
  'embeddingPointsVisible',
  'contourColorEncoding',
  'contourColor',
  'embeddingTargetZ',
]);

/**
 * Produces a clean, valid, standalone Vitessce config from the live runtime
 * config captured via the Zustand store.
 *
 * Strips ephemeral interaction state, auto-generated data, and internal
 * annotation machinery that Vitessce recreates on every load. Annotation
 * data (annotationFrames etc.) is kept in coordinationSpace so the file
 * loads directly without any withAnnotations() pre-processing.
 *
 * Also removes auto-assigned uid fields from the top-level object and from
 * individual layout components (Vitessce reassigns them at load time).
 */
export function cleanExportConfig(viewConfig) {
  if (!viewConfig) return viewConfig;

  const { coordinationSpace: cs = {}, layout = [], uid, ...rest } = viewConfig;

  const cleanCs = Object.fromEntries(
    Object.entries(cs).filter(([key]) => !STRIP_CS_KEYS.has(key)),
  );

  const cleanLayout = layout.map(({ uid: _uid, ...comp }) => comp);

  return { ...rest, coordinationSpace: cleanCs, layout: cleanLayout };
}

