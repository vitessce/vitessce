import React, { useReducer, useRef } from 'react';

import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { useOptionStyles } from './styles';

const buttonStyles = {
  borderStyle: 'dashed',
  marginTop: '10px',
  fontWeight: 400,
};

function ImageAddButton({ imageOptions, handleImageAdd }) {
  const [open, toggle] = useReducer(v => !v, false);
  const anchorRef = useRef(null);

  const classes = useOptionStyles();

  const handleAdd = (imgData) => {
    toggle();
    handleImageAdd(imgData);
  };

  if (!imageOptions) return null;
  return (
    <>
      <Button
        onClick={toggle}
        fullWidth
        variant="outlined"
        style={buttonStyles}
        startIcon={<AddIcon />}
        size="small"
        ref={anchorRef}
      >
            Add Image Layer
      </Button>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-end">
        <Paper className={classes.paper} style={{ maxHeight: 200, overflow: 'auto' }}>
          <ClickAwayListener onClickAway={toggle}>
            <MenuList id="image-layer-options">
              {imageOptions.map(imgData => (
                <MenuItem
                  dense
                  key={imgData.name}
                  onClick={() => handleAdd(imgData)}
                >
                  <span>{imgData.name}</span>
                </MenuItem>
              ))}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
}

export default ImageAddButton;
