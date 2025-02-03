/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import clsx from 'clsx';
import { isEqual } from 'lodash-es';
import { PopperMenu } from '@vitessce/vit-s';
import { TwitterPicker } from 'react-color-with-lodash';
import { colorArrayToString } from '@vitessce/sets-utils';
import { PATHOLOGY_PALETTE, getDefaultColor } from '@vitessce/utils';
import { getXlinkHref } from '@vitessce/legend';
import { css } from '@mui/material-pigment-css';

const colorIcon = css({
  width: '18px !important',
  height: '18px !important',
  cursor: 'pointer',
  position: 'relative',
  outline: 'none',
  float: 'left',
  borderRadius: '4px',
  margin: '8px',
});

const colorIconOutline = css({
  border: '1px solid silver',
});

const colorIconButton = css({
  height: '100%',
});

const colorPicker = css({
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
  '& > div > span > div[title="#ffffff"]': {
    border: '1px solid silver',
  },
});


export default function ChannelColorPickerMenu(props) {
  const {
    theme,
    color,
    setColor,
    palette = null,
    isStaticColor,
    isColormap,
    featureValueColormap,
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


  const currentColor = color
    ? colorArrayToString(color)
    : colorArrayToString(getDefaultColor(theme));

  return (
    <PopperMenu
      open={isStaticColor && visible ? open : false}
      setOpen={setOpen}
      buttonIcon={
        isStaticColor && visible ? (
          <div
            className={clsx(
              colorIcon,
              {
                [colorIconOutline]: theme !== 'dark' && isEqual(color, [255, 255, 255]),
              },
            )}
            style={{ backgroundColor: currentColor }}
          />
        ) : (
          isColormap && visible && featureValueColormap ? (
            <div className={colorIcon}>
              <svg width="18" height="18">
                <image
                  x={0}
                  y={0}
                  width={18}
                  height={18}
                  preserveAspectRatio="none"
                  href={getXlinkHref(featureValueColormap)}
                  clipPath="inset(0% round 4px)"
                />
              </svg>
            </div>
          ) : (
            <div className={colorIcon} />
          )
        )
      }
      buttonClassName={colorIconButton}
      withPaper={false}
      aria-label="Open color picker menu"
    >
      <TwitterPicker
        className={colorPicker}
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
