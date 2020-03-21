import React, { useRef, useCallback } from 'react';
import { Popover } from 'antd';
import 'antd/es/popover/style/index.css';

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
export default function VitesscePopover(props) {
  const spanRef = useRef();

  const getPopupContainer = useCallback(() => {
    if (spanRef.current) {
      return spanRef.current.closest('.vitessce-container');
    }
    return null;
  }, [spanRef]);

  return (
    <React.Fragment>
      <span ref={spanRef} />
      {spanRef.current ? (
        <Popover
          getPopupContainer={getPopupContainer}
          overlayClassName="vitessce-popover"
          {...props}
        />
      ) : null}
    </React.Fragment>
  );
}
