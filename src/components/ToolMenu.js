import React from 'react';

import { POINTER, SELECT_RECTANGLE } from './tools';

export function IconButton(props) {
  const {
    src, alt, onClick, isActive,
  } = props;
  const inactive = 'btn btn-outline-secondary mr-2 icon';
  const active = `${inactive} active`;
  return (
    <button
      className={isActive ? active : inactive}
      onClick={onClick}
      type="button"
    >
      <img src={src} alt={alt} />
    </button>
  );
}

export default function ToolMenu(props) {
  const { setTool, isTool } = props;
  return (
    <div className="tool">
      <IconButton
        src="https://s3.amazonaws.com/vitessce-data/assets/material/near_me.svg"
        alt="pointer tool"
        onClick={() => setTool(POINTER)}
        isActive={isTool(POINTER)}
      />
      <IconButton
        src="https://s3.amazonaws.com/vitessce-data/assets/material/selection.svg"
        alt="select rectangle"
        onClick={() => setTool(SELECT_RECTANGLE)}
        isActive={isTool(SELECT_RECTANGLE)}
      />
    </div>
  );
}
