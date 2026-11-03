import React from 'react';
import { useId } from 'react-aria';
import {
  Checkbox,
  TableCell,
  TableRow,
  makeStyles,
} from '@vitessce/styles';
import { OptionsContainer, OptionSelect, usePlotOptionsStyles } from '@vitessce/vit-s';

const useStyles = makeStyles()(() => ({
  spatialBetaCameraLabel: {
    padding: '0px 0px 0px 16px',
  },
  spatialBetaToggleBox: {
    padding: '0px',
  },
}));

// Choices for the number of bricks fetched at once. The current value is
// added when it is not among them, e.g. when set by the view config.
const MAX_CONCURRENT_BRICK_REQUEST_OPTIONS = [6, 8, 10, 12, 24, 48, 96];

function getMaxConcurrentBrickRequestOptions(value) {
  const isListed = MAX_CONCURRENT_BRICK_REQUEST_OPTIONS.includes(value);
  const isValid = value === Infinity || (Number.isInteger(value) && value > 0);
  return isListed || !isValid
    ? MAX_CONCURRENT_BRICK_REQUEST_OPTIONS
    : [...MAX_CONCURRENT_BRICK_REQUEST_OPTIONS, value].sort((a, b) => a - b);
}

/**
 * Plot options for the beta spatial view.
 *
 * The camera-axis toggle, which the legacy spatial view exposed in the same
 * place (see SpatialOptions in @vitessce/spatial). Without it,
 * spatialAxisFixed cannot be set: the orbit target then moves on every pan while
 * rotating a volume, and there is no way back to a previous orientation.
 *
 * This belongs to the spatial view rather than the layer controller because
 * spatialAxisFixed describes *this* view's camera. It is in
 * AUTO_INDEPENDENT_COORDINATION_TYPES, so under `initStrategy: 'auto'` every view
 * gets its own scope for it, and a control living in the layer controller would
 * write to a scope the spatial view never reads.
 *
 * It is read in AbstractSpatialOrScatterplot.onViewStateChange, so it only
 * applies to the DeckGL renderer. The three.js-based renderers ignore it, so
 * the toggle is hidden (hasCameraAxisOption: false) while they are in use.
 *
 * With the accelerated 3D view (hasVolumeLoadingOptions), also its brick loading
 * options: whether to skip intermediate resolutions, and the maximum number of
 * bricks fetched at once. They correspond to the volumeProgressiveLoading and
 * volumeMaxConcurrentBrickRequests props of the view. The "Skip Intermediate
 * Resolutions" checkbox is the inverse of volumeProgressiveLoading: when it is
 * checked, the view jumps from the overview to full resolution instead of
 * refining one level at a time (coarse-to-fine).
 */
export default function SpatialOptions(props) {
  const {
    spatialAxisFixed,
    setSpatialAxisFixed,
    use3d,
    hasCameraAxisOption = true,
    hasVolumeLoadingOptions = false,
    volumeMaxConcurrentBrickRequests,
    setVolumeMaxConcurrentBrickRequests,
    volumeProgressiveLoading,
    setVolumeProgressiveLoading,
  } = props;

  const optionsId = useId();
  const { classes } = useStyles();
  const { classes: plotOptionsClasses } = usePlotOptionsStyles();

  function handleMaxConcurrentBrickRequestsChange(event) {
    // Number('Infinity') is Infinity.
    setVolumeMaxConcurrentBrickRequests(Number(event.target.value));
  }

  return (
    <OptionsContainer>
      {hasCameraAxisOption ? (
        <TableRow>
          <TableCell className={classes.spatialBetaCameraLabel} variant="head" scope="row">
            <label htmlFor={`spatial-camera-axis-${optionsId}`}>
              Fix Camera Axis
            </label>
          </TableCell>
          <TableCell className={classes.spatialBetaToggleBox} variant="body">
            <Checkbox
              onClick={() => setSpatialAxisFixed(!spatialAxisFixed)}
              disabled={!use3d}
              checked={Boolean(spatialAxisFixed)}
              slotProps={{ input: {
                'aria-label': 'Fix or not fix spatial camera axis',
                id: `spatial-camera-axis-${optionsId}`,
              } }}
            />
          </TableCell>
        </TableRow>
      ) : null}
      {hasVolumeLoadingOptions ? (
        <>
          <TableRow>
            <TableCell className={classes.spatialBetaCameraLabel} variant="head" scope="row">
              <label htmlFor={`spatial-volume-progressive-loading-${optionsId}`}>
                Skip Intermediate Resolutions
              </label>
            </TableCell>
            <TableCell className={classes.spatialBetaToggleBox} variant="body">
              <Checkbox
                onChange={event => setVolumeProgressiveLoading(!event.target.checked)}
                disabled={!use3d}
                checked={Boolean(!volumeProgressiveLoading)}
                slotProps={{ input: {
                  'aria-label': 'Skip intermediate volume resolutions instead of loading coarser ones before finer ones',
                  id: `spatial-volume-progressive-loading-${optionsId}`,
                } }}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.spatialBetaCameraLabel} variant="head" scope="row">
              <label htmlFor={`spatial-volume-max-concurrent-bricks-${optionsId}`}>
                Max Concurrent Brick Requests
              </label>
            </TableCell>
            <TableCell variant="body">
              <OptionSelect
                className={plotOptionsClasses.select}
                value={String(volumeMaxConcurrentBrickRequests)}
                onChange={handleMaxConcurrentBrickRequestsChange}
                disabled={!use3d}
                inputProps={{
                  'aria-label': 'Maximum number of volume bricks fetched at once',
                  id: `spatial-volume-max-concurrent-bricks-${optionsId}`,
                }}
              >
                {getMaxConcurrentBrickRequestOptions(volumeMaxConcurrentBrickRequests)
                  .map(option => (
                    <option key={option} value={String(option)}>
                      {option === Infinity ? 'No limit' : option}
                    </option>
                  ))}
              </OptionSelect>
            </TableCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
