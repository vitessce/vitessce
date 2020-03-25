import React from 'react';
import CellTooltipText from './CellTooltipText';

export default function CellTooltip2D(props) {
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
  // Convert the DeckGL coordinates to pixel coordinates.
  const [x, y] = viewInfo.viewport.project(hoveredCellInfo.mappings[mapping]);
  // Check if out of bounds.
  if (x < 0 || x > viewInfo.width || y < 0 || y > viewInfo.height) {
    return null;
  }
  // If we're in the component that triggered the event, do not show the crosshair.
  // Instead, show a text tooltip.
  if (hoveredCellInfo.uuid === uuid) {
    return (
      <CellTooltipText
        cellId={hoveredCellInfo.cellId}
        factors={hoveredCellInfo.factors}
        x={x}
        y={y}
        parentWidth={viewInfo.width}
        parentHeight={viewInfo.height}
      />
    );
  }
  const width = 1;
  // If we're _not_ in the component that triggered the event, show the crosshair.
  return (
    <>
      <div
        className="cell-emphasis-crosshair"
        style={{
          left: `${x - width / 2}px`,
          top: 0,
          width: `${width}px`,
          height: `${viewInfo.height}px`,
        }}
      />
      <div
        className="cell-emphasis-crosshair"
        style={{
          left: 0,
          top: `${y - width / 2}px`,
          width: `${viewInfo.width}px`,
          height: `${width}px`,
        }}
      />
    </>
  );
}
