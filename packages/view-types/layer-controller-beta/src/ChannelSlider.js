import React, { useCallback, useEffect } from 'react';

import { Slider } from '@material-ui/core';
import { debounce } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import {
  getMultiSelectionStats,
  abbreviateNumber,
  toRgbUIString,
  DOMAINS,
} from '@vitessce/spatial-utils';


/**
 * Slider for controlling current colormap.
 * @prop {number[]} color Current color for this channel.
 * @prop {arry} slider Current value of the slider.
 * @prop {function} handleChange Callback for each slider change.
 * @prop {array} domain Current max/min allowable slider values.
 */
export default function ChannelSlider(props) {
  const {
    image,
    targetT,
    targetZ,
    targetC,
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
      getAriaLabel={() => `${rgbColor}-${window}`}
      min={min}
      max={max}
      step={step}
      orientation="horizontal"
      style={{ color: rgbColor, marginTop: '7px' }}
      disabled={disabled}
    />
  );
}
