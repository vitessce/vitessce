import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
// eslint-disable-next-line vitessce-rules/prevent-pubsub-import
import PubSub from 'pubsub-js';

import { GRID_RESIZE, STATUS_WARN } from '../events';

import { VitessceGridLayout } from './vitessce-grid-layout';
import { DatasetLoaderContext } from './state/contexts';
import useStore from './state/store';

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

/**
 * The wrapper for the VitessceGrid and LoadingIndicator components.
 * @param {object} props
 * @param {number} props.rowHeight The height of each grid row. Optional.
 * @param {object} props.config The view config.
 * @param {function} props.getComponent A function that maps component names to their
 * React counterparts.
 * @param {string} props.theme The theme name.
 * @param {number} props.height Total height for grid. Optional.
 * @param {function} props.onWarn A callback for warning messages. Optional.
 */
export default function VitessceGrid(props) {
  const {
    rowHeight: initialRowHeight,
    config,
    getComponent,
    theme,
    height,
    onWarn,
  } = props;

  const loaders = useContext(DatasetLoaderContext);

  const [containerHeight, setContainerHeight] = useState(height);
  const [rowHeight, setRowHeight] = useState(initialRowHeight);
  const containerRef = useRef();

  const padding = 10;
  const margin = 5;

  // Detect when the `config` or `containerHeight` variables
  // have changed, and update `rowHeight` in response.
  useEffect(() => {
    const numRows = getNumRows(config.layout);
    const newRowHeight = getRowHeight(containerHeight, numRows, margin, padding);
    setRowHeight(newRowHeight);
  }, [containerHeight, config]);

  // Update the `containerHeight` state when the `height` prop has changed.
  useEffect(() => {
    if (height !== null && height !== undefined) {
      setContainerHeight(height);
    }
  }, [height]);

  useEffect(() => {
    // The row height has changed, so emit a GRID_RESIZE event.
    onResize();
  }, [rowHeight]);

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

  // Subscribe to warning messages, and re-publish them via the onWarn callback.
  useEffect(() => {
    const warnToken = PubSub.subscribe(STATUS_WARN, (msg, data) => {
      if (onWarn) {
        onWarn(data);
      }
    });
    return () => PubSub.unsubscribe(warnToken);
  }, [onWarn]);

  const setViewConfig = useStore(state => state.setViewConfig);

  useEffect(() => {
    setViewConfig(config);
  }, [config, setViewConfig]);

  return (
    <div
      ref={containerRef}
      className={`vitessce-container vitessce-theme-${theme}`}
    >
      <VitessceGridLayout
        layout={config.layout}
        loaders={loaders}
        height={height}
        rowHeight={rowHeight}
        theme={theme}
        getComponent={getComponent}
        draggableHandle=".title"
        margin={margin}
        padding={padding}
        reactGridLayoutProps={{
          onResize,
          onResizeStop: onResize,
        }}
      />
    </div>
  );
}
