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
  colormap, opacity, handleColormapChange, handleOpacityChange,
}) {
  return (
    <Grid container direction="column" style={{ width: '100%' }}>
      <Grid item>
        <LayerOption name="Colormap" inputId="colormap-select">
          <ColormapSelect value={colormap} inputId="colormap-select" handleChange={handleColormapChange} />
        </LayerOption>
      </Grid>
      <Grid item>
        <LayerOption name="Opacity" inputId="opacity-slider">
          <OpacitySlider value={opacity} handleChange={handleOpacityChange} />
        </LayerOption>
      </Grid>
    </Grid>
  );
}

export default LayerOptions;
