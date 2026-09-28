import React from 'react';
import {
  makeStyles,
  Button,
  MenuList,
  MenuItem,
  ListItemText,
  Typography,
  ArrowLeft,
  ArrowRight,
} from '@vitessce/styles';
import Markdown from 'react-markdown';
import { DescriptionType } from '@vitessce/constants-internal';

const useStyles = makeStyles()(theme => ({
  textSection: {
    padding: '6px 10px',
  },
  annotationMarkdown: {
    '& p, details, table': {
      fontSize: '80%',
      opacity: '0.8',
    },
    '& details': {
      marginBottom: '6px',
    },
    '& summary': {
      // TODO(monorepo): lighten color by 10%
      borderBottom: `1px solid ${theme.palette.primaryBackground}`,
      cursor: 'pointer',
    },
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px',
    borderTop: `1px solid ${theme.palette.primaryBackground}`,
    borderBottom: `1px solid ${theme.palette.primaryBackground}`,
  },
}));

function AnnotationText(props) {
  const { text, textType } = props;
  const { classes } = useStyles();
  if (!text) {
    return null;
  }
  return (
    <div className={classes.annotationMarkdown}>
      {textType === DescriptionType.MARKDOWN
        ? <Markdown>{text}</Markdown>
        : <p>{text}</p>}
    </div>
  );
}

/**
 * A minimal annotation story controller.
 * Renders the story and current frame text, along with
 * controls to navigate between frames.
 * @param {object} props
 * @param {object|null} props.story The annotation story object.
 * @param {number|null} props.frameIndex The index of the current frame,
 * or null if no frame is active.
 * @param {function} props.setFrameIndex Setter for the current frame index.
 */
export function AnnotationController(props) {
  const {
    story,
    frameIndex,
    setFrameIndex,
  } = props;
  const { classes } = useStyles();

  if (!story) {
    return (
      <div className={classes.textSection}>
        <Typography variant="body2">No annotation story has been loaded.</Typography>
      </div>
    );
  }

  const frames = story.frames || [];
  const numFrames = frames.length;
  const hasFrameIndex = typeof frameIndex === 'number';
  const currentFrame = hasFrameIndex ? frames[frameIndex] : null;

  // Navigating back from the first frame returns to the story overview,
  // where no frame is active.
  const canGoBack = hasFrameIndex;
  const canGoForward = hasFrameIndex ? frameIndex < numFrames - 1 : numFrames > 0;

  function goBack() {
    setFrameIndex(frameIndex > 0 ? frameIndex - 1 : null);
  }

  function goForward() {
    setFrameIndex(hasFrameIndex ? frameIndex + 1 : 0);
  }

  const frameLabel = hasFrameIndex
    ? `Frame ${frameIndex + 1} of ${numFrames}`
    : `Overview (${numFrames} frames)`;

  return (
    <div>
      <div className={classes.textSection}>
        {story.title ? <Typography variant="h6">{story.title}</Typography> : null}
        <AnnotationText text={story.description} textType={story.descriptionType} />
      </div>
      <div className={classes.navigation}>
        <Button
          size="small"
          onClick={goBack}
          disabled={!canGoBack}
          startIcon={<ArrowLeft />}
        >
          Previous
        </Button>
        <Typography variant="body2">{frameLabel}</Typography>
        <Button
          size="small"
          onClick={goForward}
          disabled={!canGoForward}
          endIcon={<ArrowRight />}
        >
          Next
        </Button>
      </div>
      {currentFrame ? (
        <div className={classes.textSection}>
          {currentFrame.title
            ? <Typography variant="subtitle1">{currentFrame.title}</Typography>
            : null}
          <AnnotationText
            text={currentFrame.description}
            textType={currentFrame.descriptionType}
          />
        </div>
      ) : null}
      <MenuList dense aria-label="Annotation frames">
        {frames.map((frame, i) => (
          <MenuItem
            key={frame.uid}
            selected={i === frameIndex}
            onClick={() => setFrameIndex(i)}
          >
            <ListItemText primary={`${i + 1}. ${frame.title || frame.uid}`} />
          </MenuItem>
        ))}
      </MenuList>
    </div>
  );
}
