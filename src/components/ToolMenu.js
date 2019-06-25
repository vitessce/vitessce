import React from 'react';
import { SELECTION_TYPE } from 'nebula.gl';
import pointerIcon from '../assets/near_me.svg';
import selectRectangleIcon from '../assets/selection_rectangle.svg';
import selectPolygonIcon from '../assets/selection_polygon.svg';


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
        src={pointerIcon}
        alt="pointer tool"
        onClick={() => setActiveTool(null)}
        isActive={isActiveTool(null)}
      />
      <IconButton
        src={selectRectangleIcon}
        alt="select rectangle"
        onClick={() => setActiveTool(SELECTION_TYPE.RECTANGLE)}
        isActive={isActiveTool(SELECTION_TYPE.RECTANGLE)}
      />
      <IconButton
        src={selectPolygonIcon}
        alt="select polygon"
        onClick={() => setActiveTool(SELECTION_TYPE.POLYGON)}
        isActive={isActiveTool(SELECTION_TYPE.POLYGON)}
      />
    </div>
  );
}
