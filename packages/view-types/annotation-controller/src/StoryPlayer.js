import React from 'react';
import {
  IconButton,
  Slider,
  Tooltip,
  ArrowLeft,
  ArrowRight,
  CenterFocusStrong,
  Close,
  Visibility,
  VisibilityOff,
} from '@vitessce/styles';
import { AnnotationText } from './AnnotationText.js';
import { EditButton } from './EditButton.js';
import { countFrameShapes } from './story-utils.js';
import { useStyles } from './styles.js';

/**
 * The story player, shown when a frame is active.
 */
export function StoryPlayer(props) {
  const {
    story,
    frameIndex,
    onFrameIndexChange,
    isOverlayVisible,
    onOverlayVisibleChange,
    isSemanticZoomEnabled,
    onSemanticZoomChange,
    onRecenter,
    canEdit,
    onEdit,
  } = props;
  const { classes, cx } = useStyles();
  const { frames } = story;
  const numFrames = frames.length;
  const numDigits = String(numFrames).length;
  const activeFrame = frames[frameIndex];
  const numShapes = countFrameShapes(activeFrame);

  return (
    <div className={classes.root}>
      <div className={classes.playHeader}>
        <Tooltip title="Exit the story">
          <IconButton size="small" className={classes.subtleButton} onClick={() => onFrameIndexChange(null)} aria-label="Exit the story">
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
        <span className={classes.playHeaderCenter}>{`${frameIndex + 1} of ${numFrames}`}</span>
        {canEdit ? <EditButton onClick={onEdit} /> : null}
      </div>

      <div className={classes.navRow}>
        <IconButton
          onClick={() => onFrameIndexChange(frameIndex - 1)}
          disabled={frameIndex === 0}
          className={classes.navButton}
          aria-label="Previous frame"
        >
          <ArrowLeft className={classes.navIcon} />
        </IconButton>
        <div className={classes.navSlider}>
          <Slider
            min={0}
            max={Math.max(0, numFrames - 1)}
            step={1}
            value={frameIndex}
            onChange={(_, value) => onFrameIndexChange(value)}
            size="small"
            disabled={numFrames <= 1}
            aria-label="Frame"
          />
        </div>
        <IconButton
          onClick={() => onFrameIndexChange(frameIndex + 1)}
          disabled={frameIndex === numFrames - 1}
          className={classes.navButton}
          aria-label="Next frame"
        >
          <ArrowRight className={classes.navIcon} />
        </IconButton>
      </div>

      <div className={classes.utilityRow}>
        <Tooltip title={isOverlayVisible ? 'Hide annotation shapes' : 'Show annotation shapes'}>
          <IconButton onClick={() => onOverlayVisibleChange(!isOverlayVisible)} aria-label="Toggle annotation shapes">
            {isOverlayVisible ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isSemanticZoomEnabled ? 'Adaptive zoom on: shapes simplify when zoomed out' : 'Adaptive zoom off: shapes always render at full detail'}>
          <IconButton
            onClick={() => onSemanticZoomChange(!isSemanticZoomEnabled)}
            className={cx(!isSemanticZoomEnabled && classes.utilityButtonInactive)}
            aria-label="Toggle adaptive zoom"
          >
            <span className={classes.semanticZoomLabel}>Z↕</span>
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset the views to this frame">
          <IconButton onClick={onRecenter} aria-label="Reset the views to this frame">
            <CenterFocusStrong />
          </IconButton>
        </Tooltip>
      </div>

      {/* The key resets the scroll position when the frame changes. */}
      <div className={classes.activeFrame} key={activeFrame.uid}>
        {activeFrame.title ? <div className={classes.frameTitle}>{activeFrame.title}</div> : null}
        <AnnotationText text={activeFrame.description} textType={activeFrame.descriptionType} />
        <div className={classes.shapeCount}>
          {`${numShapes} shape${numShapes === 1 ? '' : 's'}`}
        </div>
      </div>

      <div className={classes.frameList} aria-label="Annotation frames">
        {frames.map((frame, i) => {
          const isActive = i === frameIndex;
          return (
            <div
              key={frame.uid}
              className={cx(classes.frameRow, isActive && classes.frameRowActive)}
              onClick={() => onFrameIndexChange(i)}
              role="button"
              tabIndex={0}
              aria-current={isActive}
              onKeyDown={e => e.key === 'Enter' && onFrameIndexChange(i)}
            >
              <span className={cx(classes.frameNumber, isActive && classes.frameNumberActive)}>
                {String(i + 1).padStart(numDigits, '0')}
              </span>
              <span className={classes.frameRowTitle}>{frame.title || `Frame ${i + 1}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
