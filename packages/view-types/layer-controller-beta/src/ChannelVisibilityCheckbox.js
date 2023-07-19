import React from 'react';
import {
  Checkbox,
} from '@material-ui/core';
import { toRgbUIString } from '@vitessce/spatial-utils';


/**
 * Checkbox for toggling on/off of a channel.
 * @prop {number[]} color Current color for this channel.
 */
export default function ChannelVisibilityCheckbox(props) {
  const {
    color,
    visible,
    setVisible,
    disabled,
    theme,
    colormapOn,
  } = props;
  const rgbColor = toRgbUIString(colormapOn, color, theme);
  return (
    <Checkbox
      onChange={(e, v) => setVisible(v)}
      checked={visible}
      disabled={disabled}
      style={{ color: rgbColor, '&$checked': { color: rgbColor }, padding: '8px' }}
    />
  );
}
