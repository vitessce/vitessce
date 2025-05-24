import React from 'react';

import { Grid, Checkbox, Paper, Typography, Slider } from '@vitessce/styles';
import { useControllerSectionStyles } from './styles.js';

export default function VectorLayerController(props) {
  const {
    label,
    layer,
    layerType,
    handleLayerChange,
  } = props;

  const slider = layer.opacity;
  const isOn = layer.visible;

  function handleSliderChange(v) {
    if (layerType === 'cells') {
      const stroked = v < 0.7;
      handleLayerChange({ ...layer, opacity: v, stroked });
    } else {
      handleLayerChange({ ...layer, opacity: v });
    }
  }

  function handleCheckBoxChange(v) {
    handleLayerChange({ ...layer, visible: v });
  }

  const { classes } = useControllerSectionStyles();
  return (
    <Grid sx={{ marginTop: '10px' }}>
      <Paper elevation={4} className={classes.layerControllerRoot}>
        <Typography
          style={{
            padding: '15px 8px 0px 8px',
            marginBottom: '-5px',
          }}
        >
          {label}
        </Typography>
        <Grid container direction="row" justifyContent="space-between">
          <Grid size={2}>
            <Checkbox
              color="primary"
              checked={isOn}
              onChange={(e, v) => handleCheckBoxChange(v)}
              slotProps={{ input: { 'aria-label': 'Show or hide vector layer' } }}
            />
          </Grid>
          <Grid size={9} sx={{ paddingRight: '16px' }}>
            <Slider
              value={slider}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, v) => handleSliderChange(v)}
              style={{ marginTop: '7px' }}
              orientation="horizontal"
              getAriaLabel={(index) => {
                const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
                return `${labelPrefix} for ${label} layer controller`;
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
