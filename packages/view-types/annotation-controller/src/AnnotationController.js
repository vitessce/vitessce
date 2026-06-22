import React from 'react';
import {
  makeStyles,
  IconButton,
  Button,
  Slider,
  ArrowLeft,
  ArrowRight,
  CenterFocusStrong,
  Visibility,
  VisibilityOff,
  Stop,
  MenuBook,
} from '@vitessce/styles';

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  enterScreen: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    textAlign: 'center',
  },
  enterHint: {
    fontSize: '0.8rem',
    opacity: 0.6,
    lineHeight: 1.4,
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 12px 0',
    flexShrink: 0,
  },
  sliderRow: {
    padding: '0 4px',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '4px',
  },
  exitBtn: {
    marginLeft: 'auto',
    fontSize: '0.7rem',
    padding: '2px 6px',
    minWidth: 0,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px 0',
    flexShrink: 0,
  },
  divergedDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: theme.palette.warning?.main ?? '#f5a623',
    marginLeft: 4,
    flexShrink: 0,
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  divergedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: theme.palette.warning?.main ?? '#f5a623',
    fontSize: '0.72rem',
  },
  spacer: {
    flex: 1,
  },
  recentBtnDiverged: {
    color: theme.palette.warning?.main ?? '#f5a623',
  },
  activeFrame: {
    padding: '6px 12px 4px',
    borderTop: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
  },
  frameTitle: {
    fontWeight: 600,
    fontSize: '0.875rem',
    marginBottom: '2px',
    lineHeight: 1.3,
  },
  frameText: {
    fontSize: '0.8rem',
    opacity: 0.8,
    lineHeight: 1.4,
  },
  shapeCount: {
    fontSize: '0.75rem',
    opacity: 0.55,
    marginTop: '2px',
  },
  frameList: {
    overflowY: 'auto',
    flex: 1,
    padding: '4px 0',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  frameItem: {
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    '&:hover': {
      backgroundColor: theme.palette.action?.hover || 'rgba(255,255,255,0.08)',
    },
  },
  frameItemActive: {
    backgroundColor: theme.palette.action?.selected || 'rgba(255,255,255,0.14)',
    fontWeight: 600,
  },
  frameDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    border: `1px solid ${theme.palette.primaryForeground}`,
    flexShrink: 0,
  },
  frameDotActive: {
    backgroundColor: theme.palette.primaryForeground,
  },
  empty: {
    padding: '12px',
    opacity: 0.5,
    fontSize: '0.85rem',
    textAlign: 'center',
  },
}));

export function AnnotationController(props) {
  const {
    frames,
    frameIndex,
    overlayVisible,
    diverged,
    description,
    onEnter,
    onExit,
    onBack,
    onForward,
    onToggleOverlay,
    onRecenter,
    onFrameClick,
  } = props;

  const { classes, cx } = useStyles();

  if (!frames || frames.length === 0) {
    return (
      <div className={classes.root}>
        <div className={classes.empty}>No annotation frames configured.</div>
      </div>
    );
  }

  const numFrames = frames.length;
  const activeFrame = frameIndex !== null ? frames[frameIndex] : null;
  const sliderValue = frameIndex !== null ? frameIndex : 0;

  // Not yet entered — show a neutral prompt with frame count only.
  // Individual frames are not shown here because they aren't clickable yet.
  if (frameIndex === null) {
    return (
      <div className={classes.root}>
        <div className={classes.enterScreen}>
          <Button
            variant="contained"
            size="small"
            startIcon={<MenuBook fontSize="small" />}
            onClick={onEnter}
          >
            Begin
          </Button>
          <div className={classes.enterHint}>
            {description ?? `${numFrames} annotated frame${numFrames !== 1 ? 's' : ''} — step through guided views with shapes and narrative text.`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {/* Exit + divergence row */}
      <div className={classes.topRow}>
        {diverged && (
          <span
            className={classes.divergedRow}
            title="You've panned or zoomed away from this frame — click Recenter to snap back"
          >
            <span className={classes.divergedDot} />
            View offset
          </span>
        )}
        <div className={classes.spacer} />
        <Button
          size="small"
          className={classes.exitBtn}
          startIcon={<Stop fontSize="inherit" />}
          onClick={onExit}
          title="Exit and return to the original view state"
        >
          Exit
        </Button>
      </div>

      <div className={classes.controls}>
        <div className={classes.sliderRow}>
          <Slider
            min={0}
            max={Math.max(0, numFrames - 1)}
            step={1}
            value={sliderValue}
            onChange={(_, v) => onFrameClick(v)}
            size="small"
            disabled={numFrames <= 1}
          />
        </div>
        <div className={classes.buttonRow}>
          <IconButton
            size="small"
            onClick={onBack}
            disabled={frameIndex === 0}
            title="Previous frame"
          >
            <ArrowLeft fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onToggleOverlay}
            title={overlayVisible ? 'Hide overlay' : 'Show overlay'}
          >
            {overlayVisible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={onRecenter}
            title={diverged ? 'Diverged from frame — click to recenter' : 'Recenter view'}
            className={diverged ? classes.recentBtnDiverged : undefined}
          >
            <CenterFocusStrong fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onForward}
            disabled={frameIndex === numFrames - 1}
            title="Next frame"
          >
            <ArrowRight fontSize="small" />
          </IconButton>
        </div>
      </div>

      {activeFrame && (
        <div className={classes.activeFrame}>
          {activeFrame.title && (
            <div className={classes.frameTitle}>{activeFrame.title}</div>
          )}
          {activeFrame.text && (
            <div className={classes.frameText}>{activeFrame.text}</div>
          )}
          <div className={classes.shapeCount}>
            {(activeFrame.shapes?.length ?? 0)} shape{(activeFrame.shapes?.length ?? 0) !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className={classes.frameList}>
        {frames.map((frame, i) => (
          <div
            key={frame.uid}
            className={cx(classes.frameItem, i === frameIndex && classes.frameItemActive)}
            onClick={() => onFrameClick(i)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onFrameClick(i)}
          >
            <div className={cx(classes.frameDot, i === frameIndex && classes.frameDotActive)} />
            {frame.title || `Frame ${i + 1}`}
          </div>
        ))}
      </div>
    </div>
  );
}
