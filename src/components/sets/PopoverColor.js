import React from 'react';
import tinycolor from 'tinycolor2';
import { Popover } from 'antd';
import { SketchPicker } from 'react-color';
import 'antd/es/popover/style/index.css';
import { PALETTE } from '../utils';

function toHex(rgbArray) {
  return `#${tinycolor({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }).toHex()}`;
}

export default function PopoverColor(props) {
  const {
    prefixClass, placement, color, setColor,
  } = props;

  function handleChangeComplete({ rgb }) {
    if (!rgb) {
      return;
    }
    setColor([rgb.r, rgb.g, rgb.b]);
  }

  const presetColors = PALETTE.map(toHex);

  return (
    <Popover
      content={(
        <SketchPicker
          disableAlpha
          width={146}
          presetColors={presetColors}
          color={toHex(color)}
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
        style={{ backgroundColor: toHex(color) }}
      />
    </Popover>
  );
}
