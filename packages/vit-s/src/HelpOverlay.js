import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useTitleStyles } from './helpOverlay.styles.js';

export function HelpOverlay({ helpOverlayText, onHandleCloseOverlay }) {
  const classes = useTitleStyles();

  return (
    <div
      className={classes.overlay}
      onClick={onHandleCloseOverlay}
    >
      <div
        className={classes.overlayContent}
      >
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onHandleCloseOverlay}
        >
          <CloseIcon />
        </IconButton>
        <p>{helpOverlayText}</p>
      </div>
    </div>
  );
}
