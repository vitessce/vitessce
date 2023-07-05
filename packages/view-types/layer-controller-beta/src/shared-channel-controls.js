import React from 'react';

import { Checkbox, Select } from '@material-ui/core';
import { useSelectStyles } from './styles.js';

/**
 * Dropdown for selecting a channel.
 * @prop {function} handleChange Callback for each new selection.
 * @prop {array} channelOptions List of available selections, like ['DAPI', 'FITC', ...].
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {number} selectionIndex Current numeric index of a selection.
 */
export function ChannelSelectionDropdown({
  featureIndex,
  targetC,
  setTargetC,
  disabled,
}) {
  const classes = useSelectStyles();
  return (Array.isArray(featureIndex) ? (
    <Select
      classes={{ root: classes.selectRoot }}
      native
      value={targetC === null ? '' : targetC}
      onChange={e => setTargetC(e.target.value === '' ? null : Number(e.target.value))}
    >
      {featureIndex.map((channelName, channelIndex) => (
        <option disabled={disabled} key={channelName} value={channelIndex}>
          {channelName}
        </option>
      ))}
    </Select>
  ) : null);
}

/**
 * Checkbox for toggling on/off of a channel.
 * @prop {string} color Current color for this channel.
 * @prop {boolean} checked Whether or not this channel is "on".
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {function} toggle Callback for toggling on/off.
 */
export function ChannelVisibilityCheckbox({
  color, checked, toggle, disabled,
}) {
  return (
    <Checkbox
      onChange={toggle}
      checked={checked}
      disabled={disabled}
      style={{ color, '&$checked': { color } }}
    />
  );
}
