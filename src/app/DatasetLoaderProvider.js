import React, { useRef, useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { fileTypeToLoader } from '../loaders/types';
import { LoaderNotFoundError } from '../loaders/errors/index';

import { DatasetLoaderContext } from './state/contexts';
import useStore from './state/store';

// Create a mapping from dataset ID to loader objects by data type.
function createLoaders(datasets) {
  const result = {};
  datasets.forEach((dataset) => {
    const datasetLoaders = {
      name: dataset.name,
      loaders: {},
    };
    dataset.files.forEach((file) => {
      const matchingLoaderClass = fileTypeToLoader[file.fileType];
      if (!matchingLoaderClass) {
        // TODO: remove `name` from loaders and loader error arguments.
        datasetLoaders.loaders[file.type] = new LoaderNotFoundError('null', file.type, file.fileType, file.url);
      } else {
        // eslint-disable-next-line new-cap
        datasetLoaders.loaders[file.type] = new matchingLoaderClass(file);
      }
    });
    result[dataset.uid] = datasetLoaders;
  });
  return result;
}

export default function DatasetLoaderProvider(props) {
  const { children } = props;

  const datasets = useStore(state => state.viewConfig?.datasets);

  // Want to store loaders in a mutable object,
  // with mapping from dataset ID to data types and loaders.
  const loadersRef = useRef({});
  // Need to have a state variable,
  // which will cause the provider to re-render
  // with the new ref value.
  const [definitions, setDefinitions] = useState([]);

  useEffect(() => {
    if (datasets) {
      const newDefinitions = datasets;
      // Only need to update loaders if the dataset IDs have changed.
      if (!isEqual(definitions, newDefinitions)) {
        loadersRef.current = createLoaders(newDefinitions);
        setDefinitions(newDefinitions);
      }
    }
  }, [datasets, definitions]);

  return (
    <DatasetLoaderContext.Provider value={loadersRef.current}>
      {children}
    </DatasetLoaderContext.Provider>
  );
}
