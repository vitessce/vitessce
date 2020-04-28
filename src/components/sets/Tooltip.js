/* eslint-disable */
import React, { useRef, useCallback } from 'react';
import { Tooltip } from 'antd';
import 'antd/es/tooltip/style/index.css';

/**
 * This is a small wrapper around the Tooltip component from the antd library,
 * which is required to be able to apply theme styles to the tooltip.
 * This is because the default `getPopupContainer` function used by antd
 * just returns `document.body` (see https://ant.design/components/tooltip/#API),
 * but theme styles are applied using a sibling class on `.vitessce-container`
 * (which is a child of `body`).
 * https://github.com/hubmapconsortium/vitessce/pull/494#discussion_r395957914
 * @param {*} props Props are passed through to the <Tooltip/> from the antd library.
 */
export default function VitessceTooltip(props) {
  const { title, children } = props;
  const spanRef = useRef();

  const getPopupContainer = useCallback(() => {
    if (spanRef.current) {
      return spanRef.current.closest('.vitessce-container');
    }
    return null;
  }, [spanRef]);

  return (
    <>
      <span ref={spanRef} />
        <Tooltip
          getPopupContainer={getPopupContainer}
          overlayClassName="vitessce-tooltip"
          title={title}
        >
          {children}
        </Tooltip>
    </>
  );
}
