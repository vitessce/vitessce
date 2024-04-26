import {
  useState, useEffect, useRef,
} from 'react';
import { InternMap } from 'internmap';
import { isEqual, pick } from 'lodash-es';
import { fromEntries } from '@vitessce/utils';
import { DATA_TYPE_COORDINATION_VALUE_USAGE } from '@vitessce/constants-internal';
import { getSourceAndLoaderFromFileType, getDataTypeFromFileType } from './data/loader-registry.js';

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

export function useRowHeight(config, initialRowHeight, height, margin, padding) {
  const [containerHeight, setContainerHeight] = useState(height);
  const [rowHeight, setRowHeight] = useState(initialRowHeight);
  const containerRef = useRef();

  // Detect when the `config` or `containerHeight` variables
  // have changed, and update `rowHeight` in response.
  useEffect(() => {
    const numRows = getNumRows(config.layout);
    const newRowHeight = getRowHeight(containerHeight, numRows, margin, padding);
    setRowHeight(newRowHeight);
  }, [containerHeight, config, margin, padding]);

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


  return [rowHeight, containerRef];
}

function withDefaults(
  coordinationValues,
  dataType,
  fileType,
  datasetUid,
  defaultCoordinationValues,
) {
  const defaultKeys = DATA_TYPE_COORDINATION_VALUE_USAGE[dataType]
    .filter(k => (
      Object.keys(defaultCoordinationValues).includes(k)
      && defaultCoordinationValues[k]
      && !Object.keys(coordinationValues).includes(k)
    ));
  const defaultValues = pick(defaultCoordinationValues, defaultKeys);
  const coordinationValuesWithDefaults = {
    ...defaultValues,
    // The user-provided values should take precedence.
    ...coordinationValues,
  };
  if (!isEqual(coordinationValues, coordinationValuesWithDefaults)) {
    // eslint-disable-next-line max-len
    console.warn(`Using coordination value defaults for file type ${fileType} in dataset ${datasetUid}\nBefore: ${JSON.stringify(coordinationValues)}\nAfter: ${JSON.stringify(coordinationValuesWithDefaults)}`);
  }
  return coordinationValuesWithDefaults;
}

/**
 * Create a mapping from dataset ID to loader objects by data type.
 * @param {object[]} datasets The datasets array from the view config.
 * @param {string} configDescription The top-level description in the
 * view config.
 * @param {PluginFileType[]} fileTypes
 * @param {PluginCoordinationType[]} coordinationTypes
 * @param {object} stores Optional mapping from URLs to Zarrita stores.
 * @returns {object} Mapping from dataset ID to data type to loader
 * instance.
 */
export function createLoaders(datasets, configDescription, fileTypes, coordinationTypes, stores) {
  const result = {};
  const dataSources = new InternMap([], JSON.stringify);
  const defaultCoordinationValues = fromEntries(
    coordinationTypes.map(ct => ([ct.name, ct.defaultValue])),
  );
  datasets.forEach((dataset) => {
    const datasetLoaders = {
      name: dataset.name,
      description: dataset.description || configDescription,
      loaders: {},
    };
    dataset.files.forEach((file) => {
      const {
        url,
        options,
        requestInit,
        fileType,
        coordinationValues = {},
      } = file;
      const dataType = getDataTypeFromFileType(fileType, fileTypes);
      const coordinationValuesWithDefaults = withDefaults(
        coordinationValues,
        dataType,
        fileType,
        dataset.uid,
        defaultCoordinationValues,
      );
      const [DataSourceClass, LoaderClass] = getSourceAndLoaderFromFileType(fileType, fileTypes);
      // Create _one_ DataSourceClass instance per (URL, DataSource class name) pair.
      // Derived loaders share this object.
      const fileId = url || JSON.stringify(options);
      // The class name might be minified but that should not matter;
      // we just need a string that is unique to the class for the key.
      const dataSourceName = DataSourceClass.prototype.constructor.name;
      const dataSourceKey = [fileId, dataSourceName];
      if (!dataSources.has(dataSourceKey)) {
        dataSources.set(dataSourceKey, new DataSourceClass({
          url,
          requestInit,
          // Optionally, pass a Zarrita store to the data source,
          // if one was mapped to this URL.
          store: stores?.[url],
        }));
      }
      const loader = new LoaderClass(dataSources.get(dataSourceKey), file);
      if (datasetLoaders.loaders[dataType]) {
        datasetLoaders.loaders[dataType].set(coordinationValuesWithDefaults, loader);
      } else {
        datasetLoaders.loaders[dataType] = new InternMap([
          [coordinationValuesWithDefaults, loader],
        ], JSON.stringify);
      }
    });
    result[dataset.uid] = datasetLoaders;
  });
  return result;
}
