import React, { useMemo } from 'react';
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
 * @prop {string} channelsSortOrder Either 'original' or 'alphabetical'.
 */
export default function ChannelSelectionDropdown(props) {
  const {
    featureIndex,
    channelsSortOrder,
    targetC,
    setTargetC,
    setWindow,
    disabled,
  } = props;
  const { classes } = useStyles();
  const { classes: selectClasses } = useSelectStyles();

  function handleChange(event) {
    setTargetC(event.target.value === '' ? null : Number(event.target.value));
    setWindow(null); // Clear the window value so that it can be re-auto-calculated.
    // TODO: also clear the window and re-calculate upon change of Z/T.
  }

  const sortedOptions = useMemo(() => {
    if (!Array.isArray(featureIndex)) return [];
    const options = featureIndex.map((channelName, channelIndex) => ({ channelName, channelIndex }));
    if (channelsSortOrder === 'alphabetical') {
      // numeric: true ensures m/z-style numeric labels sort as 1, 2, 3, 10
      // rather than lexicographically as 1, 10, 2, 3.
      return options.sort((a, b) => a.channelName.localeCompare(
        b.channelName, undefined, { numeric: true, sensitivity: 'base' },
      ));
    }
    return options;
  }, [featureIndex, channelsSortOrder]);

  return (Array.isArray(featureIndex) ? (
    <NativeSelect
      classes={{ root: selectClasses.selectRoot }}
      className={classes.oneLineChannelSelect}
      value={targetC === null ? '' : targetC}
      onChange={handleChange}
      inputProps={{ 'aria-label': 'Channel selector' }}
    >
      {sortedOptions.map(({ channelName, channelIndex }) => (
        <option disabled={disabled} key={`${channelName}-${channelIndex}`} value={channelIndex}>
          {channelName}
        </option>
      ))}
    </NativeSelect>
  ) : null);
}
