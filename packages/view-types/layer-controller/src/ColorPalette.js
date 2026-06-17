import React from 'react';
import { IconButton, makeStyles, Lens as LensIcon } from '@vitessce/styles';
import { VIEWER_PALETTE } from '@vitessce/utils';

const useStyles = makeStyles()(theme => ({
  paletteContainer: {
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
    strokeWidth: '1px',
  },
}));

const ColorPalette = ({ handleChange }) => {
  const { classes } = useStyles();
  return (
    <div className={classes.paletteContainer} aria-label="Color swatch">
      {VIEWER_PALETTE.map(color => (
        <IconButton
          className={classes.button}
          key={color}
          onClick={() => handleChange(color)}
          aria-label={`Change color to ${color}`}
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
