/* eslint-disable */
import React from 'react';
import Tooltip from './Tooltip';

/**
 * A tooltip component that also incorporates a crosshair element.
 * @param {object} props
 * @param {string} props.uuid A unique identifier corresponding to the plot
 * with which this scatterplot is associated. Used by the default getter props.
 * @param {object} props.hoveredCellInfo Used by all default getter props.
 * An object `{ mappings: { PCA: [1, 2] }, uuid: "plot-1", ... }`
 * @param {string} props.mapping Used by the default getCoordinates prop.
 * A key used to lookup the coordinates in `hoveredCellInfo.mappings`.
 * Optional if overriding the `getCoordinates` prop.
 * @param {function} props.getCoordinates Function that returns coordinates to
 * be passed to viewInfo.viewport.project().
 * @param {function} props.getIsCrosshairVisible Function that returns
 * a boolean value, whether the crosshair should be rendered.
 * By default, if the `uuid` does _not_ match the component that triggered the hover event,
 * show the crosshair.
 * @param {function} props.getIsTooltipVisible Function that returns
 * a boolean value, whether the tooltip should be rendered.
 * By default, if the `uuid` matches the component that triggered the hover event,
 * show the tooltip.
 * @param {object} props.viewInfo An object from the Scatterplot or Spatial component,
 * with a `.viewport` function that can transform coordinates between DeckGL and browser.
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
      {isTooltipVisible && (x !== null && y !== null)? (
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
          {x !== null ? (<div
            className="cell-emphasis-crosshair"
            style={{
              left: `${x - crosshairWidth / 2}px`,
              top: 0,
              width: `${crosshairWidth}px`,
              height: `${parentHeight}px`,
            }}
          />) : null}
          {y !== null ? <div
            className="cell-emphasis-crosshair"
            style={{
              left: 0,
              top: `${y - crosshairWidth / 2}px`,
              width: `${parentWidth}px`,
              height: `${crosshairWidth}px`,
            }}
          /> : null}
        </>
      )}
    </>
  );
}
