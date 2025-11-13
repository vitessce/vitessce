import React from 'react';
import {
  Grid,
  Typography,
  LinearProgress,
  Button,
  Chip,
  CloudDownload,
  Stop,
  Replay,
} from '@vitessce/styles';


function useStatusChipProps(isLoading, stillRef, noNewRequests, initializing) {
  // Determine status
  let statusColor = 'default';
  let statusLabel = 'Idle';

  if (initializing) {
    statusColor = 'warning';
    statusLabel = 'Initializing';
  } else if (isLoading) {
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
  return { statusColor, statusLabel };
}

function StatusChip({ label, color }) {
  return (
    <Chip
      label={label}
      color={color}
      size="small"
    />
  );
}

function LoadingControlButton({ startIcon, onClick, disabled, ariaLabel, children }) {
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={startIcon}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      fullWidth
    >
      {children}
    </Button>
  );
}

function LoadingText({ bricksLoaded, currentRequestCount, totalBricksRequested, isLoading }) {
  return (
    <Typography variant="body2">
      Bricks loaded: {bricksLoaded}
      {isLoading && totalBricksRequested > 0 && ` (${totalBricksRequested - currentRequestCount}/${totalBricksRequested})`}
    </Typography>
  );
}

export default function LoadingStatusIndicator(props) {
  const {
    loadingProgress,
    onStopLoading,
    onRestartLoading,
    stillRef,
    spatialRenderingMode,
  } = props;

  const {
    bricksLoaded = 0,
    currentRequestCount = 0,
    totalBricksRequested = 0,
    isLoading = false,
    percentage = 0,
    noNewRequests = false,
  } = loadingProgress || {};

  const initializing = !loadingProgress || (bricksLoaded === 0 && totalBricksRequested === 0);

  const { statusColor, statusLabel } = useStatusChipProps(
    isLoading, stillRef, noNewRequests, initializing,
  );

  // Only show in 3D mode
  const is3dMode = spatialRenderingMode === '3D';

  if (!is3dMode || !loadingProgress) {
    return null;
  }


  return (
    <Grid container px={0.5}>
      <Grid size={6} alignItems="start">
        <Grid container alignItems="center" gap={1}>
          <CloudDownload />
          <StatusChip
            label={statusLabel}
            color={statusColor}
            size="small"
          />
        </Grid>
      </Grid>
      <Grid size={6} px={1} my={0.25}>
        <LoadingText
          bricksLoaded={bricksLoaded}
          currentRequestCount={currentRequestCount}
          totalBricksRequested={totalBricksRequested}
          isLoading={isLoading}
        />
      </Grid>
      <Grid size={12}>
        <Grid container direction="row" spacing={2} alignItems="center" wrap="nowrap">
          <LoadingControlButton
            startIcon={<Stop />}
            onClick={onStopLoading}
            disabled={noNewRequests}
            ariaLabel="Stop loading data and render at highest resolution"
          >
            Stop&nbsp;Loading
          </LoadingControlButton>
          <LoadingControlButton
            startIcon={<Replay />}
            onClick={onRestartLoading}
            disabled={!noNewRequests && !isLoading}
            ariaLabel="Restart data loading"
          >
            Restart&nbsp;Loading
          </LoadingControlButton>
        </Grid>
      </Grid>
      <Grid size={12} visibility={isLoading ? 'visible' : 'hidden'} mt={1} mb={0.5}>
        <LinearProgress
          variant="determinate"
          value={percentage}
        />
      </Grid>
    </Grid>
  );
}
