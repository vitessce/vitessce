import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TitleInfo,
  useCoordination,
  useCoordinationScopes,
  useViewConfigStoreApi,
  cleanExportConfig,
} from '@vitessce/vit-s';
import {
  ViewType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import { AnnotationController } from './AnnotationController.js';

export function AnnotationControllerSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    removeGridComponent,
    theme,
    title = 'Annotations',
    closeButtonVisible,
    downloadButtonVisible,
  } = props;

  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  const [
    {
      annotationFrames,
      annotationFrameIndex,
      annotationOverlayVisible,
      annotationDiverged,
      annotationDescription,
      annotationActiveTool,
      annotationCaptureViewStateTrigger,
      annotationSelectedShapeUid,
      obsSetSelection,
      featureSelection,
      obsColorEncoding,
      annotationDataType,
      annotationDataUrl,
      spatialPhysicalPixelSize,
    },
    {
      setAnnotationFrames,
      setAnnotationFrameIndex,
      setAnnotationOverlayVisible,
      setAnnotationTransitionDuration,
      setAnnotationDiverged,
      setAnnotationActiveTool,
      setAnnotationCaptureViewStateTrigger,
      setAnnotationSelectedShapeUid,
      setFeatureSelection,
      setObsColorEncoding,
      setObsSetSelection,
    },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.ANNOTATION_CONTROLLER],
    coordinationScopes,
  );

  const [fetchStatus, setFetchStatus] = useState({ status: 'idle', error: null });

  useEffect(() => {
    if (annotationDataType !== 'data' || !annotationDataUrl) return;
    const controller = new AbortController();
    setFetchStatus({ status: 'loading', error: null });
    fetch(annotationDataUrl, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        const frames = Array.isArray(data) ? data : (data.frames ?? data.annotationFrames ?? []);
        setAnnotationFrames(frames);
        setFetchStatus({ status: 'success', error: null });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setFetchStatus({ status: 'error', error: err.message });
        }
      });
    return () => controller.abort();
  }, [annotationDataUrl, annotationDataType, setAnnotationFrames]);

  // Baseline snapshot for cross-view types — captured on first frame activation.
  const latestCrossViewRef = useRef({});
  useEffect(() => {
    latestCrossViewRef.current = { featureSelection, obsColorEncoding, obsSetSelection };
  }, [featureSelection, obsColorEncoding, obsSetSelection]);

  const handleCaptureViewState = useCallback(() => {
    if (annotationFrameIndex === null || !annotationFrames) return;
    // Write cross-view state into frame.viewState (feature/color/set selections).
    // Per-view spatial/embedding state is captured by each subscriber via the trigger.
    const crossView = {};
    if (featureSelection != null) crossView.featureSelection = featureSelection;
    if (obsColorEncoding != null) crossView.obsColorEncoding = obsColorEncoding;
    if (obsSetSelection != null) crossView.obsSetSelection = obsSetSelection;
    setAnnotationFrames((annotationFrames ?? []).map((f, idx) => (
      idx === annotationFrameIndex ? { ...f, viewState: { ...(f.viewState ?? {}), ...crossView } } : f
    )));
    // Increment trigger so each subscribed view writes its own viewStates[] entry.
    setAnnotationCaptureViewStateTrigger(annotationCaptureViewStateTrigger + 1);
    // The stored view state now matches the current view — no longer diverged.
    setAnnotationDiverged(false);
  }, [
    annotationFrameIndex, annotationFrames, setAnnotationFrames,
    setAnnotationCaptureViewStateTrigger, annotationCaptureViewStateTrigger,
    setAnnotationDiverged,
    featureSelection, obsColorEncoding, obsSetSelection,
  ]);

  const defaultsCrossViewRef = useRef(null);

  const applyFrame = useCallback((frameIndex) => {
    const frame = annotationFrames?.[frameIndex];
    if (!frame) return;

    if (defaultsCrossViewRef.current === null) {
      defaultsCrossViewRef.current = { ...latestCrossViewRef.current };
    }
    const d = defaultsCrossViewRef.current;
    const vs = frame.viewState ?? {};

    const applyVal = (setter, key) => {
      const v = vs[key] !== undefined ? vs[key] : d?.[key];
      if (v !== undefined) setter(v);
    };

    // Signal views to animate and clear any divergence.
    setAnnotationTransitionDuration(800);
    setTimeout(() => setAnnotationTransitionDuration(0), 800);
    setAnnotationDiverged(false);

    applyVal(setFeatureSelection, 'featureSelection');
    applyVal(setObsColorEncoding, 'obsColorEncoding');
    setObsSetSelection(
      vs.obsSetSelection !== undefined ? vs.obsSetSelection : d?.obsSetSelection,
    );

    setAnnotationFrameIndex(frameIndex);
    setAnnotationOverlayVisible(true);
  }, [
    annotationFrames,
    setAnnotationTransitionDuration, setAnnotationDiverged,
    setFeatureSelection, setObsColorEncoding, setObsSetSelection,
    setAnnotationFrameIndex, setAnnotationOverlayVisible,
  ]);

  // Enter story — go to frame 0, animate in.
  const handleEnter = useCallback(() => {
    applyFrame(0);
  }, [applyFrame]);

  // Exit — animate views back to their pre-story baseline and restore all
  // cross-view state (color encoding, selections) to what they were before entry.
  const handleExit = useCallback(() => {
    setAnnotationTransitionDuration(800);
    setTimeout(() => setAnnotationTransitionDuration(0), 800);
    setAnnotationDiverged(false);

    const d = defaultsCrossViewRef.current;
    if (d) {
      if (d.featureSelection !== undefined) setFeatureSelection(d.featureSelection);
      if (d.obsColorEncoding !== undefined) setObsColorEncoding(d.obsColorEncoding);
      if (d.obsSetSelection !== undefined) setObsSetSelection(d.obsSetSelection);
    }

    setAnnotationFrameIndex(null);
  }, [
    setAnnotationTransitionDuration, setAnnotationDiverged,
    setFeatureSelection, setObsColorEncoding, setObsSetSelection,
    setAnnotationFrameIndex,
  ]);

  const handleBack = useCallback(() => {
    applyFrame(annotationFrameIndex === null ? 0 : Math.max(0, annotationFrameIndex - 1));
  }, [annotationFrameIndex, applyFrame]);

  const handleForward = useCallback(() => {
    const numFrames = annotationFrames?.length ?? 0;
    applyFrame(annotationFrameIndex === null ? 0 : Math.min(numFrames - 1, annotationFrameIndex + 1));
  }, [annotationFrameIndex, annotationFrames, applyFrame]);

  const handleToggleOverlay = useCallback(() => {
    setAnnotationOverlayVisible(!annotationOverlayVisible);
  }, [annotationOverlayVisible, setAnnotationOverlayVisible]);

  const handleRecenter = useCallback(() => {
    if (annotationFrameIndex !== null) applyFrame(annotationFrameIndex);
  }, [annotationFrameIndex, applyFrame]);

  const storeApi = useViewConfigStoreApi();

  const handleDownloadConfig = useCallback(() => {
    const viewConfig = storeApi.getState().viewConfig;
    if (!viewConfig) return;
    const cleaned = cleanExportConfig(viewConfig);
    const blob = new Blob([JSON.stringify(cleaned, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vitessce-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [storeApi]);

  const numFrames = annotationFrames?.length ?? 0;
  const infoText = numFrames > 0
    ? (annotationFrameIndex !== null
      ? `Frame ${annotationFrameIndex + 1} of ${numFrames}`
      : `${numFrames} frame${numFrames !== 1 ? 's' : ''}`)
    : '';

  return (
    <TitleInfo
      title={title}
      info={infoText}
      theme={theme}
      withPadding={false}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady
    >
      <AnnotationController
        frames={annotationFrames}
        frameIndex={annotationFrameIndex}
        overlayVisible={annotationOverlayVisible}
        diverged={annotationDiverged}
        description={annotationDescription}
        activeTool={annotationActiveTool}
        onEnter={handleEnter}
        onExit={handleExit}
        onBack={handleBack}
        onForward={handleForward}
        onToggleOverlay={handleToggleOverlay}
        onRecenter={handleRecenter}
        onFrameClick={applyFrame}
        onSetFrames={setAnnotationFrames}
        onSetActiveTool={setAnnotationActiveTool}
        onCaptureViewState={handleCaptureViewState}
        onDownloadConfig={handleDownloadConfig}
        selectedShapeUid={annotationSelectedShapeUid}
        onSetSelectedShapeUid={setAnnotationSelectedShapeUid}
        isLoadingData={fetchStatus.status === 'loading'}
        loadDataError={fetchStatus.error}
        dataMode={annotationDataType === 'data'}
        dataUrl={annotationDataUrl}
        physicalPixelSize={spatialPhysicalPixelSize}
      />
    </TitleInfo>
  );
}
