import React, { useCallback } from 'react';

import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import debounce from 'lodash/debounce';

import { useExpansionPanelStyles } from './styles';

export default function VectorLayerController(props) {
  const {
    label,
    layer,
    handleLayerChange,
  } = props;

  const slider = layer.opacity;
  const isOn = layer.visible;

  function handleSliderChange(v) {
    handleLayerChange({ ...layer, opacity: v });
  }

  function handleCheckBoxChange(v) {
    handleLayerChange({ ...layer, visible: v });
  }

  const handleSliderChangeDebounced = useCallback(
    debounce(handleSliderChange, 3, { trailing: true }),
    [isOn],
  );

  const classes = useExpansionPanelStyles();
  return (
    <Grid item style={{ marginTop: '10px' }}>
      <Paper className={classes.root}>
        <Typography
          style={{
            paddingTop: '15px',
            paddingLeft: '10px',
            marginBottom: '-5px',
          }}
        >
          {label}
        </Typography>
        <Grid container direction="row" justify="space-between">
          <Grid item xs={2}>
            <Checkbox color="primary" checked={isOn} onChange={(e, v) => handleCheckBoxChange(v)} />
          </Grid>
          <Grid item xs={9} style={{ paddingRight: '8px' }}>
            <Slider
              value={slider}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, v) => handleSliderChangeDebounced(v)}
              style={{ marginTop: '7px' }}
              orientation="horizontal"
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
