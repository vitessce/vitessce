import React, { useState } from 'react';
import {
  makeStyles,
  Select,
  MenuItem,
} from '@vitessce/styles';

const SORT_OPTION_VALUE = '__sort__';

const useStyles = makeStyles()(() => ({
  oneLineChannelSelect: {
    width: '90%',
    marginLeft: '5%',
    fontSize: '12px',
  },
  sortMenuItem: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: '12px',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: '#222',
    '&:hover': {
      backgroundColor: '#333',
    },
  },
  dividerMenuItem: {
    color: '#555',
    fontSize: '12px',
    pointerEvents: 'none',
    minHeight: 'auto',
    padding: '2px 16px',
  },
  channelMenuItem: {
    fontSize: '12px',
  },
}));

/**
 * Dropdown for selecting a channel.
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {string[]} featureIndex The feature index.
 */
export default function ChannelSelectionDropdown(props) {
  const {
    featureIndex,
    targetC,
    setTargetC,
    setWindow,
    disabled,
  } = props;
  const { classes } = useStyles();
  const [sortAlphabetical, setSortAlphabetical] = useState(false);

  function handleChange(event) {
    if (event.target.value === SORT_OPTION_VALUE) {
    setSortAlphabetical(s => !s);
      return;
    }
    setTargetC(event.target.value === '' ? null : Number(event.target.value));
    setWindow(null); // Clear the window value so that it can be re-auto-calculated.
    // TODO: also clear the window and re-calculate upon change of Z/T.
  }

  if (!Array.isArray(featureIndex)) return null;

  const sortedOptions = sortAlphabetical
    ? featureIndex
        .map((channelName, channelIndex) => ({ channelName, channelIndex }))
        .sort((a, b) => a.channelName.localeCompare(b.channelName, undefined, { numeric: true, sensitivity: 'base' }))
    : featureIndex.map((channelName, channelIndex) => ({ channelName, channelIndex }));

  return (
    <Select
      className={classes.oneLineChannelSelect}
      value={targetC === null ? '' : targetC}
      onChange={handleChange}
      inputProps={{ 'aria-label': 'Channel selector' }}
      size="small"
      variant="standard"
      MenuProps={{
        PaperProps: {
          style: { maxHeight: 300 },
        },
      }}
    >
      <MenuItem
        value={SORT_OPTION_VALUE}
        className={classes.sortMenuItem}
        disableRipple
      >
        {sortAlphabetical ? '↕ Sort: Original' : '↕ Sort: A→Z'}
      </MenuItem>
      <MenuItem disabled className={classes.dividerMenuItem}>
        ──────────
      </MenuItem>
      {sortedOptions.map(({ channelName, channelIndex }) => (
        <MenuItem
          disabled={disabled}
          key={`${channelName}-${channelIndex}`}
          value={channelIndex}
          className={classes.channelMenuItem}
        >
          {channelName}
        </MenuItem>
      ))}
    </Select>
  );
}
