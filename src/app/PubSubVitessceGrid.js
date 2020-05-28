import React, { useState, useEffect, useRef } from 'react';
import VitessceGrid from 'vitessce-grid';

import { SourcePublisher } from '../components/sourcepublisher';

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

  useEffect(() => {
    const numRows = getNumRows(config.staticLayout);
    const newRowHeight = getRowHeight(containerHeight, numRows, margin, padding);
    setRowHeight(newRowHeight);
  }, [containerHeight, config]);

  useEffect(() => {
    if (height) {
      setContainerHeight(height);
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
        getComponent={getComponent}
        onAllReady={() => setAllReady(true)}
        draggableHandle=".title"
        margin={margin}
        padding={padding}
      />
    </div>
  );
}
