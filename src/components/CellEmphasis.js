import React from 'react';

export default function CellTooltip(props) {
  const {
    hoveredCellInfo = null,
    mapping,
    viewInfo,
  } = props;
  if (hoveredCellInfo && viewInfo.viewport && mapping) {
    const projectedXY = viewInfo.viewport.project(hoveredCellInfo.mappings[mapping]);
    const x = projectedXY[0];
    const y = projectedXY[1];
    // Only show the tooltip element if the hovered cell
    // is within the current DeckGL zoom boundaries
    if (x >= 0 && x <= viewInfo.width && y >= 0 && y <= viewInfo.height) {
      return (
        <div
          className="cell-tooltip"
          style={{
            zIndex: 5,
            position: 'absolute',
            pointerEvents: 'none',
            left: `${x - 25}px`,
            top: `${y - 25}px`,
            width: '50px',
            height: '50px',
            border: '1px solid red',
            borderRadius: '50%',
          }}
        >
          {hoveredCellInfo.cellId}
        </div>
      );
    }
  }
  return (<div />);
}
