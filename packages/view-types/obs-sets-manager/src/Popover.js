import React from 'react';
import HelpTooltip from './HelpTooltip.js';

/**
 * This is a wrapper around the HelpTooltip component, to style it as a popover,
 * and change the trigger to "click" rather than "hover".
 * @param {*} props Props are passed through to the HelpTooltip component.
 */
export default function Popover(props) {
  const {
    overlayClassName = 'popover',
    placement = 'top',
    trigger = 'click',
    mouseEnterDelay = 0,
    mouseLeaveDelay = 0,
  } = props;
  return (
    <HelpTooltip
      {...props}
      overlayClassName={overlayClassName}
      placement={placement}
      trigger={trigger}
      mouseEnterDelay={mouseEnterDelay}
      mouseLeaveDelay={mouseLeaveDelay}
    />
  );
}
