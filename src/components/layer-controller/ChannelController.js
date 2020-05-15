/* eslint-disable */
// done
import React from 'react';

import { StyledCheckbox, StyledGrid, 
  StyledSlider, StyledSelect } from './styles';

import ChannelOptions from './ChannelOptions';

const MIN_SLIDER_VALUE = 0;
const MAX_SLIDER_VALUE = 65535;
const COLORMAP_SLIDER_CHECKBOX_COLOR = [220, 220, 220];

const toRgb = (on, arr) => {
  const color = on ? COLORMAP_SLIDER_CHECKBOX_COLOR : arr;
  return `rgb(${color})`;
};

function ChannelSelectionDropdown({
  handleChange,
  disableOptions,
  channelOptions,
  selectionIndex,
}) {
  return (
    <StyledSelect
      native
      value={selectionIndex}
      onChange={e => handleChange(Number(e.target.value))}
    >
      {channelOptions.map((opt, i) => (
        <option disabled={disableOptions} key={opt} value={i}>
          {opt}
        </option>
      ))}
    </StyledSelect>
  );
}

function ChannelSlider({ color, slider, handleChange }) {
  return (
    <StyledSlider
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
    <StyledCheckbox
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
  colormapOn,
  channelOptions,
  handlePropertyChange,
  handleChannelRemove,
  selectionIndex,
  disableOptions = false,
}) {
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
  const createSelection = index => ({ [dimName]: index });
  return (
    <StyledGrid container direction="column" m={1} justify="center">
      <StyledGrid container direction="row" justify="space-between">
        <StyledGrid item xs={10}>
          <ChannelSelectionDropdown
            handleChange={v => handlePropertyChange('selection', createSelection(v))}
            selectionIndex={selectionIndex}
            disableOptions={disableOptions}
            channelOptions={channelOptions}
          />
        </StyledGrid>
        <StyledGrid item xs={1} style={{ marginTop: '4px' }}>
          <ChannelOptions
            handlePropertyChange={handlePropertyChange}
            handleChannelRemove={handleChannelRemove}
          />
        </StyledGrid>
      </StyledGrid>
      <StyledGrid container direction="row" justify="space-between">
        <StyledGrid item xs={2}>
          <ChannelVisibilityCheckbox
            color={rgbColor}
            checked={visibility}
            toggle={() => handlePropertyChange('visibility')}
          />
        </StyledGrid>
        <StyledGrid item xs={9}>
          <ChannelSlider
            color={rgbColor}
            slider={slider}
            handleChange={v => handlePropertyChange('slider', v)}
          />
        </StyledGrid>
      </StyledGrid>
    </StyledGrid>
  );
}

export default ChannelController;
