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
  const { setActiveTool, isActiveTool } = props;
  return (
    <div className="tool">
      <IconButton
        src="https://s3.amazonaws.com/vitessce-data/assets/material/near_me.svg"
        alt="pointer tool"
        onClick={() => setActiveTool(POINTER)}
        isActive={isActiveTool(POINTER)}
      />
      <IconButton
        src="https://s3.amazonaws.com/vitessce-data/assets/material/selection.svg"
        alt="select rectangle"
        onClick={() => setActiveTool(SELECT_RECTANGLE)}
        isActive={isActiveTool(SELECT_RECTANGLE)}
      />
    </div>
  );
}
