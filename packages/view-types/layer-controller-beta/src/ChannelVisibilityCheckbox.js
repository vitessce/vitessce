import React from 'react';
import {
  Checkbox,
  makeStyles,
} from '@material-ui/core';
import { toRgbUIString } from '@vitessce/spatial-utils';

const useStyles = makeStyles(() => ({
  visibilityCheckbox: {
    padding: '8px',
  },
}));

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
  const classes = useStyles();
  return (
    <Checkbox
      onChange={(e, v) => setVisible(v)}
      checked={visible}
      disabled={disabled}
      className={classes.visibilityCheckbox}
      style={{ color: rgbColor, '&$checked': { color: rgbColor } }}
    />
  );
}
