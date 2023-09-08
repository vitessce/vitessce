/* eslint-disable jsx-a11y/label-has-associated-control */
// eslint gets confused by the "id" being within MUI's inputProps.
import React, { useState, useId } from 'react';
import { makeStyles, MenuItem, Select } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
import { useSelectStyles, useEllipsisMenuStyles } from './styles.js';

const useStyles = makeStyles(() => ({
  channelMenuButton: {
    backgroundColor: 'transparent',
    padding: '3px 0',
    marginTop: '3px',
  },
  menuItemButton: {
    padding: '5px',
    width: '100%',
  },
}));

/**
 * Dropdown for options for a channel on the three dots button.
 */
export default function ChannelOptions(props) {
  const {
    onRemove,
    onResetWindowUsingIQR,
    showValueExtent,
    setShowValueExtent,
  } = props;
  const [open, setOpen] = useState(false);

  const classes = useStyles();
  const selectClasses = useSelectStyles();
  const menuClasses = useEllipsisMenuStyles();

  function handleRemove() {
    setOpen(false);
    onRemove();
  }

  function handleDomainTypeChange(event) {
    setShowValueExtent(event.target.value === 'Value Min/Max');
  }

  const domainTypeId = useId();

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon fontSize="small" />}
      buttonClassName={classes.channelMenuButton}
      containerClassName={menuClasses.imageLayerPopperContainer}
      placement="bottom-end"
      withPaper
      aria-label="Open channel options menu"
    >
      <MenuItem dense disableGutters>
        <label className={menuClasses.imageLayerMenuLabel} htmlFor={domainTypeId}>
          Slider Extent:&nbsp;
        </label>
        <Select
          native
          onChange={handleDomainTypeChange}
          value={showValueExtent ? 'Value Min/Max' : 'Dtype Min/Max'}
          inputProps={{ id: domainTypeId, 'aria-label': 'Slider extent selector' }}
          classes={{ root: selectClasses.selectRoot }}
        >
          <option value="Value Min/Max">Value Min/Max</option>
          <option value="Dtype Min/Max">Dtype Min/Max</option>
        </Select>
      </MenuItem>
      <MenuItem
        dense
        disableGutters
        component="button"
        onClick={onResetWindowUsingIQR}
        className={classes.menuItemButton}
        aria-label="Click to use IQR for channel"
      >
        Reset window using IQR
      </MenuItem>
      <MenuItem
        dense
        disableGutters
        component="button"
        onClick={handleRemove}
        className={classes.menuItemButton}
        aria-label="Click to remove channel"
      >
        Remove channel
      </MenuItem>
    </PopperMenu>
  );
}
