/* eslint-disable */
import React from 'react';
import HelpTooltip from './HelpTooltip';

/**
 * This is a small wrapper around the Popover component from the antd library,
 * which is required to be able to apply theme styles to the popover.
 * This is because the default `getPopupContainer` function used by antd
 * just returns `document.body` (see https://ant.design/components/tooltip/#API),
 * but theme styles are applied using a sibling class on `.vitessce-container`
 * (which is a child of `body`).
 * https://github.com/hubmapconsortium/vitessce/pull/494#discussion_r395957914
 * @param {*} props Props are passed through to the <Popover/> from the antd library.
 */
export default function Popover(props) {
  return (
    <HelpTooltip {...props} />
  );
}

Popover.defaultProps = {
  overlayClassName: "popover",
  placement: "top",
  trigger: "click",
  mouseEnterDelay: 0,
  mouseLeaveDelay: 0
};
