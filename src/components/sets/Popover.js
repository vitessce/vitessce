import React, { useRef, useCallback } from 'react';
import { Popover } from 'antd';
import 'antd/es/popover/style/index.css';

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
