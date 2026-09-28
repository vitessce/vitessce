import React from 'react';
import { makeStyles } from '@vitessce/styles';
import Markdown from 'react-markdown';
import { DescriptionType } from '@vitessce/constants-internal';

const useStyles = makeStyles()(theme => ({
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
}));

// TODO: Implement a minimal annotation controller view (render the text (story title/desc, frame title/desc, show frame list and allow navigating forward/back or to a specific frame)

export default function AnnotationController(props) {
  const {
    story,
    frameIndex,
    setFrameIndex,
  } = props;
  const { classes } = useStyles();
  return (
    <div>

    </div>
  );
}
