import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Select from '@material-ui/core/Select';

import { makeStyles } from '@material-ui/core/styles';

import ChannelOptions from './ChannelOptions';

const MIN_SLIDER_VALUE = 0;
const MAX_SLIDER_VALUE = 65535;
const COLORMAP_SLIDER_CHECKBOX_COLOR = [220, 220, 220];

const toRgb = (on, arr) => {
  const color = on ? COLORMAP_SLIDER_CHECKBOX_COLOR : arr;
  return `rgb(${color})`;
};

const useStyles = makeStyles(() => ({
  options: {
    marginTop: '4px',
  },
}));

function ChannelController({
  name,
  isOn,
  sliderValue,
  colorValue,
  colormapOn,
  channelOptions,
  handlePropertyChange,
  handleChannelRemove,
  disableOptions = false,
}) {
  const rgbColor = toRgb(colormapOn, colorValue);
  const classes = useStyles();
  return (
    <Grid
      container
      direction="column"
      m={1}
      justify="center"
    >
      <Grid container direction="row" justify="space-between">
        <Grid item xs={10}>
          <Select
            native
            value={name}
            onChange={e => handlePropertyChange('selection', Number(e.target.value))}
          >
            {channelOptions.map((opt, i) => (
              <option disabled={disableOptions} key={opt} value={i}>
                {opt}
              </option>
            ))}
          </Select>
        </Grid>
        <Grid item xs={1} className={classes.options}>
          <ChannelOptions
            handlePropertyChange={handlePropertyChange}
            handleChannelRemove={handleChannelRemove}
          />
        </Grid>
      </Grid>
      <Grid container direction="row" justify="flex-start">
        <Grid item xs={2}>
          <Checkbox
            onChange={() => handlePropertyChange('visibility')}
            checked={isOn}
            style={{
              color: rgbColor,
              '&$checked': {
                color: rgbColor,
              },
            }}
          />
        </Grid>
        <Grid item xs={9}>
          <Slider
            value={sliderValue}
            onChange={(e, v) => handlePropertyChange('slider', v)}
            valueLabelDisplay="auto"
            getAriaLabel={() => `${name}-${colorValue}-${sliderValue}`}
            min={MIN_SLIDER_VALUE}
            max={MAX_SLIDER_VALUE}
            orientation="horizontal"
            style={{
              color: rgbColor,
              marginTop: '7px',
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ChannelController;
