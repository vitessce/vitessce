import React, { useReducer } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import MenuItem from '@material-ui/core/MenuItem';
import { PopperMenu } from '../shared-mui/components';

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
  const [open, toggle] = useReducer(v => !v, false);
  const classes = useStyles();

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
      buttonClassName={classes.addButton}
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
