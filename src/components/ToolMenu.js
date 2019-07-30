import React from 'react';
import { SELECTION_TYPE } from 'nebula.gl';
import PointerIconSVG from '../assets/tools/near_me.svg';
import SelectRectangleIconSVG from '../assets/tools/selection_rectangle.svg';
import SelectPolygonIconSVG from '../assets/tools/selection_polygon.svg';


export function IconButton(props) {
  const {
    alt, onClick, isActive, children,
  } = props;
  const inactive = 'btn btn-outline-secondary mr-2 icon';
  const active = `${inactive} active`;
  return (
    <button
      className={isActive ? active : inactive}
      onClick={onClick}
      type="button"
      title={alt}
    >
      {children}
    </button>
  );
}

export default function ToolMenu(props) {
  const { setActiveTool, isActiveTool } = props;
  return (
    <div className="tool">
      <IconButton
        alt="pointer tool"
        onClick={() => setActiveTool(null)}
        isActive={isActiveTool(null)}
      ><PointerIconSVG />
      </IconButton>
      <IconButton
        alt="select rectangle"
        onClick={() => setActiveTool(SELECTION_TYPE.RECTANGLE)}
        isActive={isActiveTool(SELECTION_TYPE.RECTANGLE)}
      ><SelectRectangleIconSVG />
      </IconButton>
      <IconButton
        alt="select polygon"
        onClick={() => setActiveTool(SELECTION_TYPE.POLYGON)}
        isActive={isActiveTool(SELECTION_TYPE.POLYGON)}
      ><SelectPolygonIconSVG />
      </IconButton>
    </div>
  );
}
