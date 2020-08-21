import React, { useCallback } from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Select from '@material-ui/core/Select';
import debounce from 'lodash/debounce';

import ChannelOptions from './ChannelOptions';

// Returns an rgb string for display, and changes the color (arr)
// to use a grey for light theme + white color or if the colormap is on.
export const toRgbUIString = (on, arr, theme) => {
  const color = (on || (theme === 'light' && arr.every(i => i === 255))) ? [220, 220, 220] : arr;
  return `rgb(${color})`;
};

function truncateDecimalNumber(value) {
  const maxLength = 5;
  if (!value && value !== 0) return '';
  // Number whose display value as exponential has more than
  // maxLength characters with a decimal needs no decimal points for precision.
  if (value >= 1e10) {
    return value.toExponential(0);
  }
  // Number whose display value as exponential has less than
  // maxLength characters without a decimal can have a decimal point for precision.
  if (value >= eval(`1e${maxLength}`)) { // eslint-disable-line no-eval
    return value.toExponential(1);
  }
  // Truncate small numbers with long decimal expansions.
  const stringValue = value.toString();
  return stringValue.length > maxLength
    ? Intl.NumberFormat(
      'en-US', { maximumSignificantDigits: maxLength - 1, useGrouping: false },
    ).format(stringValue)
    : stringValue;
}

/**
 * Dropdown for selecting a channel.
 * @prop {function} handleChange Callback for each new selection.
 * @prop {boolean} disableOptions Whether or not to allow options.
 * @prop {array} channelOptions List of available selections, like ['DAPI', 'FITC', ...].
 * @prop {number} selectionIndex Current numeric index of a selection.
 */
function ChannelSelectionDropdown({
  handleChange,
  disableOptions,
  channelOptions,
  selectionIndex,
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

/**
 * Slider for controlling current colormap.
 * @prop {string} color Current color for this channel.
 * @prop {arry} slider Current value of the slider.
 * @prop {function} handleChange Callback for each slider change.
 * @prop {array} domain Current max/min allowable slider values.
 */
function ChannelSlider({
  color, slider, handleChange, domain: [min, max], dtype,
}) {
  const handleChangeDebounced = useCallback(
    debounce(handleChange, 3, { trailing: true }), [handleChange],
  );
  const step = max - min < 500 && dtype === '<f4' ? (max - min) / 500 : 1;
  return (
    <Slider
      value={slider}
      valueLabelFormat={v => truncateDecimalNumber(v)}
      onChange={(e, v) => handleChangeDebounced(v)}
      valueLabelDisplay="auto"
      getAriaLabel={() => `${color}-${slider}`}
      min={min}
      max={max}
      step={step}
      orientation="horizontal"
      style={{ color, marginTop: '7px' }}
    />
  );
}

/**
 * Checkbox for toggling on/off of a channel.
 * @prop {string} color Current color for this channel.
 * @prop {boolean} checked Whether or not this channel is "on".
 * @prop {function} toggle Callback for toggling on/off.
 */
function ChannelVisibilityCheckbox({ color, checked, toggle }) {
  return (
    <Checkbox
      onChange={toggle}
      checked={checked}
      style={{ color, '&$checked': { color } }}
    />
  );
}

/**
 * Controller for the handling the colormapping sliders.
 * @prop {boolean} visibility Whether or not this channel is "on"
 * @prop {array} slider Current slider range.
 * @prop {array} color Current color for this channel.
 * @prop {array} domain Current max/min for this channel.
 * @prop {string} dimName Name of the dimensions this slider controls (usually "channel").
 * @prop {boolean} colormapOn Whether or not the colormap (viridis, magma etc.) is on.
 * @prop {object} channelOptions All available options for this dimension (i.e channel names).
 * @prop {function} handlePropertyChange Callback for when a property (color, slider etc.) changes.
 * @prop {function} handleChannelRemove When a channel is removed, this is called.
 * @prop {function} handleIQRUpdate When the IQR button is clicked, this is called.
 * @prop {number} selectionIndex The current numeric index of the selection.
 * @prop {boolean} disableOptions Whether or not channel options are be disabled (default: false).
 */
function ChannelController({
  visibility,
  slider,
  color,
  domain,
  dimName,
  theme,
  dtype,
  colormapOn,
  channelOptions,
  handlePropertyChange,
  handleChannelRemove,
  handleIQRUpdate,
  selectionIndex,
  disableOptions = false,
}) {
  const rgbColor = toRgbUIString(colormapOn, color, theme);
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
  const createSelection = index => ({ [dimName]: index });
  return (
    <Grid container direction="column" m={1} justify="center">
      <Grid container direction="row" justify="space-between">
        <Grid item xs={10}>
          <ChannelSelectionDropdown
            handleChange={v => handlePropertyChange('selection', createSelection(v))}
            selectionIndex={selectionIndex}
            disableOptions={disableOptions}
            channelOptions={channelOptions}
          />
        </Grid>
        <Grid item xs={1} style={{ marginTop: '4px' }}>
          <ChannelOptions
            handlePropertyChange={handlePropertyChange}
            handleChannelRemove={handleChannelRemove}
            handleIQRUpdate={handleIQRUpdate}
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
            domain={domain}
            dtype={dtype}
            handleChange={v => handlePropertyChange('slider', v)}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ChannelController;
