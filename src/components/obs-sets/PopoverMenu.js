import React, { useState, useEffect } from 'react';
import { TwitterPicker } from 'react-color';
import { colorArrayToString, callbackOnKeyPress } from './utils';
import { PALETTE } from '../utils';
import Popover from './Popover';

/**
 * Wrapper around a button element that supports asking for confirmation.
 * @param {object} props
 * @param {string} props.title The main button text.
 * @param {string} props.subtitle Smaller text on a line beneath the main text. Optional.
 * @param {function} props.onClick A "clean up" handler passed from the parent,
 * to alert the parent Popover component that it should close the popover after the button has
 * fired its handler.
 * @param {function} props.handler A function to call on button click (or after confirmation).
 * @param {string} props.handlerKey A key associated with the button, to support accessibility.
 * @param {boolean} props.confirm Does the user need to press the button again to confirm?
 * By default, false.
 * @param {boolean} props.visible The visibility state from the parent popover,
 * so that on visibility change, the button can clear its confirmation state.
 */
function PopoverMenuListButton(props) {
  const {
    title, subtitle, onClick, handler, handlerKey, confirm,
    visible,
  } = props;

  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    // Want to clear the "confirming",
    // state if the user hides the popover.
    setIsConfirming(false);
  }, [visible]);

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
      {subtitle && (<><br /><span className="small">{subtitle}</span></>)}
    </button>
  );
}

/**
 * Helper component to create a list of buttons for the body of a popover.
 * If the color, setColor, and palette props are provided then a color picker
 * will be rendered at the top of the button list.
 * @param {object} props
 * @param {object[]} props.menuConfig The list of button definition objects.
 * `{ title, subtitle, confirm, handler, handlerKey }`
 * @param {function} props.onClick A "clean up" handler passed from the parent,
 * to alert the parent Popover component that it should close the popover after the button has
 * fired its handler.
 * @param {number[]} props.color The current color. Optional.
 * @param {string} props.palette The color palette for the color picker. Optional.
 * @param {boolean} props.setColor The handler to call when a color has been selected. Optional.
 * @param {boolean} props.visible The visibility state from the parent popover,
 * so that on visibility change, buttons can clear confirmation states.
 */
function PopoverMenuList(props) {
  const {
    menuConfig,
    onClick,
    color = null,
    palette = null,
    setColor = null,
    visible,
  } = props;

  function handleColorChange({ rgb }) {
    if (rgb && setColor) {
      setColor([rgb.r, rgb.g, rgb.b]);
    }
  }

  const defaultPalette = palette
    ? palette.map(colorArrayToString)
    : PALETTE.concat([[255, 255, 255], [128, 128, 128], [0, 0, 0]]).map(colorArrayToString);

  return (
    <div>
      {color && setColor && defaultPalette && (
        <TwitterPicker
          className="popover-menu-color"
          disableAlpha
          width={108}
          triangle="hide"
          colors={defaultPalette}
          color={colorArrayToString(color)}
          onChangeComplete={handleColorChange}
        />
      )}
      <ul className="popover-menu-list">
        {menuConfig.map(item => (
          <li key={item.title + item.subtitle}>
            <PopoverMenuListButton
              {...item}
              onClick={onClick}
              visible={visible}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Helper component to create a popover component with a list of buttons.
 * If the color, setColor, and palette props are provided then a color picker
 * will be rendered at the top of the button list.
 * @param {object} props
 * @param {object[]} props.menuConfig The list of button definition objects.
 * `{ title, subtitle, confirm, handler, handlerKey }`
 * @param {string} placement Where to place the popover (top, bottom, left, right).
 * @param {number[]} props.color The current color. Optional.
 * @param {string} props.palette The color palette for the color picker. Optional.
 * @param {boolean} props.setColor The handler to call when a color has been selected. Optional.
 * @param {Element|React.Component} props.children Children to render,
 * which will trigger the popover on click.
 */
export default function PopoverMenu(props) {
  const {
    menuConfig, placement, children,
    color = null, setColor = null, palette = null,
  } = props;

  const [visible, setVisible] = useState(false);

  return (
    <Popover
      content={(
        <PopoverMenuList
          menuConfig={menuConfig}
          onClick={() => setVisible(false)}
          color={color}
          setColor={setColor}
          palette={palette}
          visible={visible}
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
