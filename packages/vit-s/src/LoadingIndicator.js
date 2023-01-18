import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(() => ({
  loadingIndicatorBackdrop: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '1040',
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingIndicatorContainer: {
    display: 'grid',
    placeItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
}));

export default function LoadingIndicator() {
  const classes = useStyles();
  return (
    <div className={classes.loadingIndicatorBackdrop}>
      <div className={classes.loadingIndicatorContainer}>
        <CircularProgress />
      </div>
    </div>
  );
}
