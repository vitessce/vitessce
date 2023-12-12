import React from 'react';
import { makeStyles } from '@mui/styles';
import { CircularProgress } from '@mui/material';

const useStyles = makeStyles(() => ({
  loadingIndicatorBackdrop: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '1040',
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    backgroundColor: '#f2f7f8',
  },
  loadingIndicatorContainer: {
    display: 'grid',
    placeItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  visuallyHidden: {
    position: 'absolute',
    height: '1px',
    width: '1px',
    overflow: 'hidden',
    clip: 'rect(1px, 1px, 1px, 1px)',
    whiteSpace: 'nowrap',
  },
}));

export default function LoadingIndicator() {
  const classes = useStyles();
  return (
    <div className={classes.loadingIndicatorBackdrop}>
      <div className={classes.loadingIndicatorContainer} role="status" aria-live="polite">
        <CircularProgress color="secondary" />
        <span className={classes.visuallyHidden}>Loading...</span>
      </div>
    </div>
  );
}
