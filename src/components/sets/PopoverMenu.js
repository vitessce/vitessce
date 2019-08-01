import React, { useState } from 'react';
import { Popover } from 'antd';
import 'antd/es/popover/style/index.css';

import { callbackOnKeyPress } from './utils';

function PopoverMenuList(props) {
  const { menuConfig, onClick } = props;

  return (
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
  );
}

export default function PopoverMenu(props) {
  const {
    menuConfig, placement, children, onClose,
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
      content={<PopoverMenuList menuConfig={menuConfig} onClick={closePopover} />}
      placement={placement}
      trigger="click"
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
      visible={visible}
      onVisibleChange={(v) => { setVisible(v); }}
    >
      {children}
    </Popover>
  );
}
