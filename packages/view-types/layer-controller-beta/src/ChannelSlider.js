import React, { useCallback, useEffect } from 'react';

import { Slider, makeStyles } from '@vitessce/styles';
import { debounce } from 'lodash-es';
import {
  abbreviateNumber,
  toRgbUIString,
  DOMAINS,
} from '@vitessce/spatial-utils';

const useStyles = makeStyles()(() => ({
  channelSlider: {
    marginTop: '7px',
  },
}));


/**
 * Slider for controlling current colormap.
 * @prop {ImageWrapper} image The image instance.
 * @prop {number[]} color Current color for this channel.
 * @prop {[number, number]} window Current value of the slider.
 * @prop {function} setWindow Callback for each slider change.
 * @prop {[number, number]} minMaxDomain Current max/min values for the channel.
 * @prop {boolean} showValueExtent Whether or not to use
 * minMaxDomain vs. fullDomain for the slider extent.
 */
export default function ChannelSlider(props) {
  const {
    image,
    color,
    window,
    setWindow,
    showValueExtent,
    disabled,
    minMaxDomain,
    colormapOn,
    theme,
  } = props;

  const rgbColor = toRgbUIString(colormapOn, color, theme);

  const dtype = image?.getDtype();
  const fullDomain = dtype ? DOMAINS[dtype] : [0, 0];
  const { classes } = useStyles();

  useEffect(() => {
    // If the `window` value is null, then assume it should be
    // auto-initialized using the min/max domain. This can occur
    // upon first load, or when the channel is changed.
    if (!window && !disabled && Array.isArray(minMaxDomain)) {
      setWindow(minMaxDomain);
    }
  }, [minMaxDomain, window, disabled]);

  const [min, max] = (showValueExtent ? minMaxDomain : fullDomain) || [0, 0];
  const step = max - min < 500 && dtype?.startsWith('Float') ? (max - min) / 500 : 1;

  const handleChangeDebounced = useCallback(
    debounce(setWindow || (() => {}), 3, { trailing: true }),
    [setWindow],
  );

  return (
    <Slider
      value={window || [0, 0]}
      valueLabelFormat={abbreviateNumber}
      onChange={(e, v) => handleChangeDebounced(v)}
      valueLabelDisplay="auto"
      getAriaLabel={(index) => {
        const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
        return `${labelPrefix} for ${rgbColor} colormap channel`;
      }}
      getAriaValueText={() => `Current colormap values: ${rgbColor}-${window}`}
      min={min}
      max={max}
      step={step}
      orientation="horizontal"
      className={classes.channelSlider}
      style={{ color: rgbColor }}
      disabled={disabled}
    />
  );
}
