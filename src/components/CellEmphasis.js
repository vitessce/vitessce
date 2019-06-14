import React from 'react';

export default function CellEmphasis(props) {
  const {
    hoveredCellInfo = null,
    mapping,
    viewInfo,
    uuid,
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
  // If the uuid of the tooltip does match
  // the one that triggered the hover effect,
  // position tooltip with status text next to the hovered cell
  if (hoveredCellInfo.uuid === uuid) {
    return (
      <div
        className="cell-tooltip card bg-light"
        style={{
          left: `${x + 20}px`,
          top: `${y - 120}px`,
        }}
      >
        <p className="details">{hoveredCellInfo.status}</p>
      </div>
    );
  }
  // If the uuid of the tooltip does not match
  // the one that triggered the hover effect,
  // position a crosshair shape on top of the hovered cell
  return (
    <div>
      <div
        className="cell-emphasis"
        style={{
          left: `${x - 0.5}px`,
          top: `${y - 10}px`,
          width: '1px',
          height: '20px',
        }}
      />
      <div
        className="cell-emphasis"
        style={{
          left: `${x - 10}px`,
          top: `${y - 0.5}px`,
          width: '20px',
          height: '1px',
        }}
      />
    </div>
  );
}
