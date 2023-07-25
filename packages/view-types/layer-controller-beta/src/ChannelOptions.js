/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { makeStyles, MenuItem, Select } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
import { useSelectStyles } from './styles.js';

const useStyles = makeStyles(() => ({
  channelMenuButton: {
    backgroundColor: 'transparent',
    padding: '3px 0',
  },
  channelColors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  channelPopperContainer: {
    display: 'flex',
    marginTop: '5px',
    justifyContent: 'space-around',
  },
  spanButton: {
    padding: '4px',
  }
}));

/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ChannelOptions(props) {
  const {
    onRemove,
    onResetWindowUsingIQR,
    showValueExtent,
    setShowValueExtent,
  } = props;
  const [open, setOpen] = useState(false);

  const classes = useStyles();
  const selectClasses = useSelectStyles();

  function handleRemove() {
    setOpen(false);
    onRemove();
  }

  function handleDomainTypeChange(event) {
    setShowValueExtent(event.target.value === "Value Min/Max" ? true : false);
  }

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon fontSize="small" />}
      buttonClassName={classes.channelMenuButton}
      containerClassName={classes.channelPopperContainer}
      placement="bottom-end"
      withPaper
    >
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Slider Extent: </span>
        <Select
          native
          onChange={handleDomainTypeChange}
          value={showValueExtent ? "Value Min/Max" : "Dtype Min/Max"}
          inputProps={{ name: 'domainType' }}
          style={{ width: '100%', fontSize: '14px' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option value="Value Min/Max">Value Min/Max</option>
          <option value="Dtype Min/Max">Dtype Min/Max</option>
        </Select>
      </MenuItem>
      <MenuItem dense disableGutters onClick={onResetWindowUsingIQR}>
        <span className={classes.spanButton}>Reset window using IQR</span>
      </MenuItem>
      <MenuItem dense disableGutters onClick={handleRemove}>
        <span className={classes.spanButton}>Remove channel</span>
      </MenuItem>
    </PopperMenu>
  );
}

export default ChannelOptions;
