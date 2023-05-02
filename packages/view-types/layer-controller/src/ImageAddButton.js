import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/es/styles/index.js';
import AddIcon from '@material-ui/icons/esm/Add.js';
import MenuItem from '@material-ui/core/es/MenuItem/index.js';
import { PopperMenu } from '@vitessce/vit-s';

const useStyles = makeStyles(() => ({
  addButton: {
    marginTop: '10px',
    marginBottom: '10px',
    fontWeight: 400,
  },
}));

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
  const classes = useStyles();

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
      buttonClassName={classes.addButton}
      placement="bottom-start"
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
