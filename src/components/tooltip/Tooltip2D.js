import React from 'react';
import Tooltip from './Tooltip';

/**
 * A tooltip component that also incorporates a crosshair element.
 * @param {object} props
 * @param {string} props.parentUuid A unique identifier corresponding to the plot
 * with which this scatterplot is associated.
 * @param {string} props.sourceUuid A unique identifier corresponding to the plot
 * from which this tooltip originated.
 * @param {number} props.x The x coordinate for the tooltip.
 * @param {number} props.y The y coordinate for the tooltip.
 * @param {number} props.parentWidth The width of the parent plot container element.
 * @param {number} props.parentHeight The height of the parent plot container element.
 * @param {React.Component} props.children The tooltip contents as a react component.
 */
export default function Tooltip2D(props) {
  const {
    parentUuid,
    sourceUuid,
    x,
    y,
    parentWidth,
    parentHeight,
    children,
  } = props;
  // Check if out of bounds.
  if (x < 0 || x > parentWidth || y < 0 || y > parentHeight) {
    return null;
  }
  // Show tooltip or crosshair?
  const isTooltipVisible = (parentUuid === sourceUuid);
  const crosshairWidth = 1;
  return (
    <>
      {isTooltipVisible ? (
        <Tooltip
          x={x}
          y={y}
          parentWidth={parentWidth}
          parentHeight={parentHeight}
        >
          {children}
        </Tooltip>
      ) : (
        <>
          {x !== null ? (
            <div
              className="cell-emphasis-crosshair"
              style={{
                left: `${x - crosshairWidth / 2}px`,
                top: 0,
                width: `${crosshairWidth}px`,
                height: `${parentHeight}px`,
              }}
            />
          ) : null}
          {y !== null ? (
            <div
              className="cell-emphasis-crosshair"
              style={{
                left: 0,
                top: `${y - crosshairWidth / 2}px`,
                width: `${parentWidth}px`,
                height: `${crosshairWidth}px`,
              }}
            />
          ) : null}
        </>
      )}
    </>
  );
}
