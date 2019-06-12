import React from 'react';

export default function CellTooltip(props) {
  const {
    hoveredCellInfo = null,
    mapping,
    viewInfo,
  } = props;
  return (
    hoveredCellInfo && viewInfo.viewport && mapping ? (
      <div
        className="cell-tooltip"
        style={{
          zIndex: 5,
          position: 'absolute',
          pointerEvents: 'none',
          left: `${viewInfo.viewport.project(hoveredCellInfo.mappings[mapping])[0] - 25}px`,
          top: `${viewInfo.viewport.project(hoveredCellInfo.mappings[mapping])[1] - 25}px`,
          width: '50px',
          height: '50px',
          border: '1px solid red',
          borderRadius: '50%',
        }}
      >
        {hoveredCellInfo.cellId}
      </div>
    ) : (
      <div />
    )
  );
}
