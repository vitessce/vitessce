import React from 'react';
import { TwitterPicker } from 'react-color';
import { PALETTE } from '../utils';
import { colorToHexString } from './utils';
import Popover from './Popover';

export default function PopoverColor(props) {
  const {
    placement, color, setColor, palette,
  } = props;

  function handleChangeComplete({ rgb }) {
    if (!rgb) {
      return;
    }
    setColor([rgb.r, rgb.g, rgb.b]);
  }

  const presetColors = (palette && palette.map(colorToHexString)) || PALETTE.map(colorToHexString);

  return (
    <Popover
      content={(
        <TwitterPicker
          className="popover-color"
          disableAlpha
          width={130}
          triangle="hide"
          colors={presetColors}
          color={colorToHexString(color)}
          onChangeComplete={handleChangeComplete}
        />
      )}
      placement={placement}
      trigger="click"
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
    >
      <span
        className="set-color"
        style={{ backgroundColor: colorToHexString(color) }}
      />
    </Popover>
  );
}
