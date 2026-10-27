import React, { useMemo } from 'react';

import { Checkbox, NativeSelect } from '@vitessce/styles';
import { useSelectStyles } from './styles.js';
import { getSortedChannelOptions } from './channel-sort-utils.js';

/**
 * Dropdown for selecting a channel.
 * @prop {function} handleChange Callback for each new selection.
 * @prop {array} channelOptions List of available selections, like ['DAPI', 'FITC', ...].
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {number} selectionIndex Current numeric index of a selection.
 * @prop {string} channelsSortOrder Either 'original' or 'alphabetical'.
 */
export function ChannelSelectionDropdown({
  handleChange,
  disabled,
  channelOptions,
  selectionIndex,
  channelsSortOrder,
}) {
  const { classes } = useSelectStyles();
  const sortedOptions = useMemo(
    () => getSortedChannelOptions(channelOptions, channelsSortOrder),
    [channelOptions, channelsSortOrder],
  );
  return (
    <NativeSelect
      classes={{ root: classes.selectRoot }}
      value={selectionIndex}
      onChange={e => handleChange(Number(e.target.value))}
      inputProps={{ 'aria-label': 'Select a channel' }}
    >
      {sortedOptions.map(({ channelName, channelIndex }) => (
        <option disabled={disabled} key={`${channelName}-${channelIndex}`} value={channelIndex}>
          {channelName}
        </option>
      ))}
    </NativeSelect>
  );
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
      sx={{ paddingLeft: 0 }}
      style={{ color, '&$checked': { color } }}
      slotProps={{
        input: { 'aria-label': 'Toggle on or off a channel' },
      }}
    />
  );
}
