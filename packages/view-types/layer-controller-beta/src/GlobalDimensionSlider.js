/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  makeStyles,
  Grid,
  Checkbox,
  Paper,
  Typography,
  Slider,
  MenuItem,
  Button,
  SvgIcon,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@material-ui/core';

import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@material-ui/icons';
import {
  DimensionsSVG,
} from '@vitessce/icons';
import { useControllerSectionStyles } from './styles.js';


const useStyles = makeStyles(theme => ({
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

  const lcClasses = useControllerSectionStyles();
  const classes = useStyles();
  const isForZ = spatialRenderingMode !== null;

  function handleRenderingModeChange(event) {
    setSpatialRenderingMode(event.target.checked ? '3D' : '2D');
  }

  return (
    <Grid item style={{ marginTop: '10px' }}>
      <Paper className={lcClasses.layerControllerRoot}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item xs={1}>
            <DimensionsSVG className={classes.dimensionsIcon} />
          </Grid>
          <Grid item xs={1}>
            <Typography
              style={{
                padding: 0,
                marginBottom: 0,
                marginTop: '12px',
              }}
            >
              {label}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Slider
              value={targetValue}
              min={min}
              max={max}
              step={1}
              onChange={(e, v) => setTargetValue(v)}
              style={{ marginTop: '9px' }}
              valueLabelDisplay="auto"
              orientation="horizontal"
              disabled={spatialRenderingMode === '3D'}
            />
          </Grid>
          <Grid item xs={2}>
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
