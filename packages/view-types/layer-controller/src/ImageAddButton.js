import React, { useState } from 'react';
import { IconButton, MenuItem } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PopperMenu } from '@vitessce/vit-s';
import { styled } from '@mui/material-pigment-css';

const StyledAddButton = styled(IconButton)({
  marginTop: '10px',
  marginBottom: '10px',
  fontWeight: 400,
});


function ImageAddIcon() {
  return (
    <>
      <AddIcon />
      Add Image Layer
    </>
  );
}

function ImageAddButton({ imageOptions, handleImageAdd }) {
  const [open, setOpen] = useState(false);

  const handleAdd = (imgData) => {
    setOpen(prev => !prev);
    handleImageAdd(imgData);
  };

  if (!imageOptions) return null;
  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<ImageAddIcon />}
      buttonComponent={StyledAddButton}
      placement="bottom-start"
      aria-label="Add image menu"
    >
      {imageOptions.map((imgData, i) => (
        <MenuItem dense key={imgData.name} onClick={() => handleAdd(i)}>
          <span>{imgData.name}</span>
        </MenuItem>
      ))}
    </PopperMenu>
  );
}

export default ImageAddButton;
