import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Button,
  IconButton,
  NativeSelect,
  TextField,
  Tooltip,
  Add,
  AddToPhotos,
  ArrowDropDown,
  ArrowDropUp,
  Check,
  CloudDownload,
  ContentCopy,
  ExpandLess,
  ExpandMore,
  RemoveCircle,
  Visibility,
  VisibilityOff,
  Warning,
} from '@vitessce/styles';
import { useAnnotationEditingStoreShallow } from '@vitessce/vit-s';
import { annotationStoryObj } from '@vitessce/schemas';
import {
  STORY_DESCRIPTION_TYPES,
  updateStory,
  insertFrame,
  duplicateFrame,
  removeFrame,
  moveFrame,
  updateFrame,
  getFrameViewShapes,
  setFrameViewCoordinationValues,
  updateShape,
  removeShape,
  copyShapeToFrame,
  getFrameIndexAfterRemove,
  getFrameIndexAfterMove,
} from './story-utils.js';
import { FrameCaptureEditor } from './FrameCaptureEditor.js';
import { ShapeEditor } from './ShapeEditor.js';
import { ShapeIcon } from './ShapeIcon.js';
import { useStyles } from './styles.js';

const TOOLS = [
  { type: 'rectangle', label: 'Rect' },
  { type: 'line', label: 'Line' },
  { type: 'ellipse', label: 'Ellipse' },
  { type: 'polygon', label: 'Poly' },
  { type: 'polyline', label: 'Path' },
];
const MULTI_POINT_TOOLS = ['polygon', 'polyline'];

const CONFIRMATION_DURATION_MS = 1500;
const STORY_JSON_FILENAME = 'annotation-story.json';

/**
 * Hook for briefly showing a confirmation (e.g., after copying to the clipboard).
 * @returns {[boolean, function]} Whether the confirmation is visible,
 * and a function to show the confirmation.
 */
function useConfirmation() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const timeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  const confirm = useCallback(() => {
    setIsConfirmed(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsConfirmed(false), CONFIRMATION_DURATION_MS);
  }, []);
  return [isConfirmed, confirm];
}

function Section(props) {
  const {
    label, action, children, isInitiallyOpen = true,
  } = props;
  const { classes } = useStyles();
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  return (
    <div className={classes.section}>
      <div
        className={classes.sectionHeader}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={e => e.key === 'Enter' && setIsOpen(prev => !prev)}
      >
        <span className={classes.sectionLabel}>{label}</span>
        {action}
        {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </div>
      {isOpen ? children : null}
    </div>
  );
}

function TextFields(props) {
  const {
    title, description, descriptionType, onChange, titlePlaceholder,
  } = props;
  const { classes } = useStyles();
  const inputProps = { htmlInput: { className: classes.inputText } };
  return (
    <div className={classes.sectionFields}>
      <TextField
        value={title ?? ''}
        onChange={e => onChange({ title: e.target.value || undefined })}
        size="small"
        label="Title"
        placeholder={titlePlaceholder}
        fullWidth
        slotProps={inputProps}
      />
      <TextField
        value={description ?? ''}
        onChange={e => onChange({ description: e.target.value || undefined })}
        size="small"
        label="Description"
        multiline
        minRows={3}
        maxRows={10}
        fullWidth
        slotProps={inputProps}
      />
      <NativeSelect
        value={descriptionType ?? STORY_DESCRIPTION_TYPES[0]}
        onChange={e => onChange({ descriptionType: e.target.value })}
        inputProps={{ 'aria-label': 'Description format' }}
      >
        {STORY_DESCRIPTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </NativeSelect>
    </div>
  );
}

function stopPropagation(handler) {
  return (e) => {
    e.stopPropagation();
    handler();
  };
}

/**
 * Editor for an annotation story.
 * All edits are emitted as new story objects via onStoryChange.
 * The editor is only mounted while editing, and resets the (ephemeral)
 * annotation editing state (e.g., the active drawing tool) upon unmount.
 * @param {object} props
 * @param {object} props.story The annotation story.
 * @param {number|null} props.frameIndex The active frame index.
 * @param {function} props.onStoryChange Callback, called with the new story.
 * @param {function} props.onFrameIndexChange Callback, called with the new frame index.
 * @param {object[]} props.views The annotatable views, as { uid, component }.
 * @param {function} props.getViewCoordinationValues Function which returns the current
 * coordination values of a view, as (viewUid, coordinationTypes) => values.
 * @param {function} props.onDone Callback, called when the user is finished editing.
 */
export function AnnotationStoryEditor(props) {
  const {
    story,
    frameIndex,
    onStoryChange,
    onFrameIndexChange,
    views,
    getViewCoordinationValues,
    onDone,
  } = props;
  const { classes, cx } = useStyles();
  const [isCopyConfirmed, confirmCopy] = useConfirmation();
  const [isDownloadConfirmed, confirmDownload] = useConfirmation();

  const {
    activeTool, drawing, selectedShape,
    setActiveTool, finishDrawing, cancelDrawing, setSelectedShape, resetAnnotationEditing,
  } = useAnnotationEditingStoreShallow(state => ({
    activeTool: state.activeTool,
    drawing: state.drawing,
    selectedShape: state.selectedShape,
    setActiveTool: state.setActiveTool,
    finishDrawing: state.finishDrawing,
    cancelDrawing: state.cancelDrawing,
    setSelectedShape: state.setSelectedShape,
    resetAnnotationEditing: state.resetAnnotationEditing,
  }));

  // Reset the drawing tool and selection when editing ends.
  useEffect(() => () => resetAnnotationEditing(), [resetAnnotationEditing]);

  // Keyboard shortcuts while drawing: Enter to finish, Escape to cancel.
  useEffect(() => {
    if (!activeTool) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Enter' && drawing) {
        finishDrawing();
      } else if (e.key === 'Escape') {
        if (drawing) {
          cancelDrawing();
        } else {
          setActiveTool(null);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, drawing, finishDrawing, cancelDrawing, setActiveTool]);

  const validationResult = useMemo(() => annotationStoryObj.safeParse(story), [story]);
  const validationMessage = validationResult.success
    ? null
    : validationResult.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

  const { frames } = story;
  const numFrames = frames.length;
  const numDigits = String(numFrames).length;
  const activeFrame = typeof frameIndex === 'number' ? frames[frameIndex] : null;
  const componentByViewUid = useMemo(
    () => Object.fromEntries(views.map(view => [view.uid, view.component])),
    [views],
  );
  // Also list shapes for views which are no longer annotatable (e.g., removed from the layout),
  // so that they can still be edited or removed.
  const shapeViewUids = activeFrame
    ? [...new Set([
      ...views.map(view => view.uid),
      ...(activeFrame.layout || []).map(view => view.uid),
    ])].filter(viewUid => getFrameViewShapes(activeFrame, viewUid).length > 0)
    : [];

  function selectFrame(nextFrameIndex) {
    cancelDrawing();
    setSelectedShape(null);
    onFrameIndexChange(nextFrameIndex);
  }

  function handleAddFrame() {
    const insertIndex = typeof frameIndex === 'number' ? frameIndex + 1 : numFrames;
    onStoryChange(insertFrame(story, insertIndex));
    selectFrame(insertIndex);
  }

  function handleDuplicateFrame(i) {
    onStoryChange(duplicateFrame(story, i));
    selectFrame(i + 1);
  }

  function handleRemoveFrame(i) {
    onStoryChange(removeFrame(story, i));
    selectFrame(getFrameIndexAfterRemove(frameIndex, i, numFrames - 1));
  }

  function handleMoveFrame(i, toIndex) {
    onStoryChange(moveFrame(story, i, toIndex));
    onFrameIndexChange(getFrameIndexAfterMove(frameIndex, i, toIndex));
  }

  // Capture one or more views at once, as a single story update.
  function handleCapture(coordinationTypesByView) {
    const nextStory = Object.entries(coordinationTypesByView)
      .reduce((prevStory, [viewUid, coordinationTypes]) => setFrameViewCoordinationValues(
        prevStory, frameIndex, viewUid, getViewCoordinationValues(viewUid, coordinationTypes),
      ), story);
    onStoryChange(nextStory);
  }

  function handleToolClick(type) {
    setActiveTool(activeTool === type ? null : type);
  }

  function handleCopyJson() {
    navigator.clipboard?.writeText(JSON.stringify(story, null, 2)).then(confirmCopy);
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = STORY_JSON_FILENAME;
    a.click();
    URL.revokeObjectURL(url);
    confirmDownload();
  }

  let drawingHint = 'Select a tool, then click in a view to draw.';
  if (activeTool && MULTI_POINT_TOOLS.includes(activeTool)) {
    drawingHint = drawing
      ? `${drawing.vertices.length} point(s). Press Enter or Finish when done.`
      : 'Click in a view to place points.';
  } else if (activeTool) {
    drawingHint = drawing ? 'Click to place the second point.' : 'Click in a view to place the first point.';
  }

  return (
    <div className={classes.root}>
      <div className={classes.editHeader}>
        <span className={classes.editTitle}>Edit story</span>
        {validationMessage ? (
          <Tooltip title={`The story does not conform to the schema: ${validationMessage}`}>
            <Warning color="warning" className={classes.headerIcon} />
          </Tooltip>
        ) : null}
        <Tooltip title={isCopyConfirmed ? 'Copied' : 'Copy story JSON to clipboard'}>
          <IconButton size="small" onClick={handleCopyJson} aria-label="Copy story JSON">
            {isCopyConfirmed
              ? <Check className={cx(classes.headerIcon, classes.confirmed)} />
              : <ContentCopy className={classes.headerIcon} />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isDownloadConfirmed ? 'Downloaded' : `Download ${STORY_JSON_FILENAME}`}>
          <IconButton size="small" onClick={handleDownloadJson} aria-label="Download story JSON">
            {isDownloadConfirmed
              ? <Check className={cx(classes.headerIcon, classes.confirmed)} />
              : <CloudDownload className={classes.headerIcon} />}
          </IconButton>
        </Tooltip>
        <Button size="small" variant="outlined" className={classes.annotationToolButton} onClick={onDone}>
          Done
        </Button>
      </div>

      <div className={classes.editBody}>
        <Section label="Story" isInitiallyOpen={false}>
          <TextFields
            title={story.title}
            description={story.description}
            descriptionType={story.descriptionType}
            titlePlaceholder="Story title"
            onChange={updates => onStoryChange(updateStory(story, updates))}
          />
        </Section>

        <Section
          label={`Frames${numFrames > 0 ? ` · ${numFrames}` : ''}`}
          action={(
            <Tooltip title="Add frame">
              <IconButton size="small" onClick={stopPropagation(handleAddFrame)} aria-label="Add frame">
                <Add fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        >
          <div className={classes.compactFrameList}>
            {numFrames === 0 ? (
              <div className={classes.hint}>No frames. Click + to add one.</div>
            ) : null}
            {frames.map((frame, i) => {
              const isActive = i === frameIndex;
              return (
                <div
                  key={frame.uid}
                  className={cx(
                    classes.frameRow, classes.compactFrameRow, isActive && classes.frameRowActive,
                  )}
                  onClick={() => selectFrame(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && selectFrame(i)}
                >
                  <span className={cx(classes.frameNumber, isActive && classes.frameNumberActive)}>
                    {String(i + 1).padStart(numDigits, '0')}
                  </span>
                  <span className={classes.frameRowTitle}>{frame.title || `Frame ${i + 1}`}</span>
                  <div className={classes.rowActions}>
                    <IconButton size="small" className={classes.smallIconButton} disabled={i === 0} onClick={stopPropagation(() => handleMoveFrame(i, i - 1))} aria-label="Move frame up">
                      <ArrowDropUp fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className={classes.smallIconButton} disabled={i === numFrames - 1} onClick={stopPropagation(() => handleMoveFrame(i, i + 1))} aria-label="Move frame down">
                      <ArrowDropDown fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className={classes.smallIconButton} onClick={stopPropagation(() => handleDuplicateFrame(i))} aria-label="Duplicate frame">
                      <AddToPhotos fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" className={classes.smallIconButton} onClick={stopPropagation(() => handleRemoveFrame(i))} aria-label="Delete frame">
                      <RemoveCircle fontSize="inherit" />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {activeFrame ? (
          <>
            <Section label="Frame details">
              <TextFields
                title={activeFrame.title}
                description={activeFrame.description}
                descriptionType={activeFrame.descriptionType}
                titlePlaceholder={`Frame ${frameIndex + 1}`}
                onChange={updates => onStoryChange(updateFrame(story, frameIndex, updates))}
              />
            </Section>

            <Section label="View state">
              <div className={classes.sectionFields}>
                <FrameCaptureEditor
                  frame={activeFrame}
                  views={views}
                  onCapture={handleCapture}
                />
              </div>
            </Section>

            <Section label="Shapes">
              <div className={classes.toolPalette}>
                {TOOLS.map(({ type, label }) => (
                  <Button
                    key={type}
                    size="small"
                    variant={activeTool === type ? 'contained' : 'outlined'}
                    className={classes.annotationToolButton}
                    onClick={() => handleToolClick(type)}
                    startIcon={<ShapeIcon type={type} size={12} />}
                    disabled={views.length === 0}
                    aria-pressed={activeTool === type}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <div className={classes.drawingStatus}>
                <span>{drawingHint}</span>
                {drawing && MULTI_POINT_TOOLS.includes(drawing.type) ? (
                  <Button size="small" className={classes.optionButton} onClick={finishDrawing}>Finish</Button>
                ) : null}
                {drawing ? (
                  <Button size="small" className={classes.optionButton} onClick={cancelDrawing}>Cancel</Button>
                ) : null}
              </div>
              {shapeViewUids.length === 0 ? (
                <div className={classes.hint}>This frame has no shapes.</div>
              ) : null}
              {shapeViewUids.map(viewUid => (
                <div key={viewUid}>
                  <div className={classes.shapeViewLabel}>{viewUid}</div>
                  {getFrameViewShapes(activeFrame, viewUid).map((shape) => {
                    const isSelected = selectedShape?.viewUid === viewUid
                      && selectedShape?.shapeUid === shape.uid;
                    const isVisible = shape.visible !== false;
                    const toggleSelected = () => setSelectedShape(
                      isSelected ? null : { viewUid, shapeUid: shape.uid },
                    );
                    return (
                      <div key={shape.uid}>
                        <div
                          className={cx(
                            classes.shapeRow,
                            isSelected && classes.shapeRowSelected,
                            !isVisible && classes.shapeRowHidden,
                          )}
                          onClick={toggleSelected}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          onKeyDown={e => e.key === 'Enter' && toggleSelected()}
                        >
                          <ShapeIcon type={shape.type} size={12} />
                          <span className={classes.shapeLabel}>{shape.text ? `"${shape.text}"` : shape.type}</span>
                          <div className={classes.rowActions}>
                            <IconButton
                              size="small"
                              className={classes.smallIconButton}
                              onClick={stopPropagation(() => onStoryChange(updateShape(
                                story, frameIndex, viewUid, shape.uid,
                                { visible: isVisible ? false : undefined },
                              )))}
                              aria-label={isVisible ? 'Hide shape' : 'Show shape'}
                            >
                              {isVisible ? <Visibility fontSize="inherit" /> : <VisibilityOff fontSize="inherit" />}
                            </IconButton>
                            <IconButton
                              size="small"
                              className={classes.smallIconButton}
                              onClick={stopPropagation(() => {
                                if (isSelected) setSelectedShape(null);
                                onStoryChange(removeShape(story, frameIndex, viewUid, shape.uid));
                              })}
                              aria-label="Delete shape"
                            >
                              <RemoveCircle fontSize="inherit" />
                            </IconButton>
                          </div>
                        </div>
                        {isSelected ? (
                          <ShapeEditor
                            key={shape.uid}
                            shape={shape}
                            viewType={componentByViewUid[viewUid]}
                            frames={frames}
                            frameIndex={frameIndex}
                            onUpdate={updates => onStoryChange(
                              updateShape(story, frameIndex, viewUid, shape.uid, updates),
                            )}
                            onCopyToFrame={toFrameIndex => onStoryChange(
                              copyShapeToFrame(story, frameIndex, viewUid, shape.uid, toFrameIndex),
                            )}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </Section>
          </>
        ) : (
          <div className={classes.hint}>
            {numFrames > 0 ? 'Select a frame to edit its details, view state, and shapes.' : null}
          </div>
        )}
      </div>
    </div>
  );
}
