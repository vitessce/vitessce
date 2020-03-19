import React from 'react';
import { Slider, withStyles } from '@material-ui/core';

const styles = {
  root: {
    color: rgb => `rgb(${rgb})`,
  },
};

export default function ChannelSlider({
  color, onChange, value, name, range,
}) {
  const [min, max] = range;
  const ColorSlider = withStyles(styles)(Slider);
  return (
    <ColorSlider
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
