import React from 'react';
import {
  Button,
  Typography,
  MenuBook,
} from '@vitessce/styles';
import { AnnotationText } from './AnnotationText.js';
import { EditButton } from './EditButton.js';
import { useStyles } from './styles.js';

/**
 * The story overview, shown when no frame is active.
 */
export function StoryOverview(props) {
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
