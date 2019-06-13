import React from 'react';

export default function CellEmphasis(props) {
  const {
    hoveredCellInfo = null,
    mapping,
    viewInfo,
  } = props;
  if (!hoveredCellInfo || !viewInfo.viewport || !mapping) {
    return null;
  }
  // Convert the DeckGL coordinates to pixel coordinates
  // using the DeckGL viewport's `project` function
  const [x, y] = viewInfo.viewport.project(hoveredCellInfo.mappings[mapping]);
  // Only show the tooltip element if the hovered cell
  // is within the current DeckGL zoom boundaries
  if (x < 0 || x > viewInfo.width || y < 0 || y > viewInfo.height) {
    return null;
  }
  // Position a circle-shaped <div> element on top of the hovered cell
  return (
    <div
      className="cell-tooltip"
      style={{
        zIndex: 5,
        position: 'absolute',
        pointerEvents: 'none',
        left: `${x - 20}px`,
        top: `${y - 20}px`,
        width: '40px',
        height: '40px',
        border: '1px solid white',
        borderRadius: '50%',
      }}
    />
  );
}
