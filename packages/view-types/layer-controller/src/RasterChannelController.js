import React, { useCallback, useState, useEffect } from 'react';

import { Grid, Slider } from '@vitessce/styles';
import { debounce, isEqual } from 'lodash-es';

import {
  getSourceFromLoader,
  getMultiSelectionStats,
  toRgbUIString,
  abbreviateNumber,
  DOMAINS,
} from '@vitessce/spatial-utils';
import ChannelOptions from './ChannelOptions.js';
import {
  ChannelSelectionDropdown,
  ChannelVisibilityCheckbox,
} from './shared-channel-controls.js';
import { useChannelSliderStyles } from './styles.js';

/**
 * Slider for controlling current colormap.
 * @prop {string} color Current color for this channel.
 * @prop {arry} slider Current value of the slider.
 * @prop {function} handleChange Callback for each slider change.
 * @prop {array} domain Current max/min allowable slider values.
 */
function ChannelSlider({
  color,
  slider = [0, 0],
  handleChange,
  domain = [0, 0],
  dtype,
  disabled,
}) {
  const [min, max] = domain;
  const sliderCopy = slider.slice();
  if (slider[0] < min) {
    sliderCopy[0] = min;
  }
  if (slider[1] > max) {
    sliderCopy[1] = max;
  }
  const handleChangeDebounced = useCallback(
    debounce(handleChange, 3, { trailing: true }),
    [handleChange],
  );

  const { classes } = useChannelSliderStyles();

  const step = max - min < 500 && dtype.startsWith('Float') ? (max - min) / 500 : 1;
  return (
    <Slider
      slotProps={{ valueLabel: { className: classes.valueLabel } }}
      value={slider}
      valueLabelFormat={abbreviateNumber}
      onChange={(e, v) => handleChangeDebounced(v)}
      valueLabelDisplay="auto"
      getAriaLabel={(index) => {
        const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
        return `${labelPrefix} for ${color} colormap channel`;
      }}
      getAriaValueText={() => `Current colormap values: ${color}-${slider}`}
      min={min}
      max={max}
      step={step}
      orientation="horizontal"
      style={{ color, marginTop: '7px' }}
      disabled={disabled}
    />
  );
}

/**
 * Controller for the handling the colormapping sliders.
 * @prop {boolean} visibility Whether or not this channel is "on"
 * @prop {array} slider Current slider range.
 * @prop {array} color Current color for this channel.
 * @prop {array} domain Current max/min for this channel.
 * @prop {string} dimName Name of the dimensions this slider controls (usually "channel").
 * @prop {boolean} colormapOn Whether or not the colormap (viridis, magma etc.) is on.
 * @prop {object} channelOptions All available options for this dimension (i.e channel names).
 * @prop {function} handlePropertyChange Callback for when a property (color, slider etc.) changes.
 * @prop {function} handleChannelRemove When a channel is removed, this is called.
 * @prop {function} handleIQRUpdate When the IQR button is clicked, this is called.
 * @prop {number} selectionIndex The current numeric index of the selection.
 */
function RasterChannelController({
  visibility = false,
  slider,
  color,
  channels,
  channelId,
  domainType: newDomainType,
  dimName,
  theme,
  loader,
  colormapOn,
  channelOptions,
  handlePropertyChange,
  handleChannelRemove,
  handleIQRUpdate,
  selectionIndex,
  isLoading,
  use3d: newUse3d,
}) {
  const { dtype } = getSourceFromLoader(loader);
  const [domain, setDomain] = useState(null);
  const [domainType, setDomainType] = useState(null);
  const [use3d, setUse3d] = useState(null);
  const [selection, setSelection] = useState([
    { ...channels[channelId].selection },
  ]);

  const rgbColor = toRgbUIString(colormapOn, color, theme);

  useEffect(() => {
    // Use mounted to prevent state updates/re-renders after the component has been unmounted.
    // All state updates should happen within the mounted check.
    let mounted = true;
    if (dtype && loader && channels) {
      const selections = [{ ...channels[channelId].selection }];
      let domains;
      const hasDomainChanged = newDomainType !== domainType;
      const has3dChanged = use3d !== newUse3d;
      const hasSelectionChanged = !isEqual(selections, selection);
      if (hasDomainChanged || hasSelectionChanged || has3dChanged) {
        if (newDomainType === 'Full') {
          domains = [DOMAINS[dtype]];
          const [newDomain] = domains;
          if (mounted) {
            setDomain(newDomain);
            setDomainType(newDomainType);
            if (hasSelectionChanged) {
              setSelection(selections);
            }
            if (has3dChanged) {
              setUse3d(newUse3d);
            }
          }
        } else {
          getMultiSelectionStats({
            loader: loader.data,
            selections,
            use3d: newUse3d,
          }).then((stats) => {
            // eslint-disable-next-line prefer-destructuring
            domains = stats.domains;
            const [newDomain] = domains;
            if (mounted) {
              setDomain(newDomain);
              setDomainType(newDomainType);
              if (hasSelectionChanged) {
                setSelection(selections);
              }
              if (has3dChanged) {
                setUse3d(newUse3d);
              }
            }
          });
        }
      }
    }
    return () => {
      mounted = false;
    };
  }, [
    domainType,
    channels,
    channelId,
    loader,
    dtype,
    newDomainType,
    selection,
    newUse3d,
    use3d,
  ]);
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
    <Grid container direction="column" justifyContent="center">
      <Grid container direction="row" justifyContent="space-between">
        <Grid size={10}>
          <ChannelSelectionDropdown
            handleChange={v => handlePropertyChange('selection', createSelection(v))
            }
            selectionIndex={selectionIndex}
            channelOptions={channelOptions}
            disabled={isLoading}
          />
        </Grid>
        <Grid size={1} sx={{ marginTop: '4px' }}>
          <ChannelOptions
            handlePropertyChange={handlePropertyChange}
            handleChannelRemove={handleChannelRemove}
            handleIQRUpdate={handleIQRUpdate}
            disabled={isLoading}
          />
        </Grid>
      </Grid>
      <Grid container direction="row" justifyContent="space-between">
        <Grid size={2}>
          <ChannelVisibilityCheckbox
            color={rgbColor}
            checked={visibility}
            toggle={() => handlePropertyChange('visible', !visibility)}
            disabled={isLoading}
          />
        </Grid>
        <Grid size={9}>
          <ChannelSlider
            color={rgbColor}
            slider={slider}
            domain={domain || DOMAINS[dtype]}
            dtype={dtype}
            handleChange={v => handlePropertyChange('slider', v)}
            disabled={isLoading}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default RasterChannelController;
