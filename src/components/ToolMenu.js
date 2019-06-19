import React from 'react';

import { SELECTION_TYPE } from 'nebula.gl';

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
        onClick={() => setActiveTool(null)}
        isActive={isActiveTool(null)}
      />
      <IconButton
        src="https://s3.amazonaws.com/vitessce-data/assets/material/selection.svg"
        alt="select rectangle"
        onClick={() => setActiveTool(SELECTION_TYPE.RECTANGLE)}
        isActive={isActiveTool(SELECTION_TYPE.RECTANGLE)}
      />
      <IconButton
        src="https://s3.amazonaws.com/vitessce-data/assets/material/selection.svg"
        alt="select polygon"
        onClick={() => setActiveTool(SELECTION_TYPE.POLYGON)}
        isActive={isActiveTool(SELECTION_TYPE.POLYGON)}
      />
    </div>
  );
}
