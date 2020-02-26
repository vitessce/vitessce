import React from 'react';
import tinycolor from 'tinycolor2';
import { Popover } from 'antd';
import { TwitterPicker } from 'react-color';
import 'antd/es/popover/style/index.css';
import { PALETTE } from '../utils';

function toHexString(rgbArray) {
  return tinycolor({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }).toHexString();
}

export default function PopoverColor(props) {
  const {
    prefixClass, placement, color, setColor, palette
  } = props;

  function handleChangeComplete({ rgb }) {
    if (!rgb) {
      return;
    }
    setColor([rgb.r, rgb.g, rgb.b]);
  }

  const presetColors = (palette && palette.map(toHexString)) || PALETTE.map(toHexString);

  return (
    <Popover
      overlayClassName="vitessce-popover"
      content={(
        <TwitterPicker
          className="popover-color"
          disableAlpha
          width={130}
          triangle="hide"
          colors={presetColors}
          color={toHexString(color)}
          onChangeComplete={handleChangeComplete}
        />
      )}
      placement={placement}
      trigger="click"
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
    >
      <span
        className={`${prefixClass}-set-color`}
        style={{ backgroundColor: toHexString(color) }}
      />
    </Popover>
  );
}
