import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
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
import {
  useVitessceContainerStyles,
  GridLayoutGlobalStyles,
} from './shared-mui/container.js';
import { useTitleStyles } from './title-styles.js';
import { getAltText } from './generate-alt-text.js';
import { Sidebar } from './Sidebar.js';


const SIDEBAR_WIDTH = 30;

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
 * @param {boolean} props.pageMode
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
    stores,
    pageMode,
    children,
    onDrop: onDropHandler,
  } = props;

  const [rowHeight, containerRef] = useRowHeight(config, initialRowHeight, height, margin, padding);
  const onResize = useEmitGridResize();

  const [componentWidth] = useClosestVitessceContainerSize(containerRef, 0);

  const { classes } = useVitessceContainerStyles();
  const { classes: titleClasses } = useTitleStyles();

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
        stores,
      );
      newConfig = config;
    }
    setViewConfig(newConfig);
    setLoaders(newLoaders);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, configKey]);

  const [isDragging, setIsDragging] = useState(false);
  const [isDragProcessing, setIsDragProcessing] = useState(false);

  // Effect for setting up drag-and-drop event listeners.
  useEffect(() => {
    const zone = containerRef.current;

     // Support drag-and-drop only when the parent has passed an onDrop handler.
    const enableDropzone = (onDropHandler && typeof onDropHandler === 'function');
    if(!enableDropzone) {
      return () => {};
    }

    const onDragEnter = (e) => {
      console.log('onDragEnter');
      e.preventDefault();
      setIsDragging(true);
    };
    const onDragLeave = (e) => {
      setIsDragging(false);
    };
    const onDragOver = (e) => {
      e.preventDefault();
    };
    const onDrop = async (e) => {
      e.preventDefault();

      setIsDragging(false);
      setIsDragProcessing(true);

      // Here, call onDrop handler passed in from parent of <VitS/Vitessce/> via prop.
      console.log('onDrop');
      await onDropHandler(e);

      setIsDragProcessing(false);
    };


    // The dragenter event happens at the moment you drag something in to the target element, and then it stops.
    // The dragover event happens during the time you are dragging something until you drop it.
    zone.addEventListener("dragenter", onDragEnter);
    zone.addEventListener("dragleave", onDragLeave);
    zone.addEventListener("dragover", onDragOver);
    zone.addEventListener("drop", onDrop);

    return () => {
      zone.removeEventListener("dragenter", onDragEnter);
      zone.removeEventListener("dragleave", onDragLeave);
      zone.removeEventListener("dragover", onDragOver);
      zone.removeEventListener("drop", onDrop);
    };
  }, [containerRef, onDropHandler]);

  return (
    <div
      ref={containerRef}
      className={clsx(VITESSCE_CONTAINER, classes.vitessceContainer)}
      role="group"
      aria-label={altText}
    >
    <GridLayoutGlobalStyles classes={classes} />
      {layout ? (
        <VitessceGridLayout
          pageMode={pageMode}
          role="group"
          layout={layout}
          height={height}
          rowHeight={rowHeight}
          theme={theme}
          viewTypes={viewTypes}
          fileTypes={fileTypes}
          coordinationTypes={coordinationTypes}
          stores={stores}
          draggableHandle={titleClasses.titleLeft}
          margin={margin}
          padding={padding}
          onRemoveComponent={removeComponent}
          onLayoutChange={changeLayoutPostMount}
          isBounded={isBounded}
          onResize={onResize}
          onResizeStop={onResize}
        >
          {children}
        </VitessceGridLayout>
      ) : null}
    </div>
  );
}
