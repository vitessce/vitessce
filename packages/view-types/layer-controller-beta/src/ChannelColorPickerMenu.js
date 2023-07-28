import React, { useState } from 'react';
import {
  makeStyles,
} from '@material-ui/core';
import { PopperMenu } from '@vitessce/vit-s';
import { TwitterPicker } from 'react-color-with-lodash';
import { colorArrayToString } from '@vitessce/sets-utils';
import { PATHOLOGY_PALETTE } from '@vitessce/utils';


const useStyles = makeStyles(() => ({
  colorIcon: {
    width: '18px !important',
    height: '18px !important',
    cursor: 'pointer',
    position: 'relative',
    outline: 'none',
    float: 'left',
    borderRadius: '4px',
    margin: '8px',
  },
  colorIconButton: {
    height: '100%',
  },
  colorPicker: {
    boxShadow: 'none !important',
    margin: '0 auto',
    /* Sets margins around color picker and centers */
    '& > div:nth-child(3)': {
      padding: '6px !important',
      transform: 'translate(2px, 0)',
    },
    '& > div > div:nth-of-type(1)': {
      fontSize: '12px',
      width: '20px !important',
    },
    '& input': {
      width: '60px !important',
      fontSize: '12px',
    },
    /* Sets smaller color squares */
    '& > div > span > div': {
      width: '18px !important',
      height: '18px !important',
    },
  },
}));

export default function ChannelColorPickerMenu(props) {
  const {
    color,
    setColor,
    palette = null,
    isStaticColor,
    visible,
  } = props;

  const defaultPalette = palette
    ? palette.map(colorArrayToString)
    : PATHOLOGY_PALETTE.map(colorArrayToString);

  const [open, setOpen] = useState(false);

  function handleColorChange({ rgb }) {
    if (rgb && setColor) {
      setColor([rgb.r, rgb.g, rgb.b]);
      // TODO: set obsColorEncoding when user changes color also
    }
  }

  const classes = useStyles();

  const currentColor = color
    ? colorArrayToString(color)
    : colorArrayToString([0, 0, 0]);

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={
        isStaticColor && visible ? (
          <div className={classes.colorIcon} style={{ backgroundColor: currentColor }} />
        ) : (
          // TODO: show quantitative colormap in color box when (visible && !isStaticColor)
          <div className={classes.colorIcon} />
        )
      }
      buttonClassName={classes.colorIconButton}
      withPaper={false}
    >
      <TwitterPicker
        className={classes.colorPicker}
        disableAlpha
        width={108}
        triangle="hide"
        colors={defaultPalette}
        color={currentColor}
        onChangeComplete={handleColorChange}
      />
    </PopperMenu>
  );
}
