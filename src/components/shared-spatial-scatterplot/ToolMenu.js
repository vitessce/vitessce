import React from 'react';
import { SELECTION_TYPE } from 'nebula.gl';
import { ReactComponent as PointerIconSVG } from '../../assets/tools/near_me.svg';
import { ReactComponent as SelectRectangleIconSVG } from '../../assets/tools/selection_rectangle.svg';
import { ReactComponent as SelectLassoIconSVG } from '../../assets/tools/selection_lasso.svg';

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
  const {
    setActiveTool,
    activeTool,
    visibleTools = { pan: true, selectRectangle: false, selectLasso: true },
  } = props;
  return (
    <div className="tool">
      {visibleTools.pan && (
      <IconButton
        alt="pointer tool"
        onClick={() => setActiveTool(null)}
        isActive={activeTool === null}
      ><PointerIconSVG />
      </IconButton>
      )}
      {visibleTools.selectRectangle ? (
        <IconButton
          alt="select rectangle"
          onClick={() => setActiveTool(SELECTION_TYPE.RECTANGLE)}
          isActive={activeTool === SELECTION_TYPE.RECTANGLE}
        ><SelectRectangleIconSVG />
        </IconButton>
      ) : null}
      {visibleTools.selectLasso ? (
        <IconButton
          alt="select lasso"
          onClick={() => setActiveTool(SELECTION_TYPE.POLYGON)}
          isActive={activeTool === SELECTION_TYPE.POLYGON}
        ><SelectLassoIconSVG />
        </IconButton>
      ) : null}
    </div>
  );
}
