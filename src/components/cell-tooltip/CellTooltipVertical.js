import React from 'react';

export default function CellTooltipVertical(props) {
  const {
    hoveredCellInfo,
    cellX,
    uuid,
  } = props;
  // Check that all data necessary to show the tooltip has been passed.
  if (!hoveredCellInfo || !uuid || !cellX) {
    return null;
  }
  const x = cellX;
  const y = 0;
  // If we're in the component that triggered the event, do not show the vertical line.
  if (hoveredCellInfo.uuid === uuid) {
    // In the future, potentially show a tooltip with `hoveredCellInfo.status`.
    return null;
  }
  const width = 1;
  const length = 30;
  // If we're _not_ in the component that triggered the event, show the vertical line.
  return (
    <React.Fragment>
      <div
        className="cell-emphasis-vertical"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${length}px`,
        }}
      />
    </React.Fragment>
  );
}
