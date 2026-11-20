import React from 'react';
import {
  Grid,
  LinearProgress,
  Button,
  Chip,
  Box,
  Tooltip,
  Pause,
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
    statusLabel = 'Loading';
  } else if (stillRef) {
    statusColor = 'success';
    statusLabel = 'High Quality';
  } else if (noNewRequests) {
    statusColor = 'warning';
    statusLabel = 'Loading Paused';
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

function LoadingControlButton({ startIcon, onClick, disabled, tooltip, children }) {
  // A disabled button fires no mouse events, so the Tooltip listens on a
  // wrapping element instead, and shows the explanation in either state.
  // The wrapper has a fixed half width, so the button stays put as the
  // status chip beside it appears and disappears.
  return (
    <Tooltip title={tooltip} placement="top" describeChild>
      <Box component="span" sx={{ flex: '0 0 50%', display: 'flex' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={startIcon}
          onClick={onClick}
          disabled={disabled}
          fullWidth
        >
          {children}
        </Button>
      </Box>
    </Tooltip>
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
    totalBricksRequested = 0,
    isLoading = false,
    percentage = 0,
    noNewRequests = false,
    isManuallyStopped = false,
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
    <Grid
      container
      sx={{
        px: 0.5,
      }}
    >
      <Grid size={12}>
        <Grid
          container
          direction="row"
          wrap="nowrap"
          sx={{
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isManuallyStopped ? (
            <LoadingControlButton
              startIcon={<Replay />}
              onClick={onRestartLoading}
              tooltip="Resume fetching data."
            >
              Resume&nbsp;Loading
            </LoadingControlButton>
          ) : (
            // Disabled once nothing is left to load.
            <LoadingControlButton
              startIcon={<Pause />}
              onClick={onStopLoading}
              disabled={noNewRequests}
              tooltip="Stop fetching data. Rendering will then use only the data that has already been loaded (until loading resumes)."
            >
              Pause&nbsp;Loading
            </LoadingControlButton>
          )}
          {statusColor !== 'success' ? (
            <StatusChip
              label={statusLabel}
              color={statusColor}
            />
          ) : null}
        </Grid>
      </Grid>
      <Grid
        size={12}
        sx={{
          visibility: isLoading ? 'visible' : 'hidden',
          mt: 1,
          mb: 0.5,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={percentage}
        />
      </Grid>
    </Grid>
  );
}
