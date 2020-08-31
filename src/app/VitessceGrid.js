import React, {
  useEffect,
} from 'react';
// eslint-disable-next-line vitessce-rules/prevent-pubsub-import
import PubSub from 'pubsub-js';

import { GRID_RESIZE, STATUS_WARN } from '../events';

import { VitessceGridLayout } from './vitessce-grid-layout';
import { useStore } from './state/hooks';
import { useRowHeight, createLoaders } from './vitessce-grid-utils';

const padding = 10;
const margin = 5;
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

  const [rowHeight, containerRef] = useRowHeight(config, initialRowHeight, height, margin, padding);

  // When the row height has changed, publish a GRID_RESIZE event.
  useEffect(() => {
    onResize();
  }, [rowHeight]);

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
  const setLoaders = useStore(state => state.setLoaders);

  // Update the view config and loaders in the global state.
  useEffect(() => {
    if (config) {
      setViewConfig(config);
      const loaders = createLoaders(config.datasets);
      setLoaders(loaders);
    } else {
      // No config found, so clear the loaders.
      setLoaders({});
    }
  }, [config, setViewConfig, setLoaders]);

  return (
    <div
      ref={containerRef}
      className={`vitessce-container vitessce-theme-${theme}`}
    >
      <VitessceGridLayout
        layout={config.layout}
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
