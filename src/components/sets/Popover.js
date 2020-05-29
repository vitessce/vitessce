import React from 'react';
import HelpTooltip from './HelpTooltip';

/**
 * This is a wrapper around the HelpTooltip component, to style it as a popover,
 * and change the trigger to "click" rather than "hover".
 * @param {*} props Props are passed through to the HelpTooltip component.
 */
export default function Popover(props) {
  return (
    <HelpTooltip {...props} />
  );
}

Popover.defaultProps = {
  overlayClassName: 'popover',
  placement: 'top',
  trigger: 'click',
  mouseEnterDelay: 0,
  mouseLeaveDelay: 0,
};
