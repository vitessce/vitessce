/* eslint-disable */
import React, { useRef, useCallback } from 'react';
import RcTooltip from 'rc-tooltip';

/**
 * This is a small wrapper around the Tooltip component from the rc-tooltip library,
 * which is required to be able to apply theme styles to the tooltip.
 * This is because the default `getPopupContainer` function used by antd
 * just returns `document.body` (see https://ant.design/components/tooltip/#API),
 * but theme styles are applied using a sibling class on `.vitessce-container`
 * (which is a child of `body`).
 * https://github.com/hubmapconsortium/vitessce/pull/494#discussion_r395957914
 * @param {*} props Props are passed through to the <Tooltip/> from the antd library.
 */
export default function Tooltip(props) {
  const { title, children } = props;
  const spanRef = useRef();

  const getTooltipContainer = useCallback(() => {
    if (spanRef.current) {
      return spanRef.current.closest('.vitessce-container');
    }
    return null;
  }, [spanRef]);

  return (
    <>
      <span ref={spanRef} />
        <RcTooltip
          getTooltipContainer={getTooltipContainer}
          overlayClassName="vitessce-tooltip"
          title={title}
        >
          {children}
        </RcTooltip>
    </>
  );
}
