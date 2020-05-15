/* eslint-disable */
// done
import React, { useReducer, useRef } from 'react';

import {
  StyledDashedButton, StyledAddIcon, StyledPaper,
  StyledPopper, StyledMenuItem, StyledMenuList,
  StyledClickAwayListener
} from './styles';

function ImageAddButton({ imageOptions, handleImageAdd }) {
  const [open, toggle] = useReducer(v => !v, false);
  const anchorRef = useRef(null);

  const handleAdd = (imgData) => {
    toggle();
    handleImageAdd(imgData);
  };

  if (!imageOptions) return null;
  return (
    <>
      <StyledDashedButton
        onClick={toggle}
        fullWidth
        variant="outlined"
        startIcon={<StyledAddIcon />}
        size="small"
        ref={anchorRef}
      >
            Add Image Layer
      </StyledDashedButton>
      <StyledPopper open={open} anchorEl={anchorRef.current} placement="bottom-end">
        <StyledPaper>
          <StyledClickAwayListener onClickAway={toggle}>
            <StyledMenuList id="image-layer-options">
              {imageOptions.map(imgData => (
                <StyledMenuItem
                  dense
                  key={imgData.name}
                  onClick={() => handleAdd(imgData)}
                >
                  <span>{imgData.name}</span>
                </StyledMenuItem>
              ))}
            </StyledMenuList>
          </StyledClickAwayListener>
        </StyledPaper>
      </StyledPopper>
    </>
  );
}

export default ImageAddButton;
