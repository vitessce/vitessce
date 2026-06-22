import React, { useCallback, useEffect, useRef } from 'react';
import {
  TitleInfo,
  useCoordination,
  useCoordinationScopes,
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
      obsSetSelection,
      featureSelection,
      obsColorEncoding,
    },
    {
      setAnnotationFrameIndex,
      setAnnotationOverlayVisible,
      setAnnotationTransitionDuration,
      setAnnotationDiverged,
      setFeatureSelection,
      setObsColorEncoding,
      setObsSetSelection,
    },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.ANNOTATION_CONTROLLER],
    coordinationScopes,
  );

  // Baseline snapshot for cross-view types — captured on first frame activation.
  const latestCrossViewRef = useRef({});
  useEffect(() => {
    latestCrossViewRef.current = { featureSelection, obsColorEncoding, obsSetSelection };
  }, [featureSelection, obsColorEncoding, obsSetSelection]);

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
        onEnter={handleEnter}
        onExit={handleExit}
        onBack={handleBack}
        onForward={handleForward}
        onToggleOverlay={handleToggleOverlay}
        onRecenter={handleRecenter}
        onFrameClick={applyFrame}
      />
    </TitleInfo>
  );
}
