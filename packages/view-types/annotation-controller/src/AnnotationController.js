/**
 * Attribution: Originally written by @RPSeaman
 * Reference: https://github.com/vitessce/vitessce/pull/2528
 */
import React from 'react';
import {
  Button,
  Typography,
  Edit,
} from '@vitessce/styles';
import { AnnotationStoryEditor } from './AnnotationStoryEditor.js';
import { StoryOverview } from './StoryOverview.js';
import { StoryPlayer } from './StoryPlayer.js';
import { useStyles } from './styles.js';

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
