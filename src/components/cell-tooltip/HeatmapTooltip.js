/* eslint-disable */
import React from 'react';
import CellTooltip from './CellTooltip';

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
export default function HeatmapTooltip(props) {
  const {
    uuid,
    hoveredCellInfo,
    hoveredGeneInfo,
    mapping,
    getCoordinates = () => hoveredCellInfo && mapping && hoveredCellInfo.mappings[mapping],
    getIsCrosshairVisible = () => (hoveredCellInfo && hoveredCellInfo.uuid !== uuid),
    getIsTooltipVisible = () => (hoveredCellInfo && hoveredCellInfo.uuid === uuid),
    viewInfo,
    children,
  } = props;
  // Check that all data necessary to show the tooltip has been passed.
  if (!uuid || !viewInfo || !viewInfo.viewport) {
    return null;
  }
  const coordinates = getCoordinates();
  if (!coordinates) {
    return null;
  }
  // Convert the DeckGL coordinates to pixel coordinates.
  const [x, y] = viewInfo.viewport.project(coordinates);
  // Check if out of bounds.
  if (x < 0 || x > viewInfo.width || y < 0 || y > viewInfo.height) {
    return null;
  }
  const isCrosshairVisible = getIsCrosshairVisible();
  const isTooltipVisible = getIsTooltipVisible();
  const crosshairWidth = 1;
  return (
    <>
      {isTooltipVisible && (
        <CellTooltip
          x={x}
          y={y}
          parentWidth={viewInfo.width}
          parentHeight={viewInfo.height}
        >
          {children}
        </CellTooltip>
      )}
      {isCrosshairVisible && (
        <>
          <div
            className="cell-emphasis-crosshair"
            style={{
              left: `${x - crosshairWidth / 2}px`,
              top: 0,
              width: `${crosshairWidth}px`,
              height: `${viewInfo.height}px`,
            }}
          />
          <div
            className="cell-emphasis-crosshair"
            style={{
              left: 0,
              top: `${y - crosshairWidth / 2}px`,
              width: `${viewInfo.width}px`,
              height: `${crosshairWidth}px`,
            }}
          />
        </>
      )}
    </>
  );
}
