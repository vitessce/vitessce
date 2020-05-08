/* eslint-disable */
import React, { useState } from 'react';
import { callbackOnKeyPress } from './utils';
import tinycolor from 'tinycolor2';
import { TwitterPicker } from 'react-color';
import { PALETTE } from '../utils';
import Popover from './Popover';

function toHexString(rgbArray) {
  return tinycolor({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }).toHexString();
}

function PopoverMenuList(props) {
  const { menuConfig, onClick, color = null, palette = null, setColor = null } = props;

  function handleColorChange({ rgb }) {
    if (!rgb) {
      return;
    }
    if(setColor) {
      setColor([rgb.r, rgb.g, rgb.b]);
    }
  }

  const presetColors = (palette && palette.map(toHexString)) || PALETTE.map(toHexString);

  return (
    <div>
      {color && setColor && presetColors ? (
        <TwitterPicker
          className="popover-menu-color"
          disableAlpha
          width={108}
          triangle="hide"
          colors={presetColors}
          color={toHexString(color)}
          onChangeComplete={handleColorChange}
        />
      ) : null}
      <ul className="popover-menu-list">
        {menuConfig.map(item => (
          <li key={item.name}>
            <button
              title={item.name}
              type="button"
              onClick={() => {
                onClick();
                item.handler();
              }}
              onKeyPress={e => callbackOnKeyPress(e, item.handlerKey, () => {
                onClick();
                item.handler();
              })}
            >{item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PopoverMenu(props) {
  const {
    menuConfig, placement, children, onClose,
    color = null, setColor = null, palette = null,
  } = props;

  const [visible, setVisible] = useState(false);

  function closePopover() {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  }

  return (
    <Popover
      content={<PopoverMenuList
        menuConfig={menuConfig}
        onClick={closePopover}
        color={color}
        setColor={setColor}
        palette={palette}
      />}
      placement={placement}
      visible={visible}
      onVisibleChange={(v) => { console.log(v); setVisible(v); }}
    >
      {children}
    </Popover>
  );
}
