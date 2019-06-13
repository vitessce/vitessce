import React from 'react';

export default function StatusTooltip(props) {
  const {
    hoveredCellInfo = null,
    mapping,
    viewInfo,
    uuid,
  } = props;
  if (hoveredCellInfo && viewInfo.viewport && mapping) {
    // Convert the DeckGL coordinates to pixel coordinates
    // using the DeckGL viewport's `project` function
    const projectedXY = viewInfo.viewport.project(hoveredCellInfo.mappings[mapping]);
    const x = projectedXY[0];
    const y = projectedXY[1];
    // Only show the tooltip element if the hovered cell
    // is within the current DeckGL zoom boundaries,
    // and if the uuid of the tooltip matches the one that triggered
    // the hover effect
    if (hoveredCellInfo.uuid === uuid
        && x >= 0 && x <= viewInfo.width && y >= 0 && y <= viewInfo.height) {
      // Position a circle-shaped <div> element on top of the hovered cell
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
  }
  return (<div />);
}
