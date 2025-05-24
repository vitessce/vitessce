import React from 'react';
import {
  makeStyles,
  Grid,
  Paper,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@vitessce/styles';
import {
  DimensionsSVG,
} from '@vitessce/icons';
import { useControllerSectionStyles } from './styles.js';


const useStyles = makeStyles()(theme => ({
  dimensionsIcon: {
    height: '40px',
    width: '40px',
    '& path': {
      fill: theme.palette.primaryForeground,
    },
  },
  switchFormGroup: {
    float: 'right',
    marginTop: '3px',
  },
  dimensionLabel: {
    padding: 0,
    marginBottom: '0 !important',
    marginTop: '12px !important',
  },
  dimensionSlider: {
    marginTop: '9px',
  },
}));

export default function GlobalDimensionSlider(props) {
  const {
    label,
    targetValue,
    setTargetValue,
    min = 0,
    max = 0,
    spatialRenderingMode = null,
    setSpatialRenderingMode = null,
  } = props;

  const { classes: lcClasses } = useControllerSectionStyles();
  const { classes } = useStyles();
  const isForZ = spatialRenderingMode !== null;

  function handleRenderingModeChange(event) {
    setSpatialRenderingMode(event.target.checked ? '3D' : '2D');
    if (!event.target.checked) {
      // From 3D to 2D
      // Need to make sure that the targetZ is an integer
      setTargetValue(Math.floor(targetValue));
    }
  }

  return (
    <Grid className={lcClasses.layerControllerGrid}>
      <Paper elevation={4} className={lcClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid size={1}>
            <DimensionsSVG className={classes.dimensionsIcon} />
          </Grid>
          <Grid size={1}>
            <Typography className={classes.dimensionLabel}>
              {label}
            </Typography>
          </Grid>
          <Grid size={8}>
            <Slider
              value={targetValue}
              min={min}
              max={max}
              step={1}
              onChange={(e, v) => setTargetValue(v)}
              className={classes.dimensionSlider}
              valueLabelDisplay="auto"
              orientation="horizontal"
              disabled={spatialRenderingMode === '3D'}
              aria-label={`${label}-slice slider`}
            />
          </Grid>
          <Grid size={2}>
            {isForZ ? (
              <FormGroup row className={classes.switchFormGroup}>
                <FormControlLabel
                  control={<Switch color="primary" checked={spatialRenderingMode === '3D'} onChange={handleRenderingModeChange} name="is3dMode" />}
                  label="3D"
                />
              </FormGroup>
            ) : null}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
