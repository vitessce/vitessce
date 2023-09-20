import React, {
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import clsx from 'clsx';
import { VITESSCE_CONTAINER } from './classNames.js';
import { VitessceGridLayout } from './vitessce-grid-layout/index.js';
import { useRowHeight, createLoaders } from './vitessce-grid-utils.js';
import {
  useViewConfigStoreApi,
  useSetViewConfig,
  useSetLoaders,
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
import { getAltText } from './generate-alt-text.js';

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
 * @param {PluginFileType[]} props.fileTypes
 * @param {PluginCoordinationType[]} props.coordinationTypes
 */
export default function VitessceGrid(props) {
  const {
    success,
    configKey,
    rowHeight: initialRowHeight,
    config,
    theme,
    height,
    isBounded,
    viewTypes,
    fileTypes,
    coordinationTypes,
  } = props;

  const [rowHeight, containerRef] = useRowHeight(config, initialRowHeight, height, margin, padding);
  const onResize = useEmitGridResize();

  const [componentWidth] = useClosestVitessceContainerSize(containerRef);

  const classes = useVitessceContainerStyles();
  const titleClasses = useTitleStyles();

  const altText = useMemo(() => getAltText(config), [configKey]);

  // When the row height has changed, publish a GRID_RESIZE event.
  useEffect(() => {
    onResize();
  }, [rowHeight, onResize]);

  const viewConfigStoreApi = useViewConfigStoreApi();
  const setViewConfig = useSetViewConfig(viewConfigStoreApi);
  const setLoaders = useSetLoaders();
  const removeComponent = useRemoveComponent();
  const changeLayout = useChangeLayout();
  const layout = useLayout();

  const changeLayoutPostMount = useCallback((newComponentProps) => {
    if (componentWidth > 0) {
      changeLayout(newComponentProps);
    }
  }, [changeLayout, componentWidth]);

  // Update the view config and loaders in the global state.
  // This effect is needed for the controlled component case in which
  // the store has already been initialized with a view config,
  // and we want to replace it with a new view config.
  useEffect(() => {
    let newLoaders = null;
    let newConfig = null;
    if (success) {
      newLoaders = createLoaders(
        config.datasets,
        config.description,
        fileTypes,
        coordinationTypes,
      );
      newConfig = config;
    }
    setViewConfig(newConfig);
    setLoaders(newLoaders);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, configKey]);

  return (
    <div
      ref={containerRef}
      className={clsx(VITESSCE_CONTAINER, classes.vitessceContainer)}
      role="group"
      aria-label={altText}
    >
      {layout ? (
        <VitessceGridLayout
          role="group"
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
      ) : null}
    </div>
  );
}
