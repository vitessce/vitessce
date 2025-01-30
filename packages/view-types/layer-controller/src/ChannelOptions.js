import React, { useState } from 'react';
import { MenuItem, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { PopperMenu } from '@vitessce/vit-s';
import { styled } from '@mui/material-pigment-css';
import { Span } from './styles.js';
import ColorPalette from './ColorPalette.js';


const MenuButton = styled(IconButton)({
  backgroundColor: 'transparent',
});

const ColorsMenuItem = styled(MenuItem)({
  '&:hover': {
    backgroundColor: 'transparent',
  },
  paddingLeft: '2px',
  paddingRight: '2px',
});


/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ChannelOptions({ handlePropertyChange, handleChannelRemove, handleIQRUpdate }) {
  const [open, setOpen] = useState(false);

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
      buttonComponent={MenuButton}
      aria-label="Open channel options menu"
    >
      <MenuItem dense disableGutters onClick={handleRemove} aria-label="Click to remove channel">
        <Span>Remove</Span>
      </MenuItem>
      <MenuItem
        dense
        disableGutters
        onClick={handleIQRUpdate}
        aria-label="Click to use IQR for channel"
      >
        <Span>Use IQR</Span>
      </MenuItem>
      <ColorsMenuItem
        dense
        disableGutters
        aria-label="Click to select color for channel"
      >
        <ColorPalette handleChange={handleColorSelect} />
      </ColorsMenuItem>
    </PopperMenu>
  );
}

export default ChannelOptions;
