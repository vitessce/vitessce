import React, { useEffect, useRef, useState } from 'react';
import { TOOLTIP_ANCESTOR } from '../classNames';
import CellTooltip from './CellTooltip';

/**
 * A tooltip component that also incorporates a crosshair element.
 * @param {object} props
 * @param {string} props.uuid A unique identifier corresponding to the plot
 * with which this scatterplot is associated. Used by the default getter props.
 * @param {integer} props.cellIndex The index of the cell of interest.
 * Used to compute the y position.
 * @param {integer} props.numCells The total number of cells.
 * Used to compute the y position.
 * @param {object} props.hoveredCellInfo Used by all default getter props.
 * An object `{ uuid: "plot-1", ... }`
 * @param {function} props.getIsCrosshairVisible Function that returns
 * a boolean value, whether the crosshair should be rendered.
 * By default, if the `uuid` does _not_ match the component that triggered the hover event,
 * show the vertical line.
 * @param {function} props.getIsTooltipVisible Function that returns
 * a boolean value, whether the tooltip should be rendered.
 * By default, if the `uuid` matches the component that triggered the hover event,
 * show the tooltip.
 * @param {React.Component} props.children The tooltip contents as a react component.
 */
export default function CellTooltip1DVertical(props) {
  const {
    uuid,
    hoveredCellInfo,
    cellIndex,
    numCells,
    getIsCrosshairVisible = () => (hoveredCellInfo && hoveredCellInfo.uuid !== uuid),
    getIsTooltipVisible = () => (hoveredCellInfo && hoveredCellInfo.uuid === uuid),
    children,
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
  if (!uuid || !cellIndex || !numCells) {
    return null;
  }
  const isTooltipVisible = getIsTooltipVisible();
  const isCrosshairVisible = getIsCrosshairVisible();
  return (
    <>
      {isTooltipVisible && (
        <div ref={ref} className="cell-tooltip-wrapper">
          <CellTooltip
            x={x}
            y={y}
            parentWidth={parentWidth}
            parentHeight={parentHeight}
          >
            {children}
          </CellTooltip>
        </div>
      )}
      {isCrosshairVisible && (
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
      )}
    </>
  );
}
