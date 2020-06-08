import React, { useState, useEffect, useRef } from 'react';
import PubSub from 'pubsub-js';
import throttle from 'lodash/throttle';
import VitessceGrid from 'vitessce-grid';

import { SourcePublisher } from '../components/sourcepublisher';
import { GRID_RESIZE } from '../events';

/**
 * Return the bottom coordinate of the layout.
 * https://github.com/STRML/react-grid-layout/blob/20dac73f91274526034c00968b5bedb9c2ed36b9/lib/utils.js#L82
 * @param  {array} layout react-grid-layout layout array.
 * @returns {number} Bottom coordinate.
 */
function getNumRows(layout) {
  let max = 0;
  let bottomY;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

/**
 * Compute the row height based on the container height, number of rows,
 * and margin/padding. Basically the reverse of the react-grid-layout's
 * `.containerHeight()` function.
 * https://github.com/STRML/react-grid-layout/blob/83251e5e682abfa3252ff89d4bacf47fdc1f4270/lib/ReactGridLayout.jsx#L223
 * @param {number} containerHeight The height of the .vitessce-container element.
 * @param {number} numRows The number of rows in the layout.
 * @param {number} margin The margin value that will be passed to VitessceGrid.
 * @param {number} padding The padding value that will be passed to VitessceGrid.
 * @returns {number} The new row height value.
 */
function getRowHeight(containerHeight, numRows, margin, padding) {
  const effectiveContainerHeight = containerHeight - 2 * padding - (numRows - 1) * margin;
  return effectiveContainerHeight / numRows;
}

const onResize = () => PubSub.publish(GRID_RESIZE);
const onResizeThrottled = throttle(onResize, 100, { trailing: true });


export default function PubSubVitessceGrid(props) {
  const {
    rowHeight: initialRowHeight, config, getComponent, theme, height,
  } = props;

  const [allReady, setAllReady] = useState(false);
  const [containerHeight, setContainerHeight] = useState(height);
  const [rowHeight, setRowHeight] = useState(initialRowHeight);
  const containerRef = useRef();

  const margin = 10;
  const padding = 10;

  // Detect when the `config` or `containerHeight` variables
  // have changed, and update `rowHeight` in response.
  useEffect(() => {
    const numRows = getNumRows(config.staticLayout);
    const newRowHeight = getRowHeight(containerHeight, numRows, margin, padding);
    setRowHeight(newRowHeight);
  }, [containerHeight, config]);

  // Update the `containerHeight` state when the `height` prop has changed.
  useEffect(() => {
    if (height !== null && height !== undefined) {
      setContainerHeight(height);
    }
  }, [height]);

  // If no height prop has been provided, set the `containerHeight`
  // using height of the `.vitessce-container` element.
  // Check the container element height whenever the window has been
  // resized, as it may change if `.vitessce-container` should be
  // sized relative to its parent (and by extension, potentially the window).
  useEffect(() => {
    if (height !== null && height !== undefined) {
      // eslint will complain if the return value is inconsistent,
      // so return a no-op function.
      return () => {};
    }
    function onWindowResize() {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setContainerHeight(containerRect.height);
    }
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [containerRef, height]);

  return (
    <div
      ref={containerRef}
      className={`vitessce-container vitessce-theme-${theme}`}
    >
      { allReady && <SourcePublisher layers={config.layers} /> }
      <VitessceGrid
        layout={config.staticLayout}
        rowHeight={rowHeight}
        theme={theme}
        getComponent={getComponent}
        onAllReady={() => setAllReady(true)}
        draggableHandle=".title"
        margin={margin}
        padding={padding}
        reactGridLayoutProps={{
          onResize: onResizeThrottled,
          onResizeStop: onResize,
        }}
      />
    </div>
  );
}
