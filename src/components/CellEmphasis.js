import React from 'react';

export default function CellTooltip(props) {
  const {
    hoveredCellInfo = null,
  } = props;
  console.log(hoveredCellInfo);
  return (
    <div className="cell-tooltip">
      {hoveredCellInfo ? hoveredCellInfo.cellId : null}
    </div>
  );
}
