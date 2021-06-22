import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';

/**
 * Dropdown for selecting a channel.
 * @prop {function} handleChange Callback for each new selection.
 * @prop {array} channelOptions List of available selections, like ['DAPI', 'FITC', ...].
 * @prop {number} selectionIndex Current numeric index of a selection.
 */
export function ChannelSelectionDropdown({
  handleChange,
  disabled,
  channelOptions,
  selectionIndex,
}) {
  return (
    <Select
      native
      value={selectionIndex}
      onChange={e => handleChange(Number(e.target.value))}
    >
      {channelOptions.map((opt, i) => (
        <option disabled={disabled} key={opt} value={i}>
          {opt}
        </option>
      ))}
    </Select>
  );
}

/**
 * Checkbox for toggling on/off of a channel.
 * @prop {string} color Current color for this channel.
 * @prop {boolean} checked Whether or not this channel is "on".
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
