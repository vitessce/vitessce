import React, { useReducer } from 'react';

import AddIcon from '@material-ui/icons/Add';
import MenuItem from '@material-ui/core/MenuItem';
import { PopperMenu } from '../shared-mui/components';

function ImageAddIcon() {
  return (
    <>
      <AddIcon />
      Add Image Layer
    </>
  );
}

function ImageAddButton({ imageOptions, handleImageAdd }) {
  const [open, toggle] = useReducer(v => !v, false);

  const handleAdd = (imgData) => {
    toggle();
    handleImageAdd(imgData);
  };

  if (!imageOptions) return null;
  return (
    <PopperMenu
      open={open}
      toggle={toggle}
      buttonIcon={<ImageAddIcon />}
      buttonStyles={{
        marginTop: '10px',
        marginBottom: '10px',
        fontWeight: 400,
      }}
    >
      {imageOptions.map(imgData => (
        <MenuItem dense key={imgData.name} onClick={() => handleAdd(imgData)}>
          <span>{imgData.name}</span>
        </MenuItem>
      ))}
    </PopperMenu>
  );
}

export default ImageAddButton;
