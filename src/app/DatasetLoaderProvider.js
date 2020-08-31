import { useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { fileTypeToLoader } from '../loaders/types';
import { LoaderNotFoundError } from '../loaders/errors/index';

import { useStore } from './state/hooks';

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
        datasetLoaders.loaders[file.type] = new LoaderNotFoundError(
          file.type, file.fileType, file.url,
        );
      } else {
        // eslint-disable-next-line new-cap
        datasetLoaders.loaders[file.type] = new matchingLoaderClass(file);
      }
    });
    result[dataset.uid] = datasetLoaders;
  });
  return result;
}

// TODO: move this logic somewhere else, perhaps VitessceGrid?
export default function DatasetLoaderProvider(props) {
  const { children } = props;

  const datasets = useStore(state => state.viewConfig?.datasets);
  const setLoaders = useStore(state => state.setLoaders);

  // Need to have a state variable,
  // which will cause the provider to re-render
  // with the new ref value.
  const [definitions, setDefinitions] = useState([]);

  useEffect(() => {
    if (datasets) {
      const newDefinitions = datasets;
      // Only need to update loaders if the dataset IDs have changed.
      if (!isEqual(definitions, newDefinitions)) {
        setLoaders(createLoaders(newDefinitions));
        setDefinitions(newDefinitions);
      }
    }
  }, [datasets, definitions, setLoaders]);

  return children;
}
