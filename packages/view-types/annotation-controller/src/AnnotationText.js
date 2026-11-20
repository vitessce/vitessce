import React from 'react';
import { DescriptionType } from '@vitessce/constants-internal';
import Markdown from 'react-markdown';
import { useStyles } from './styles.js';

export function AnnotationText(props) {
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
