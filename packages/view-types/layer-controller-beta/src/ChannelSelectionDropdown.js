import React from 'react';
import {
  makeStyles,
  Select,
} from '@material-ui/core';
import { useSelectStyles } from './styles.js';


const useStyles = makeStyles(() => ({
  oneLineChannelSelect: {
    width: '90%',
    marginLeft: '5%',
    fontSize: '12px',
  },
}));

/**
 * Dropdown for selecting a channel.
 * @prop {function} handleChange Callback for each new selection.
 * @prop {array} channelOptions List of available selections, like ['DAPI', 'FITC', ...].
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {number} selectionIndex Current numeric index of a selection.
 */
export default function ChannelSelectionDropdown(props) {
  const {
    featureIndex,
    targetC,
    setTargetC,
    setWindow,
    disabled,
  } = props;
  const classes = useStyles();
  const selectClasses = useSelectStyles();

  function handleChange(event) {
    setTargetC(event.target.value === '' ? null : Number(event.target.value));
    setWindow(null); // Clear the window value so that it can be re-auto-calculated.
    // TODO: also clear the window and re-calculate upon change of Z/T.
  }
  return (Array.isArray(featureIndex) ? (
    <Select
      native
      classes={{ root: selectClasses.selectRoot }}
      className={classes.oneLineChannelSelect}
      value={targetC === null ? '' : targetC}
      onChange={handleChange}
    >
      {featureIndex.map((channelName, channelIndex) => (
        <option disabled={disabled} key={channelName} value={channelIndex}>
          {channelName}
        </option>
      ))}
    </Select>
  ) : null);
}
