import React from 'react';

import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import { COLORMAP_OPTIONS } from '../utils';

function ColormapSelect({ value, inputId, handleChange }) {
  return (
    <Select
      native
      onChange={e => handleChange(e.target.value)}
      value={value}
      inputProps={{ name: 'colormap', id: inputId }}
      style={{ width: '100%' }}
    >
      <option aria-label="None" value="">None</option>
      {COLORMAP_OPTIONS.map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </Select>
  );
}

function OpacitySlider({ value, handleChange }) {
  return (
    <Slider
      value={value}
      onChange={(e, v) => handleChange(v)}
      valueLabelDisplay="auto"
      getAriaLabel={() => 'opacity slider'}
      min={0}
      max={1}
      step={0.01}
      orientation="horizontal"
      style={{ marginTop: '7px' }}
    />
  );
}

function GlobalSelectionSlider({
  field,
  value,
  handleChange,
  possibleValues,
}) {
  return (
    <Slider
      value={value}
      // See https://github.com/hubmapconsortium/vitessce-image-viewer/issues/176 for why
      // we have the two handlers.
      onChange={
        (event, newValue) => handleChange({ selection: { [field]: newValue }, event })
      }
      onChangeCommitted={
        (event, newValue) => handleChange({ selection: { [field]: newValue }, event })
      }
      valueLabelDisplay="auto"
      getAriaLabel={() => `${field} slider`}
      marks={possibleValues.map(val => ({ value: val }))}
      min={Number(possibleValues[0])}
      max={Number(possibleValues.slice(-1))}
      orientation="horizontal"
      style={{ marginTop: '7px' }}
      step={null}
    />
  );
}

function LayerOption({ name, inputId, children }) {
  return (
    <Grid container direction="row" alignItems="flex-end" justify="space-between">
      <Grid item xs={6}>
        <InputLabel htmlFor={inputId}>
          {name}:
        </InputLabel>
      </Grid>
      <Grid item xs={6}>
        {children}
      </Grid>
    </Grid>
  );
}

function LayerOptions({
  colormap,
  opacity,
  handleColormapChange,
  handleOpacityChange,
  globalControlDimensions,
  handleGlobalChannelsSelectionChange,
  channels,
  dimensions,
}) {
  const hasDimensionsAndChannels = dimensions.length > 0 && Object.keys(channels).length > 0;
  return (
    <Grid container direction="column" style={{ width: '100%' }}>
      <Grid item>
        <LayerOption name="Colormap" inputId="colormap-select">
          <ColormapSelect
            value={colormap}
            inputId="colormap-select"
            handleChange={handleColormapChange}
          />
        </LayerOption>
      </Grid>
      <Grid item>
        <LayerOption name="Opacity" inputId="opacity-slider">
          <OpacitySlider value={opacity} handleChange={handleOpacityChange} />
        </LayerOption>
      </Grid>
      {hasDimensionsAndChannels
        && globalControlDimensions.map((dimension) => {
          const { field, values } = dimension;
          return (
            <LayerOption name={field} inputId={`${field}-slider`} key={field}>
              <GlobalSelectionSlider
                field={field}
                value={channels[Object.keys(channels)[0]].selection[field]}
                handleChange={handleGlobalChannelsSelectionChange}
                possibleValues={values}
              />
            </LayerOption>
          );
        })
      }
    </Grid>
  );
}

export default LayerOptions;
