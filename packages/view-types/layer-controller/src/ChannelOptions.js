import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/es/styles/index.js';
import MoreVertIcon from '@material-ui/icons/esm/MoreVert.js';
import MenuItem from '@material-ui/core/es/MenuItem/index.js';
import { PopperMenu } from '@vitessce/vit-s';
import { MuiSpan } from './styles.js';
import ColorPalette from './ColorPalette.js';

const useStyles = makeStyles(() => ({
  menuButton: {
    backgroundColor: 'transparent',
  },
  colors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ChannelOptions({ handlePropertyChange, handleChannelRemove, handleIQRUpdate }) {
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  const handleColorSelect = (color) => {
    handlePropertyChange('color', color);
  };

  const handleRemove = () => {
    setOpen(false);
    handleChannelRemove();
  };

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon fontSize="small" />}
      buttonClassName={classes.menuButton}
    >
      <MenuItem dense disableGutters onClick={handleRemove}>
        <MuiSpan>Remove</MuiSpan>
      </MenuItem>
      <MenuItem dense disableGutters onClick={handleIQRUpdate}>
        <MuiSpan>Use IQR</MuiSpan>
      </MenuItem>
      <MenuItem dense disableGutters className={classes.colors}>
        <ColorPalette handleChange={handleColorSelect} />
      </MenuItem>
    </PopperMenu>
  );
}

export default ChannelOptions;
