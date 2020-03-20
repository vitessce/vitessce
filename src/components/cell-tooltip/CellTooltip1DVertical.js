import React, { useEffect, useRef, useState } from 'react';
import { TOOLTIP_ANCESTOR } from '../classNames';
import CellTooltipText from './CellTooltipText';

export default function CellTooltip1DVertical(props) {
  const {
    hoveredCellInfo,
    cellIndex,
    numCells,
    uuid,
  } = props;

  const ref = useRef();
  const [x, setX] = useState(0);
  const [parentHeight, setParentHeight] = useState(0);
  const [parentWidth, setParentWidth] = useState(0);
  const y = 0;
  const lineWidth = 1;
  // Compute the desired x-position of the element
  // based on the width of the sibling heatmap canvas.
  useEffect(() => {
    const el = ref.current;
    if (!el || !cellIndex || !numCells) {
      return;
    }
    // Obtain the width of the heatmap canvas.
    const { width } = el.parentNode.querySelector('canvas').getBoundingClientRect();
    // Obtain the height of the entire parent card element.
    const { height } = el.closest(`.${TOOLTIP_ANCESTOR}`).getBoundingClientRect();
    setX((cellIndex / numCells) * width);
    setParentWidth(width);
    setParentHeight(height);
  }, [cellIndex, numCells]);

  // Check that all data necessary to show the tooltip has been passed.
  if (!hoveredCellInfo || !uuid || !cellIndex || !numCells) {
    return null;
  }

  // If we're in the component that triggered the event, do not show the vertical line.
  // Instead, show a tooltip with text.
  if (hoveredCellInfo.uuid === uuid) {
    return (
      <div ref={ref} className="cell-tooltip-wrapper">
        <CellTooltipText
          cellId={hoveredCellInfo.cellId}
          factors={hoveredCellInfo.factors}
          x={x}
          y={y}
          parentWidth={parentWidth}
          parentHeight={parentHeight}
        />
      </div>
    );
  }
  // If we're _not_ in the component that triggered the event, show the vertical line.
  return (
    <div
      ref={ref}
      className="cell-emphasis-vertical"
      style={{
        top: `${y}px`,
        left: `${x - lineWidth / 2}px`,
        width: `${lineWidth}px`,
        height: `${parentHeight}px`,
      }}
    />
  );
}
