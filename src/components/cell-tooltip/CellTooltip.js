import React from 'react';

export default function CellTooltip(props) {
  const {
    hoveredCellInfo,
    mapping,
    viewInfo,
    uuid,
  } = props;
  // Check that all data necessary to show the tooltip has been passed.
  if (!hoveredCellInfo || !viewInfo || !uuid || !viewInfo.viewport || !mapping) {
    return null;
  }
  // Convert the DeckGL coordinates to pixel coordinates
  const [x, y] = viewInfo.viewport.project(hoveredCellInfo.mappings[mapping]);
  // Check if out of bounds.
  if (x < 0 || x > viewInfo.width || y < 0 || y > viewInfo.height) {
    return null;
  }
  // If we're in the component that triggered the event, do not show the crosshair.
  if (hoveredCellInfo.uuid === uuid) {
    // In the future, potentially show a tooltip with `hoveredCellInfo.status`.
    return null;
  }
  const width = 1;
  const length = 20;
  // If we're _not_ in the component that triggered the event, show the crosshair.
  return (
    <div>
      <div
        className="cell-emphasis"
        style={{
          left: `${x - width / 2}px`,
          top: `${y - length / 2}px`,
          width: `${width}px`,
          height: `${length}px`,
        }}
      />
      <div
        className="cell-emphasis"
        style={{
          left: `${x - length / 2}px`,
          top: `${y - width / 2}px`,
          width: `${length}px`,
          height: `${width}px`,
        }}
      />
    </div>
  );
}
