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
    disabled,
  } = props;
  const classes = useStyles();
  const selectClasses = useSelectStyles();
  return (Array.isArray(featureIndex) ? (
    <Select
      classes={{ root: selectClasses.selectRoot }}
      className={classes.oneLineChannelSelect}
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
