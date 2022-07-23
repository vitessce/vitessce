import { useState, useEffect, useMemo } from 'react';
import { useMatchingLoader, useMultiCoordinationValues, useSetWarning } from '../app/state/hooks';
import {
  LoaderNotFoundError,
} from '../loaders/errors/index';
import {
  DEFAULT_NEIGHBORHOODS_LAYER,
} from './spatial/constants';
import { CoordinationType, DataType } from '../app/constants';
import {
  warn,
  initCoordinationSpace,
  useDataType,
  useDataTypeMulti,
} from './data-hook-utils';
import { fromEntries } from '../utils';

/**
 * Get the dataset description string.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @returns {array} [description] where
 * description is a string.
 */
export function useDescription(loaders, dataset) {
  const [description, setDescription] = useState();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].description) {
      setDescription(loaders[dataset].description);
    } else {
      setDescription(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [description];
}

/**
 * Get data from a cells data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [cells, cellsCount] where
 * cells is an object and cellsCount is the
 * number of items in the cells object.
 */
export function useObsEmbeddingData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_EMBEDDING,
    loaders, dataset, setItemIsReady, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsLocationsData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_LOCATIONS,
    loaders, dataset, setItemIsReady, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsLabelsData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_LABELS,
    loaders, dataset, setItemIsReady, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsSegmentationsData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_SEGMENTATIONS,
    loaders, dataset, setItemIsReady, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsSetsData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_SETS,
    loaders, dataset, setItemIsReady, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsFeatureMatrixData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_FEATURE_MATRIX,
    loaders, dataset, setItemIsReady, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useImageData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.IMAGE,
    loaders, dataset, setItemIsReady, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

/**
 * Get data from the expression matrix data type loader for a given gene selection.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {boolean} selection A list of gene names to get expression data for.
 * @returns {array} [geneData] where geneData is an array [Uint8Array, ..., Uint8Array]
 * for however many genes are in the selection.
 */
export function useFeatureSelection(
  loaders,
  dataset,
  setItemIsReady,
  isRequired,
  selection,
  setItemIsNotReady,
  matchOn,
) {
  const [geneData, setGeneData] = useState();

  const setWarning = useSetWarning();
  const loader = useMatchingLoader(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn);

  useEffect(() => {
    if (!selection) {
      setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      return;
    }
    if (loader) {
      setItemIsNotReady(DataType.OBS_FEATURE_MATRIX);
      const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
      if (implementsGeneSelection) {
        loader
          .loadGeneSelection({ selection })
          .catch(e => warn(e, setWarning))
          .then((payload) => {
            if (!payload) return;
            const { data } = payload;
            setGeneData(data);
            setItemIsReady(DataType.OBS_FEATURE_MATRIX);
          });
      } else {
        loader.load().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data } = payload;
          const { obsIndex, featureIndex, obsFeatureMatrix } = data;
          const expressionDataForSelection = selection.map((sel) => {
            const geneIndex = featureIndex.indexOf(sel);
            const numGenes = featureIndex.length;
            const numCells = obsIndex.length;
            const expressionData = new Uint8Array(numCells);
            for (let cellIndex = 0; cellIndex < numCells; cellIndex += 1) {
              expressionData[cellIndex] = obsFeatureMatrix.data[cellIndex * numGenes + geneIndex];
            }
            return expressionData;
          });
          setGeneData(expressionDataForSelection);
          setItemIsReady(DataType.OBS_FEATURE_MATRIX);
        });
      }
    } else {
      setGeneData(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.OBS_FEATURE_MATRIX, null, null), setWarning);
      } else {
        setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, selection]);

  return [geneData];
}

/**
 * Get the attributes for the expression matrix data type loader,
 * i.e names of cells and genes.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.  Should not be used in conjunction (called in the same component)
 * with useExpressionMatrixData.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @returns {object} [attrs] { rows, cols } object containing cell and gene names.
 */
export function useObsFeatureMatrixIndices(
  loaders, dataset, setItemIsReady, addUrl, isRequired, matchOn,
) {
  const [data, setData] = useState({});

  const setWarning = useSetWarning();
  const loader = useMatchingLoader(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn);

  useEffect(() => {
    if (loader) {
      const implementsLoadAttrs = typeof loader.loadAttrs === 'function';
      if (implementsLoadAttrs) {
        loader.loadAttrs().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data: payloadData, url } = payload;
          setData({
            obsIndex: payloadData.rows,
            featureIndex: payloadData.cols,
          });
          addUrl(url, 'Observation-by-Feature Matrix');
          setItemIsReady(DataType.OBS_FEATURE_MATRIX);
        });
      } else {
        loader.load().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data: payloadData, url } = payload;
          setData({
            obsIndex: payloadData.obsIndex,
            featureIndex: payloadData.featureIndex,
          });
          addUrl(url, 'Observation-by-Feature Matrix');
          setItemIsReady(DataType.OBS_FEATURE_MATRIX);
        });
      }
    } else {
      setData({});
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.OBS_FEATURE_MATRIX, null, null), setWarning);
      } else {
        setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader]);

  return data;
}


/**
 * Get data from a neighborhoods data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [neighborhoods] where
 * neighborhoods is an object.
 */
export function useNeighborhoodsData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [neighborhoods, setNeighborhoods] = useState();

  const setWarning = useSetWarning();
  const loader = useMatchingLoader(loaders, dataset, 'neighborhoods', {});

  useEffect(() => {
    if (loader) {
      loader.load().catch(e => warn(e, setWarning))
        .then((payload) => {
          if (!payload) return;
          const { data, url, coordinationValues } = payload;
          setNeighborhoods(data);
          addUrl(url, 'Neighborhoods');
          const coordinationValuesOrDefault = {
            spatialNeighborhoodLayer: DEFAULT_NEIGHBORHOODS_LAYER,
            ...coordinationValues,
          };
          initCoordinationSpace(
            coordinationValuesOrDefault,
            coordinationSetters,
            initialCoordinationValues,
          );
          setItemIsReady('neighborhoods');
        });
    } else {
      setNeighborhoods({});
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'neighborhoods', null, null), setWarning);
      } else {
        setItemIsReady('neighborhoods');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader]);

  return [neighborhoods];
}

/**
 * Get data from a genomic-profiles data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [neighborhoods] where
 * neighborhoods is an object.
 */
export function useGenomicProfilesData(
  loaders, dataset, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [genomicProfilesAttrs, setGenomicProfilesAttrs] = useState();

  const setWarning = useSetWarning();
  const loader = useMatchingLoader(loaders, dataset, 'genomic-profiles', {});

  useEffect(() => {
    if (loader) {
      loader.load().catch(e => warn(e, setWarning))
        .then((payload) => {
          if (!payload) return;
          const { data, url, coordinationValues } = payload;
          setGenomicProfilesAttrs(data);
          addUrl(url);
          initCoordinationSpace(
            coordinationValues,
            coordinationSetters,
            initialCoordinationValues,
          );
          setItemIsReady('genomic-profiles');
        });
    } else {
      setGenomicProfilesAttrs(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'genomic-profiles', null, null), setWarning);
      } else {
        setItemIsReady('genomic-profiles');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader]);

  return [genomicProfilesAttrs];
}

export function useMultiObsLabels(
  coordinationScopes, obsType, loaders, dataset, setItemIsReady, addUrl,
) {
  const obsLabelsTypes = useMultiCoordinationValues(
    CoordinationType.OBS_LABELS_TYPE,
    coordinationScopes,
  );
  const obsLabelsMatchOnObj = useMemo(() => fromEntries(
    Object.entries(obsLabelsTypes).map(([scope, obsLabelsType]) => ([
      scope,
      { obsLabelsType, obsType },
    ])),
  ), [obsLabelsTypes, obsType]);
  const obsLabelsData = useDataTypeMulti(
    DataType.OBS_LABELS, loaders, dataset,
    setItemIsReady, addUrl, false, {}, {},
    obsLabelsMatchOnObj,
  );
  return [obsLabelsTypes, obsLabelsData];
}
