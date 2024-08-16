import React from 'react';
import { IconButton } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { useHelpStyles } from './help-overlay-styles.js';

export function HelpOverlay({ helpOverlayText, onHandleCloseOverlay }) {
  const classes = useHelpStyles();

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={classes.overlay}
      onClick={onHandleCloseOverlay}
      onKeyDown={onHandleCloseOverlay}
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
