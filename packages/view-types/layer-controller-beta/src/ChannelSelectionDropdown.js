import React, { useState } from 'react';
import {
  makeStyles,
  NativeSelect,
} from '@vitessce/styles';
import { useSelectStyles } from './styles.js';


const useStyles = makeStyles()(() => ({
  oneLineChannelSelect: {
    width: '90%',
    marginLeft: '5%',
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
  const { classes: selectClasses } = useSelectStyles();
  const [sortAlphabetical, setSortAlphabetical] = useState(false);


  function handleChange(event) {
    setTargetC(event.target.value === '' ? null : Number(event.target.value));
    setWindow(null); // Clear the window value so that it can be re-auto-calculated.
    // TODO: also clear the window and re-calculate upon change of Z/T.
  }

  if (!Array.isArray(featureIndex)) return null;

  const sortedOptions =  sortAlphabetical
  ? featureIndex
      .map((channelName, channelIndex) => ({ channelName, channelIndex }))
      .sort((a, b) => a.channelName.localeCompare(b.channelName, undefined, { numeric: true, sensitivity: 'base' }))
  : featureIndex.map((channelName, channelIndex) => ({ channelName, channelIndex }))


  return (
      <NativeSelect
        classes={{ root: selectClasses.selectRoot }}
        className={classes.oneLineChannelSelect}
        value={targetC === null ? '' : targetC}
        onChange={(e) => {
          if (e.target.value === '__sort__') {
            setSortAlphabetical(s => !s);
            return;
          }
          handleChange(e);
        }}
        inputProps={{ 'aria-label': 'Channel selector' }}
      >  <option value="__sort__">
      {sortAlphabetical ? '↕ Sort: Original' : '↕ Sort: A→Z'}
    </option>
    <option disabled value="">──────────</option>
        {sortedOptions.map(({channelName, channelIndex}) => (
          // eslint-disable-next-line react/no-array-index-key
          <option disabled={disabled} key={`${channelName}-${channelIndex}`} value={channelIndex}>
            {channelName}
          </option>
        ))}
      </NativeSelect>
  )
}
