import React from 'react';
import {
  makeStyles,
  Grid,
  Typography,
  LinearProgress,
  Button,
  Chip,
  CloudDownload,
  Stop,
  Replay,
} from '@vitessce/styles';


const useStyles = makeStyles()(() => ({
  statusChip: {
    marginTop: '8px',
  },
  loadingBar: {
    marginTop: '8px',
    marginBottom: '8px',
  },
  statusText: {
    marginTop: '12px',
    marginBottom: '0 !important',
  },
}));

export default function LoadingStatusIndicator(props) {
  const {
    loadingProgress,
    onStopLoading,
    onRestartLoading,
    stillRef,
    spatialRenderingMode,
  } = props;


  const { classes } = useStyles();

  // Only show in 3D mode
  const is3dMode = spatialRenderingMode === '3D';

  if (!is3dMode || !loadingProgress) {
    return null;
  }

  const {
    bricksLoaded = 0,
    currentRequestCount = 0,
    totalBricksRequested = 0,
    isLoading = false,
    percentage = 0,
    noNewRequests = false,
  } = loadingProgress || {};

  // Determine status
  let statusColor = 'default';
  let statusLabel = 'Idle';

  if (isLoading) {
    statusColor = 'primary';
    statusLabel = 'Loading Data';
  } else if (stillRef) {
    statusColor = 'success';
    statusLabel = 'High Quality';
  } else if (noNewRequests) {
    statusColor = 'warning';
    statusLabel = 'Loading Stopped';
  } else {
    statusColor = 'success';
    statusLabel = 'Ready';
  }

  return (
    <Grid container direction="column" justifyContent="space-between" alignItems="stretch">
      <Grid container direction="row" alignItems="center">
        <Grid size={1}>
          <CloudDownload />
        </Grid>
        <Grid size={5}>
          <Chip
            label={statusLabel}
            color={statusColor}
            size="small"
            className={classes.statusChip}
          />
        </Grid>
        <Grid size={6}>
          <Typography variant="body2" className={classes.statusText}>
            Bricks loaded: {bricksLoaded}
            {isLoading && totalBricksRequested > 0 && (
            <span> ({totalBricksRequested - currentRequestCount}/{totalBricksRequested})</span>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Grid size={12}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{ visibility: isLoading ? 'visible' : 'hidden', '& > button': { flexGrow: 1 } }}
        />
        <Grid container direction="row" spacing={2} alignItems="center" className={classes.buttonGroup}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Stop />}
            onClick={onStopLoading}
            disabled={noNewRequests}
            aria-label="Stop loading data and render at highest resolution"
            fullWidth
          >
            Stop Loading
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Replay />}
            onClick={onRestartLoading}
            disabled={!noNewRequests && !isLoading}
            aria-label="Restart data loading"
            fullWidth
          >
            Restart Loading
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
