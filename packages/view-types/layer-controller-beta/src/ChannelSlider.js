/* eslint-disable no-unused-vars */
import React, { useCallback, useState, useEffect } from 'react';

import { Grid, Slider } from '@material-ui/core';
import { debounce, isEqual } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import {
  getSourceFromLoader,
  getMultiSelectionStats,
  abbreviateNumber,
} from '@vitessce/spatial-utils';
import { STATUS } from '@vitessce/constants-internal';
import ChannelOptions from './ChannelOptions.js';
import { DOMAINS } from './constants.js';
import {
  ChannelSelectionDropdown,
  ChannelVisibilityCheckbox,
} from './shared-channel-controls.js';


/**
 * Slider for controlling current colormap.
 * @prop {string} color Current color for this channel.
 * @prop {arry} slider Current value of the slider.
 * @prop {function} handleChange Callback for each slider change.
 * @prop {array} domain Current max/min allowable slider values.
 */
export default function ChannelSlider(props) {
  const {
    image,
    targetC,
    color,
    window = [0, 0],
    setWindow,
    domainType = 'Full',
    disabled: disabledProp,
  } = props;


  const loader = image?.loaders?.[0];
  const { dtype } = loader ? getSourceFromLoader(loader) : {};
  const selection = {
    // TODO: Z, T
    // TODO: keys (if not always 'c', 'z', 't')
    z: 0,
    t: 0,
    c: targetC,
  };
  const fullDomain = dtype ? DOMAINS[dtype] : [0, 0];

  const minMaxQuery = useQuery({
    enabled: !!loader && !disabledProp,
    structuralSharing: false,
    queryKey: ['minMaxDomain', image?.meta?.[0].name, selection],
    queryFn: async (ctx) => {
      const selections = [selection];
      const stats = await getMultiSelectionStats({
        loader: ctx.meta.loader.data,
        selections,
        use3d: false, // TODO: support 3D
      });
      // eslint-disable-next-line prefer-destructuring
      const [newDomain] = stats.domains;
      return newDomain;
    },
    meta: { loader },
  });

  const minMaxDomain = minMaxQuery.data;
  const disabled = disabledProp || minMaxQuery.isLoading;

  const [min, max] = (domainType === 'Full' ? fullDomain : minMaxDomain) || [0, 0];
  const step = max - min < 500 && dtype?.startsWith('Float') ? (max - min) / 500 : 1;

  const handleChangeDebounced = useCallback(
    debounce(setWindow || (() => {}), 3, { trailing: true }),
    [setWindow],
  );


  return (
    <Slider
      value={window}
      valueLabelFormat={abbreviateNumber}
      onChange={(e, v) => handleChangeDebounced(v)}
      valueLabelDisplay="auto"
      getAriaLabel={() => `${color}-${window}`}
      min={min}
      max={max}
      step={step}
      orientation="horizontal"
      style={{ color, marginTop: '7px' }}
      disabled={disabled}
    />
  );
}
