import React, {
  useEffect,
} from 'react';
import { VitessceGridLayout } from './vitessce-grid-layout';
import { useRowHeight, createLoaders } from './vitessce-grid-utils';
import {
  useSetViewConfig,
  useSetLoaders,
  useEmitGridResize,
  useRemoveComponent,
  useChangeLayout,
  useLayout,
} from './state/hooks';

const padding = 10;
const margin = 5;

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
  } = props;

  const [rowHeight, containerRef] = useRowHeight(config, initialRowHeight, height, margin, padding);
  const onResize = useEmitGridResize();

  // When the row height has changed, publish a GRID_RESIZE event.
  useEffect(() => {
    onResize();
  }, [rowHeight, onResize]);

  const setViewConfig = useSetViewConfig();
  const setLoaders = useSetLoaders();
  const removeComponent = useRemoveComponent();
  const changeLayout = useChangeLayout();
  const layout = useLayout();

  // Update the view config and loaders in the global state.
  useEffect(() => {
    if (config) {
      setViewConfig(config);
      const loaders = createLoaders(config.datasets, config.description);
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
      {layout && (
        <VitessceGridLayout
          layout={layout}
          height={height}
          rowHeight={rowHeight}
          theme={theme}
          getComponent={getComponent}
          draggableHandle=".title"
          margin={margin}
          padding={padding}
          onRemoveComponent={removeComponent}
          onLayoutChange={changeLayout}
          reactGridLayoutProps={{
            onResize,
            onResizeStop: onResize,
          }}
        />
      )}
    </div>
  );
}
