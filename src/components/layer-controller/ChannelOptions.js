/* eslint-disable */
// done
import React, { useReducer, useRef } from 'react';

import {
  StyledIconButton, StyledMoreVertIcon,
  StyledClickAwayListener, StyledPaper,
  StyledPopper, StyledMenuItem, StyledMenuList,
  StyledColorsMenuItem
} from './styles';

import ColorPalette from './ColorPalette';

function ChannelOptions({ handlePropertyChange, handleChannelRemove }) {
  const [open, toggle] = useReducer(v => !v, false);
  const anchorRef = useRef(null);

  const handleColorSelect = (color) => {
    handlePropertyChange('color', color);
  };

  const handleRemove = () => {
    toggle();
    handleChannelRemove();
  };

  return (
    <>
      <StyledIconButton
        aria-label="Remove channel"
        size="small"
        onClick={toggle}
        ref={anchorRef}
      >
        <StyledMoreVertIcon fontSize="small" />
      </StyledIconButton>
      <StyledPopper open={open} anchorEl={anchorRef.current} placement="bottom-end">
        <StyledPaper>
          <StyledClickAwayListener onClickAway={toggle}>
            <StyledMenuList id="channel-options">
              <StyledMenuItem dense disableGutters onClick={handleRemove}>
                <StyledSpan>Remove</StyledSpan>
              </StyledMenuItem>
              <StyledColorsMenuItem dense disableGutters>
                <ColorPalette handleChange={handleColorSelect} />
              </StyledColorsMenuItem>
            </StyledMenuList>
          </StyledClickAwayListener>
        </StyledPaper>
      </StyledPopper>
    </>
  );
}

export default ChannelOptions;
