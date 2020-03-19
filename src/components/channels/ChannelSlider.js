import React, { memo } from 'react';
import { Slider } from '@material-ui/core';

function ChannelSlider({
  color, onChange, value, name, range,
}) {
  const [min, max] = range;
  return (
    <Slider
      value={value}
      // eslint-disable-next-line no-unused-vars
      onChange={(e, v) => onChange(v)}
      valueLabelDisplay="auto"
      getAriaLabel={() => name}
      min={min}
      max={max}
      style={
        {
          color: `rgb(${color})`,
        }
      }
      orientation="horizontal"
    />
  );
}

export default memo(ChannelSlider);
