import React, {
  useEffect,
  useCallback,
} from 'react';
import clsx from 'clsx';
import { VITESSCE_CONTAINER } from './classNames.js';
import { VitessceGridLayout } from './vitessce-grid-layout/index.js';
import { useRowHeight } from './vitessce-grid-utils.js';
import {
  useEmitGridResize,
  useRemoveComponent,
  useChangeLayout,
  useLayout,
} from './state/hooks.js';
import {
  useClosestVitessceContainerSize,
} from './hooks.js';
import { useVitessceContainerStyles } from './shared-mui/container.js';
import { useTitleStyles } from './title-styles.js';

const padding = 10;
const margin = 5;

/**
 * The wrapper for the VitessceGrid and LoadingIndicator components.
 * @param {object} props
 * @param {number} props.rowHeight The height of each grid row. Optional.
 * @param {object} props.config The view config.
 * @param {string} props.theme The theme name.
 * @param {number} props.height Total height for grid. Optional.
 * @param {function} props.onWarn A callback for warning messages. Optional.
 * @param {PluginViewType[]} props.viewTypes
 */
export default function VitessceGrid(props) {
  const {
    rowHeight: initialRowHeight,
    config,
    theme,
    height,
    isBounded,
    viewTypes,
  } = props;

  const [rowHeight, containerRef] = useRowHeight(config, initialRowHeight, height, margin, padding);
  const onResize = useEmitGridResize();

  const [componentWidth] = useClosestVitessceContainerSize(containerRef);

  const classes = useVitessceContainerStyles();
  const titleClasses = useTitleStyles();

  // When the row height has changed, publish a GRID_RESIZE event.
  useEffect(() => {
    onResize();
  }, [rowHeight, onResize]);

  const removeComponent = useRemoveComponent();
  const changeLayout = useChangeLayout();
  const layout = useLayout();

  const changeLayoutPostMount = useCallback((newComponentProps) => {
    if (componentWidth > 0) {
      changeLayout(newComponentProps);
    }
  }, [changeLayout, componentWidth]);

  return (
    <div
      ref={containerRef}
      className={clsx(VITESSCE_CONTAINER, classes.vitessceContainer)}
    >
      {layout && (
        <VitessceGridLayout
          layout={layout}
          height={height}
          rowHeight={rowHeight}
          theme={theme}
          viewTypes={viewTypes}
          draggableHandle={titleClasses.title}
          margin={margin}
          padding={padding}
          onRemoveComponent={removeComponent}
          onLayoutChange={changeLayoutPostMount}
          isBounded={isBounded}
          onResize={onResize}
          onResizeStop={onResize}
        />
      )}
    </div>
  );
}
