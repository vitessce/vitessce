import React, { useCallback, useState, useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

import ChannelOptions from './ChannelOptions';
import { DOMAINS } from './constants';
import { getSourceFromLoader } from '../../utils';
import { getMultiSelectionStats } from './utils';
import { ChannelSelectionDropdown, ChannelVisibilityCheckbox } from './shared-channel-controls';

// Returns an rgb string for display, and changes the color (arr)
// to use a grey for light theme + white color or if the colormap is on.
export const toRgbUIString = (on, arr, theme) => {
  const color = (on || (theme === 'light' && arr.every(i => i === 255))) ? [220, 220, 220] : arr;
  return `rgb(${color})`;
};

function abbreviateNumber(value) {
  // Return an abbreviated representation of value, in 5 characters or less.

  const maxLength = 5;
  let maxNaiveDigits = maxLength;

  /* eslint-disable no-plusplus */
  if (!Number.isInteger(value)) { --maxNaiveDigits; } // Wasted on "."
  if (value < 1) { --maxNaiveDigits; } // Wasted on "0."
  /* eslint-disable no-plusplus */


  const naive = Intl.NumberFormat(
    'en-US',
    {
      maximumSignificantDigits: maxNaiveDigits,
      useGrouping: false,
    },
  ).format(value);
  if (naive.length <= maxLength) return naive;

  // "e+9" consumes 3 characters, so if we even had two significant digits,
  // it would take take us to six characters, including the decimal point.
  return value.toExponential(0);
}

/**
 * Slider for controlling current colormap.
 * @prop {string} color Current color for this channel.
 * @prop {arry} slider Current value of the slider.
 * @prop {function} handleChange Callback for each slider change.
 * @prop {array} domain Current max/min allowable slider values.
 */
function ChannelSlider({
  color, slider = [0, 0], handleChange, domain = [0, 0], dtype, disabled,
}) {
  const [min, max] = domain;
  const handleChangeDebounced = useCallback(
    debounce(handleChange, 3, { trailing: true }), [handleChange],
  );
  const step = max - min < 500 && dtype === 'Float32' ? (max - min) / 500 : 1;
  return (
    <Slider
      value={slider}
      valueLabelFormat={abbreviateNumber}
      onChange={(e, v) => handleChangeDebounced(v)}
      valueLabelDisplay="auto"
      getAriaLabel={() => `${color}-${slider}`}
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
  const [selection, setSelection] = useState([{ ...channels[channelId].selection }]);
  const rgbColor = toRgbUIString(colormapOn, color, theme);

  useEffect(() => {
    if (dtype && loader && channels) {
      const loaderSelection = [{ ...channels[channelId].selection }];
      let domains;
      const hasDomainChanged = newDomainType !== domainType;
      const has3dChanged = use3d !== newUse3d;
      const hasSelectionChanged = !isEqual(loaderSelection, selection);
      if (hasDomainChanged || hasSelectionChanged || has3dChanged) {
        setUse3d(newUse3d);
        if (newDomainType === 'Full') {
          domains = [DOMAINS[dtype]];
          const [newDomain] = domains;
          setDomain(newDomain);
          setDomainType(newDomainType);
          if (hasSelectionChanged) {
            setSelection(loaderSelection);
          } if (has3dChanged) {
            setUse3d(newUse3d);
          }
        } else {
          getMultiSelectionStats({
            loader: loader.data,
            selections: loaderSelection,
            use3d: newUse3d,
          }).then((stats) => {
            // eslint-disable-next-line prefer-destructuring
            domains = stats.domains;
            const [newDomain] = domains;
            setDomain(newDomain);
            setDomainType(newDomainType);
            if (hasSelectionChanged) {
              setSelection(loaderSelection);
            } if (has3dChanged) {
              setUse3d(newUse3d);
            }
          });
        }
      }
    }
  }, [domainType, channels, channelId, loader, dtype, newDomainType, selection, newUse3d, use3d]);
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
    <Grid container direction="column" m={1} justify="center">
      <Grid container direction="row" justify="space-between">
        <Grid item xs={10}>
          <ChannelSelectionDropdown
            handleChange={v => handlePropertyChange('selection', createSelection(v))}
            selectionIndex={selectionIndex}
            channelOptions={channelOptions}
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={1} style={{ marginTop: '4px' }}>
          <ChannelOptions
            handlePropertyChange={handlePropertyChange}
            handleChannelRemove={handleChannelRemove}
            handleIQRUpdate={handleIQRUpdate}
            disabled={isLoading}
          />
        </Grid>
      </Grid>
      <Grid container direction="row" justify="space-between">
        <Grid item xs={2}>
          <ChannelVisibilityCheckbox
            color={rgbColor}
            checked={visibility}
            toggle={() => handlePropertyChange('visible', !visibility)}
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={9}>
          {domain && (
            <ChannelSlider
              color={rgbColor}
              slider={slider}
              domain={domain}
              dtype={dtype}
              handleChange={v => handlePropertyChange('slider', v)}
              disabled={isLoading}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default RasterChannelController;
