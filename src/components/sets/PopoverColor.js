import React from 'react';
import { Popover } from 'antd';
import { SketchPicker } from 'react-color';
import 'antd/es/popover/style/index.css';


export default function PopoverColor(props) {
  const {
    prefixClass, placement, color, setColor,
  } = props;

  function handleChangeComplete({ hex }) {
    setColor(hex);
  }

  return (
    <Popover
      content={<SketchPicker disableAlpha color={color} onChangeComplete={handleChangeComplete} />}
      placement={placement}
      trigger="click"
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
    >
      <span className={`${prefixClass}-set-color`} style={{ backgroundColor: color }} />
    </Popover>
  );
}
