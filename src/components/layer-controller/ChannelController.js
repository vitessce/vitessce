import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Select from '@material-ui/core/Select';

import ChannelOptions from './ChannelOptions';

const MIN_SLIDER_VALUE = 0;
const MAX_SLIDER_VALUE = 65535;
const COLORMAP_SLIDER_CHECKBOX_COLOR = [220, 220, 220];

const toRgb = (on, arr) => {
  const color = on ? COLORMAP_SLIDER_CHECKBOX_COLOR : arr;
  return `rgb(${color})`;
};

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
  dimValues,
  handlePropertyChange,
  handleChannelRemove,
  disableOptions = false,
}) {
  // eslint-disable-next-line
  const rgbColor = toRgb(colormapOn, color);
  /* A valid selection is defined by an object where the keys are
  *  the name of a dimension of the data, and the values are the
  *  index of the image along that particular dimension.
  *
  *  Since we currently only support making a selection along one
  *  addtional dimension (i.e. the dropdown just has channels or mz)
  *  we have a helper function to create the selection.
  *
  *  e.g { channel: 2 } // channel dimension, third channel
  */
  const createSelection = index => ({ [dimName]: dimValues[index] });
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
        <Grid item xs={1} style={{ marginTop: '4px' }}>
          <ChannelOptions
            handlePropertyChange={handlePropertyChange}
            handleChannelRemove={handleChannelRemove}
          />
        </Grid>
      </Grid>
      <Grid container direction="row" justify="space-between">
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
