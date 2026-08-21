import React from 'react';
import { useId } from 'react-aria';
import {
  Checkbox,
  TableCell,
  TableRow,
  makeStyles,
} from '@vitessce/styles';
import { OptionsContainer } from '@vitessce/vit-s';

const useStyles = makeStyles()(() => ({
  spatialBetaCameraLabel: {
    padding: '0px 0px 0px 16px',
  },
  spatialBetaToggleBox: {
    padding: '0px',
  },
}));

/**
 * Plot options for the beta spatial view.
 *
 * Currently just the camera-axis toggle, which the legacy spatial view exposed
 * in the same place (see SpatialOptions in @vitessce/spatial). Without it,
 * spatialAxisFixed cannot be set: the orbit target then moves on every pan while
 * rotating a volume, and there is no way back to a previous orientation.
 *
 * This belongs to the spatial view rather than the layer controller because
 * spatialAxisFixed describes *this* view's camera. It is in
 * AUTO_INDEPENDENT_COORDINATION_TYPES, so under `initStrategy: 'auto'` every view
 * gets its own scope for it, and a control living in the layer controller would
 * write to a scope the spatial view never reads.
 *
 * It is read in AbstractSpatialOrScatterplot.onViewStateChange.
 */
export default function SpatialOptions(props) {
  const {
    spatialAxisFixed,
    setSpatialAxisFixed,
    use3d,
  } = props;

  const toggleAxisId = useId();
  const { classes } = useStyles();

  return (
    <OptionsContainer>
      <TableRow>
        <TableCell className={classes.spatialBetaCameraLabel} variant="head" scope="row">
          <label htmlFor={`spatial-camera-axis-${toggleAxisId}`}>
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
              id: `spatial-camera-axis-${toggleAxisId}`,
            } }}
          />
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}
