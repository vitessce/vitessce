import React, { useState } from 'react';
import { makeStyles, MenuItem } from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
import { MuiSpan } from './styles.js';
import ColorPalette from './ColorPalette.js';

const useStyles = makeStyles(() => ({
  channelMenuButton: {
    backgroundColor: 'transparent',
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
}));

/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ChannelOptions(props) {
  const {
    color,
    setColor,
    onRemove,
    domainType,
    setDomainType,
  } = props;
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  function handleRemove() {
    setOpen(false);
    onRemove();
  }

  function handleIQRUpdate() {
    setDomainType(); // TODO
  }

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon fontSize="small" />}
      buttonClassName={classes.channelMenuButton}
      containerClassName={classes.channelPopperContainer}
      placement="bottom-end"
    >
      <MenuItem dense disableGutters onClick={handleRemove}>
        <MuiSpan>Remove</MuiSpan>
      </MenuItem>
      <MenuItem dense disableGutters onClick={handleIQRUpdate}>
        <MuiSpan>Use IQR</MuiSpan>
      </MenuItem>
      <MenuItem dense disableGutters className={classes.channelColors}>
        <ColorPalette setColor={setColor} />
      </MenuItem>
    </PopperMenu>
  );
}

export default ChannelOptions;
