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

function ChannelSelectionDropdown({
  selectionIndex,
  handleChange,
  disableOptions,
  channelOptions,
}) {
  return (
    <Select
      native
      value={selectionIndex}
      onChange={e => handleChange(Number(e.target.value))}
    >
      {channelOptions.map((opt, i) => (
        <option disabled={disableOptions} key={opt} value={i}>
          {opt}
        </option>
      ))}
    </Select>
  );
}

function ChannelSlider({ color, slider, handleChange }) {
  return (
    <Slider
      value={slider}
      onChange={(e, v) => handleChange(v)}
      valueLabelDisplay="auto"
      getAriaLabel={() => `${color}-${slider}`}
      min={MIN_SLIDER_VALUE}
      max={MAX_SLIDER_VALUE}
      orientation="horizontal"
      style={{ color, marginTop: '7px' }}
    />
  );
}

function ChannelVisibilityCheckbox({ color, checked, toggle }) {
  return (
    <Checkbox
      onChange={toggle}
      checked={checked}
      style={{ color, '&$checked': { color } }}
    />
  );
}

function ChannelController({
  visibility,
  slider,
  color,
  dimName,
  selectionIndex,
  colormapOn,
  channelOptions,
  handlePropertyChange,
  handleChannelRemove,
  disableOptions = false,
}) {
  const rgbColor = toRgb(colormapOn, color);
  const classes = useStyles();
  const createSelection = index => ({ [dimName]: index });
  return (
    <Grid container direction="column" m={1} justify="center">
      <Grid container direction="row" justify="space-between">
        <Grid item xs={10}>
          <ChannelSelectionDropdown
            selectionIndex={selectionIndex}
            handleChange={v => handlePropertyChange('selection', createSelection(v))}
            disableOptions={disableOptions}
            channelOptions={channelOptions}
          />
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
          <ChannelVisibilityCheckbox
            color={rgbColor}
            checked={visibility}
            toggle={() => handlePropertyChange('visibility')}
          />
        </Grid>
        <Grid item xs={9}>
          <ChannelSlider
            color={rgbColor}
            slider={slider}
            handleChange={v => handlePropertyChange('slider', v)}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ChannelController;
