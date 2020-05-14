/* eslint-disable */
import React, { useState } from 'react';
import { TwitterPicker } from 'react-color';
import { callbackOnKeyPress, toHexString } from './utils';
import { PALETTE } from '../utils';
import Popover from './Popover';

function PopoverMenuListButton(props) {
  const {
    title, subtitle, onClick, handler, handlerKey, confirm,
  } = props;

  const [isConfirming, setIsConfirming] = useState(false);

  function handleOrRequireConfirm() {
    if (!confirm || isConfirming) {
      onClick();
      handler();
    } else {
      setIsConfirming(true);
    }
  }

  const titleWithConfirm = `${isConfirming ? 'Confirm ' : ''}${title}`;

  return (
    <button
      title={titleWithConfirm}
      type="button"
      onClick={handleOrRequireConfirm}
      onKeyPress={e => callbackOnKeyPress(e, handlerKey, handleOrRequireConfirm)}
    >{titleWithConfirm}
    {subtitle ? (<><br /><span className="small">{subtitle}</span></>) : null}
    </button>
  );
}

function PopoverMenuList(props) {
  const {
    menuConfig,
    onClick,
    color = null,
    palette = null,
    setColor = null,
  } = props;

  function handleColorChange({ rgb }) {
    if (!rgb) {
      return;
    }
    if (setColor) {
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
          <li key={item.title}>
            <PopoverMenuListButton
              {...item}
              onClick={onClick}
            />
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
      content={(
        <PopoverMenuList
          menuConfig={menuConfig}
          onClick={closePopover}
          color={color}
          setColor={setColor}
          palette={palette}
        />
)}
      placement={placement}
      visible={visible}
      onVisibleChange={setVisible}
    >
      {children}
    </Popover>
  );
}
