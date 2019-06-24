import React, { useEffect, useRef } from 'react';

export default function CellTooltip1DVertical(props) {
  const {
    hoveredCellInfo,
    cellIndex,
    numCells,
    uuid,
  } = props;
  // Check that all data necessary to show the tooltip has been passed.
  if (!hoveredCellInfo || !uuid || !cellIndex || !numCells) {
    return null;
  }
  // If we're in the component that triggered the event, do not show the vertical line.
  if (hoveredCellInfo.uuid === uuid) {
    // In the future, potentially show a tooltip with `hoveredCellInfo.status`.
    return null;
  }
  const y = 0;
  const lineWidth = 1;
  // Compute the x-position of the vertical emphasis element
  // based on the width of the sibling canvas.
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    // Obtain the width of the heatmap canvas.
    const { width } = el.parentNode.querySelector('canvas').getBoundingClientRect();
    // Obtain the height of the entire parent card element.
    const { height } = el.parentNode.getBoundingClientRect();
    const x = (cellIndex / numCells) * width;
    el.style.left = `${x - lineWidth / 2}px`;
    el.style.height = `${height}px`;
  });
  // If we're _not_ in the component that triggered the event, show the vertical line.
  return (
    <div
      ref={ref}
      className="cell-emphasis-vertical"
      style={{
        top: `${y}px`,
        width: `${lineWidth}px`,
      }}
    />
  );
}
