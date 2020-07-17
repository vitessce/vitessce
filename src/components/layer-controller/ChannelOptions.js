import React, { useReducer } from 'react';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import { PopperMenu, MuiSpan } from '../shared-mui/components';
import { colorPaletteStyles } from '../shared-mui/styles';

import ColorPalette from './ColorPalette';

/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ChannelOptions({ handlePropertyChange, handleChannelRemove, handleIQRUpdate }) {
  const [open, toggle] = useReducer(v => !v, false);

  const handleColorSelect = (color) => {
    handlePropertyChange('color', color);
  };

  const handleRemove = () => {
    toggle();
    handleChannelRemove();
  };

  return (
    <PopperMenu
      open={open}
      toggle={toggle}
      buttonIcon={<MoreVertIcon fontSize="small" />}
      buttonStyles={{ backgroundColor: 'transparent' }}
    >
      <MenuItem dense disableGutters onClick={handleRemove}>
        <MuiSpan>Remove</MuiSpan>
      </MenuItem>
      <MenuItem dense disableGutters onClick={handleIQRUpdate}>
        <MuiSpan>Use IQR</MuiSpan>
      </MenuItem>
      <MenuItem dense disableGutters className={colorPaletteStyles().colors}>
        <ColorPalette handleChange={handleColorSelect} />
      </MenuItem>
    </PopperMenu>
  );
}

export default ChannelOptions;
