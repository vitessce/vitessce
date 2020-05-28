import React, { useState, useEffect, useRef } from 'react';
import VitessceGrid from 'vitessce-grid';

import { SourcePublisher } from '../components/sourcepublisher';

/**
 * Return the bottom coordinate of the layout.
 * https://github.com/STRML/react-grid-layout/blob/master/lib/utils.js#L82
 * @param  {array} layout react-grid-layout layout array.
 * @returns {number} Bottom coordinate.
 */
function bottom(layout) {
  let max = 0;
  let bottomY;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}


export default function PubSubVitessceGrid(props) {
  const {
    rowHeight: initialRowHeight, config, getComponent, theme,
  } = props;

  const [allReady, setAllReady] = useState(false);
  const [containerHeight, setContainerHeight] = useState(null);
  const [rowHeight, setRowHeight] = useState(initialRowHeight);
  const containerRef = useRef();

  useEffect(() => {
    const numRows = bottom(config.staticLayout);
    setRowHeight(containerHeight / numRows);
  }, [containerHeight, config]);

  useEffect(() => {
    function onWindowResize() {
      if (!containerRef.current) return;
      const { height } = containerRef.current.getBoundingClientRect();
      setContainerHeight(height);
    }
    window.addEventListener('resize', onWindowResize);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [containerRef]);

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
        margin={0}
        padding={0}
      />
    </div>
  );
}
