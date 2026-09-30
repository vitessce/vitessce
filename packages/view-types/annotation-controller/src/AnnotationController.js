/**
 * Attribution: Originally written by @RPSeaman
 * Reference: https://github.com/vitessce/vitessce/pull/2528
 */
import React from 'react';
import {
  Button,
  IconButton,
  Slider,
  Tooltip,
  Typography,
  ArrowLeft,
  ArrowRight,
  CenterFocusStrong,
  Close,
  Edit,
  MenuBook,
  Visibility,
  VisibilityOff,
} from '@vitessce/styles';
import { CoordinationType, DescriptionType } from '@vitessce/constants-internal';
import Markdown from 'react-markdown';
import { AnnotationStoryEditor } from './AnnotationStoryEditor.js';
import { useStyles } from './styles.js';

function AnnotationText(props) {
  const { text, textType } = props;
  const { classes } = useStyles();
  if (!text) {
    return null;
  }
  return (
    <div className={classes.annotationText}>
      {textType === DescriptionType.MARKDOWN
        ? <Markdown>{text}</Markdown>
        : <p>{text}</p>}
    </div>
  );
}

function EditButton(props) {
  const { onClick } = props;
  const { classes } = useStyles();
  return (
    <Tooltip title="Edit the annotation story">
      <IconButton size="small" className={classes.subtleButton} onClick={onClick} aria-label="Edit the annotation story">
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function countFrameShapes(frame) {
  return (frame.layout || []).reduce((sum, view) => {
    const shapes = view.coordinationValues?.[CoordinationType.ANNOTATION_SHAPES];
    return sum + (Array.isArray(shapes) ? shapes.length : 0);
  }, 0);
}

/**
 * The story overview, shown when no frame is active.
 */
function StoryOverview(props) {
  const {
    story, canEdit, onEdit, onBegin,
  } = props;
  const { classes } = useStyles();
  const numFrames = story.frames.length;
  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        {canEdit ? <EditButton onClick={onEdit} /> : null}
      </div>
      <div className={classes.overview}>
        <MenuBook className={classes.overviewIcon} />
        <div className={classes.overviewLabel}>Guided annotation</div>
        {story.title ? <div className={classes.overviewTitle}>{story.title}</div> : null}
        <div className={classes.overviewCount}>
          {`${numFrames} frame${numFrames === 1 ? '' : 's'}`}
        </div>
        <div className={classes.overviewDescription}>
          <AnnotationText text={story.description} textType={story.descriptionType} />
        </div>
        {numFrames > 0 ? (
          <Button
            variant="contained"
            onClick={onBegin}
            className={classes.beginButton}
            startIcon={<MenuBook />}
          >
            Begin
          </Button>
        ) : (
          <Typography variant="body2">
            {canEdit ? 'Switch to edit mode to create the first frame.' : 'This story has no frames.'}
          </Typography>
        )}
      </div>
    </div>
  );
}

/**
 * The story player, shown when a frame is active.
 */
function StoryPlayer(props) {
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

/**
 * The annotation story controller.
 * Renders the story overview, or the current frame along with controls
 * to navigate between frames. When editing is enabled, also renders
 * a story editor, which emits each edit as a new story object.
 * @param {object} props
 * @param {object|null} props.story The annotation story object.
 * @param {number|null} props.frameIndex The index of the current frame,
 * or null if no frame is active.
 * @param {function} props.onFrameIndexChange Setter for the current frame index.
 * @param {function} props.onStoryChange Setter for the story (only used when editing).
 * @param {boolean} props.canEdit Whether the story can be edited.
 * @param {boolean} props.isEditing Whether the story is currently being edited
 * (i.e., the annotationEditable coordination value).
 * @param {function} props.onEditingChange Setter for isEditing.
 * @param {function} props.onCreateStory Callback to create a new (empty) story.
 * @param {boolean} props.isOverlayVisible Whether annotation shapes are visible.
 * @param {function} props.onOverlayVisibleChange Setter for isOverlayVisible.
 * @param {boolean} props.isSemanticZoomEnabled Whether semantic zoom is enabled.
 * @param {function} props.onSemanticZoomChange Setter for isSemanticZoomEnabled.
 * @param {function} props.onRecenter Callback to re-apply the current frame to the views.
 * @param {object[]} props.views The annotatable views, as { uid, component }.
 * @param {function} props.getViewCoordinationValues Function which returns the current
 * coordination values of a view, as (viewUid, coordinationTypes) => values.
 */
export function AnnotationController(props) {
  const {
    story,
    frameIndex,
    onFrameIndexChange,
    onStoryChange,
    canEdit,
    isEditing,
    onEditingChange,
    onCreateStory,
    views,
    getViewCoordinationValues,
  } = props;
  const { classes } = useStyles();
  const isEditMode = Boolean(canEdit && isEditing && story);

  if (isEditMode) {
    return (
      <AnnotationStoryEditor
        story={story}
        frameIndex={frameIndex}
        onStoryChange={onStoryChange}
        onFrameIndexChange={onFrameIndexChange}
        views={views}
        getViewCoordinationValues={getViewCoordinationValues}
        onDone={() => onEditingChange(false)}
      />
    );
  }

  if (!story) {
    return (
      <div className={classes.root}>
        <div className={classes.overview}>
          <Typography variant="body2">No annotation story has been loaded.</Typography>
          {canEdit ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Edit fontSize="small" />}
              onClick={onCreateStory}
            >
              Create a story
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const isFrameActive = typeof frameIndex === 'number' && Boolean(story.frames[frameIndex]);
  return isFrameActive ? (
    <StoryPlayer {...props} onEdit={() => onEditingChange(true)} />
  ) : (
    <StoryOverview
      story={story}
      canEdit={canEdit}
      onEdit={() => onEditingChange(true)}
      onBegin={() => onFrameIndexChange(0)}
    />
  );
}
