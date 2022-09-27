import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import LensIcon from '@material-ui/icons/Lens';
import { makeStyles } from '@material-ui/core/styles';


import { VIEWER_PALETTE } from '../utils';

const useStyles = makeStyles(theme => ({
  container: {
    width: '70px',
    height: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '3px',
    width: '16px',
  },
  icon: {
    width: '17px',
    height: '17px',
    stroke: theme.palette.action.selected,
    'stroke-width': '1px',
  },
}));

const ColorPalette = ({ handleChange }) => {
  const classes = useStyles();
  return (
    <div className={classes.container} aria-label="color-swatch">
      {VIEWER_PALETTE.map(color => (
        <IconButton
          className={classes.button}
          key={color}
          onClick={() => handleChange(color)}
        >
          <LensIcon
            fontSize="small"
            style={{ color: `rgb(${color})` }}
            className={classes.icon}
          />
        </IconButton>
      ))}
    </div>
  );
};

export default ColorPalette;
