import { useState, useEffect, useMemo } from 'react';
import { capitalize, fromEntries } from '@vitessce/utils';
import { DataType, STATUS } from '@vitessce/constants-internal';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
  getMatchingLoader,
  useMatchingLoader,
  useMatchingLoaders,
  useMatchingLoadersSecondary,
  useSetWarning,
} from './state/hooks.js';
import {
  AbstractLoaderError,
  LoaderNotFoundError,
} from './errors/index.js';

/**
 * Warn via publishing to the console
 * and to the global warning store.
 * @param {AbstractLoaderError} error An error instance.
 */
export function warn(error, setWarning) {
  setWarning(error.message);
  console.warn(error.message);
  console.error(error.stack);
  if (error instanceof AbstractLoaderError) {
    error.warnInConsole();
  }
}

/**
 * Initialize values in the coordination space.
 * @param {object} values Object where
 * keys are coordination type names,
 * values are initial coordination values.
 * @param {object} setters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialValues Object where
 * keys are coordination type names and keys are values.
 */
export function initCoordinationSpace(values, setters, initialValues) {
  if (!values || !setters) {
    return;
  }
  Object.entries(values).forEach(([coordinationType, value]) => {
    const setterName = `set${capitalize(coordinationType)}`;
    const setterFunc = setters[setterName];
    const initialValue = initialValues && initialValues[coordinationType];
    // Interpret null as "uninitialized" and therefore needing initialization.
    const shouldInit = initialValue === null;
    if (shouldInit && setterFunc) {
      setterFunc(value);
    }
  });
}


async function dataQueryFn(ctx) {
  const { placeholderObject, loaders } = ctx.meta;
  // This ordering of the queryKey must match.
  const [dataset, dataType, matchOn, isRequired] = ctx.queryKey;
  const loader = getMatchingLoader(loaders, dataset, dataType, matchOn);
  if (loader) {
    // TODO: can cacheing logic be removed from all loaders?
    const payload = await loader.load();
    if (!payload) return placeholderObject; // TODO: throw error instead?
    const { data, url, coordinationValues } = payload;
    // Status: success
    // Array of objects like  { url, name }.
    const urls = Array.isArray(url) ? url : [{ url, name: dataType }];
    return { data, coordinationValues, urls };
  }
  // No loader was found.
  if (isRequired) {
    // Status: error
    throw new LoaderNotFoundError(loaders, dataset, dataType, matchOn);
  } else {
    // Status: success
    return { data: placeholderObject };
  }
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
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [data, status, urls] where
 * cells is an object and cellsCount is the
 * number of items in the cells object.
 */
export function useDataType(
  dataType, loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  const setWarning = useSetWarning();
  const placeholderObject = useMemo(() => ({}), []);
  const dataQuery = useQuery({
    // TODO: only enable when loaders has been initialized?
    structuralSharing: false,
    placeholderData: placeholderObject,
    // Include the hook name in the queryKey to prevent the case in which an identical queryKey
    // in a different hook would cause an accidental cache hit.
    queryKey: [dataset, dataType, matchOn, isRequired, 'useDataType'],
    // Query function should return an object
    // { data, dataKey } where dataKey is the loaded gene selection.
    queryFn: dataQueryFn,
    meta: { loaders, placeholderObject },
  });
  const { data, status, isFetching, error } = dataQuery;
  const loadedData = data?.data || placeholderObject;

  const coordinationValues = data?.coordinationValues;
  const urls = data?.urls;

  useEffect(() => {
    initCoordinationSpace(
      coordinationValues,
      coordinationSetters,
      initialCoordinationValues,
    );
  }, [coordinationValues]);

  useEffect(() => {
    if (error) {
      warn(error, setWarning);
    }
  }, [error, setWarning]);

  const dataStatus = isFetching ? STATUS.LOADING : status;
  return [loadedData, dataStatus, urls];
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
export function useDataTypeMulti(
  dataType, loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOnObj,
) {
  const placeholderObject = useMemo(() => ({}), []);
  const setWarning = useSetWarning();

  const matchOnEntries = matchOnObj ? Object.entries(matchOnObj) : [];
  const dataQueries = useQueries({
    // eslint-disable-next-line no-unused-vars
    queries: matchOnEntries.map(([scopeKey, matchOn]) => ({
      structuralSharing: false,
      placeholderData: placeholderObject,
      // Query key should match useDataType for shared cacheing
      // and correctness of dataQueryFn.
      queryKey: [dataset, dataType, matchOn, isRequired, 'useDataType'],
      // Query function should return an object
      // { data, dataKey } where dataKey is the loaded gene selection.
      queryFn: dataQueryFn,
      meta: { loaders, placeholderObject },
    })),
  });

  const anyLoading = dataQueries.some(q => q.isFetching);
  const anyError = dataQueries.some(q => q.isError);
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = anyLoading ? STATUS.LOADING : (anyError ? STATUS.ERROR : STATUS.SUCCESS);
  const isSuccess = dataStatus === STATUS.SUCCESS;

  useEffect(() => {
    dataQueries
      .map(q => q.data?.coordinationValues)
      .filter(v => Boolean(v))
      .forEach((coordinationValues) => {
        initCoordinationSpace(
          coordinationValues,
          coordinationSetters,
          initialCoordinationValues,
        );
      });
  // Deliberate dependency omissions: use indirect dependencies for efficiency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    dataQueries.map(q => q.error).filter(e => Boolean(e)).forEach((error) => {
      warn(error, setWarning);
    });
  // Deliberate dependency omissions: use indirect dependencies for efficiency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyError, setWarning]);

  // Convert data to object keyed by scopeKey.
  const data = useMemo(() => fromEntries(
    matchOnEntries.map(([scopeKey], i) => ([scopeKey, dataQueries[i].data?.data])),
  // Deliberate dependency omissions: matchOnEntries, since dataQueries depends on it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [dataQueries]);
  return [data, dataStatus];
}

export function useHasLoader(loaders, dataset, dataType, matchOn) {
  const loader = useMatchingLoader(loaders, dataset, dataType, matchOn);
  return loader !== null;
}

// Multi-obsFeatureMatrix analog of useFeatureSelection
export function useFeatureSelectionMulti(
  loaders, dataset, isRequired, matchOnObj,
  selections,
) {
  const [geneData, setGeneData] = useState({});
  // TODO: per-scopeKey status values
  const [status, setStatus] = useState(STATUS.LOADING);
  const [loadedGeneNames, setLoadedGeneNames] = useState({});

  const setWarning = useSetWarning();
  const matchingLoaders = useMatchingLoaders(
    loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOnObj,
  );

  useEffect(() => {
    if (!selections) {
      setGeneData({});
      setLoadedGeneNames({});
      setStatus(STATUS.SUCCESS);
      return;
    }
    if (matchingLoaders) {
      setGeneData({});
      setLoadedGeneNames({});
      setStatus(STATUS.LOADING);
      Object.entries(matchingLoaders).forEach(([scopeKey, loader]) => {
        if (loader) {
          const selection = selections[scopeKey];
          if (selection) {
            const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
            if (implementsGeneSelection) {
              loader
                .loadGeneSelection({ selection })
                .catch(e => warn(e, setWarning))
                .then((payload) => {
                  if (!payload) return;
                  const { data: payloadData } = payload;
                  setGeneData(prev => ({
                    ...prev,
                    // eslint-disable-next-line no-param-reassign
                    [scopeKey]: payloadData,
                  }));
                  setStatus(STATUS.SUCCESS);
                  setLoadedGeneNames(prev => ({
                    ...prev,
                    [scopeKey]: selection,
                  }));
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
                  const expressionData = new Float32Array(numCells);
                  for (let cellIndex = 0; cellIndex < numCells; cellIndex += 1) {
                    expressionData[cellIndex] = obsFeatureMatrix
                      .data[cellIndex * numGenes + geneIndex];
                  }
                  return expressionData;
                });
                setGeneData(prev => ({
                  ...prev,
                  // eslint-disable-next-line no-param-reassign
                  [scopeKey]: expressionDataForSelection,
                }));
                setStatus(STATUS.SUCCESS);
                setLoadedGeneNames(prev => ({
                  ...prev,
                  [scopeKey]: selection,
                }));
              });
            }
          }
        }
      });
    } else {
      setGeneData({});
      setLoadedGeneNames({});
      if (isRequired) {
        warn(
          new LoaderNotFoundError(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOnObj),
          setWarning,
        );
        setStatus(STATUS.ERROR);
      } else {
        setStatus(STATUS.SUCCESS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingLoaders, selections]);

  return [geneData, loadedGeneNames, status];
}

export function useFeatureSelectionMultiSecondary(
  loaders, dataset, isRequired, matchOnObj,
  selections,
) {
  const [geneData, setGeneData] = useState({});
  // TODO: per-scopeKey status values
  const [status, setStatus] = useState(STATUS.LOADING);
  const [loadedGeneNames, setLoadedGeneNames] = useState({});

  const setWarning = useSetWarning();
  const matchingLoaders = useMatchingLoadersSecondary(
    loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOnObj,
  );

  useEffect(() => {
    if (!selections) {
      setGeneData({});
      setLoadedGeneNames({});
      setStatus(STATUS.SUCCESS);
      return;
    }
    if (matchingLoaders) {
      setGeneData({});
      setLoadedGeneNames({});
      setStatus(STATUS.LOADING);
      Object.entries(matchingLoaders).forEach(([layerScope, layerMatchingLoaders]) => {
        Object.entries(layerMatchingLoaders).forEach(([channelScope, loader]) => {
          if (loader) {
            const selection = selections[layerScope][channelScope];
            if (selection) {
              const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
              if (implementsGeneSelection) {
                loader
                  .loadGeneSelection({ selection })
                  .catch(e => warn(e, setWarning))
                  .then((payload) => {
                    if (!payload) return;
                    const { data: payloadData } = payload;
                    setGeneData(prev => ({
                      ...prev,
                      // eslint-disable-next-line no-param-reassign
                      [layerScope]: {
                        ...(prev[layerScope] || {}),
                        [channelScope]: payloadData,
                      },
                    }));
                    setStatus(STATUS.SUCCESS);
                    setLoadedGeneNames(prev => ({
                      ...prev,
                      [layerScope]: {
                        ...(prev[layerScope] || {}),
                        [channelScope]: selection,
                      },
                    }));
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
                    const expressionData = new Float32Array(numCells);
                    for (let cellIndex = 0; cellIndex < numCells; cellIndex += 1) {
                      expressionData[cellIndex] = obsFeatureMatrix
                        .data[cellIndex * numGenes + geneIndex];
                    }
                    return expressionData;
                  });
                  setGeneData(prev => ({
                    ...prev,
                    [layerScope]: {
                      ...(prev[layerScope] || {}),
                      [channelScope]: expressionDataForSelection,
                    },
                  }));
                  setStatus(STATUS.SUCCESS);
                  setLoadedGeneNames(prev => ({
                    ...prev,
                    [layerScope]: {
                      ...(prev[layerScope] || {}),
                      [channelScope]: selection,
                    },
                  }));
                });
              }
            }
          }
        });
      });
    } else {
      setGeneData({});
      setLoadedGeneNames({});
      if (isRequired) {
        warn(
          new LoaderNotFoundError(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOnObj),
          setWarning,
        );
        setStatus(STATUS.ERROR);
      } else {
        setStatus(STATUS.SUCCESS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingLoaders, selections]);

  return [geneData, loadedGeneNames, status];
}

export function useObsFeatureMatrixIndicesMulti(
  loaders, dataset, addUrl, isRequired, matchOn,
) {
  const [data, setData] = useState({});
  const [status, setStatus] = useState(STATUS.LOADING);

  const setWarning = useSetWarning();
  const matchingLoaders = useMatchingLoaders(
    loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn,
  );

  useEffect(() => {
    if (matchingLoaders) {
      setStatus(STATUS.LOADING);
      Object.entries(matchingLoaders).forEach(([scopeKey, loader]) => {
        if (loader) {
          const implementsLoadAttrs = typeof loader.loadAttrs === 'function';
          if (implementsLoadAttrs) {
            loader.loadAttrs().catch(e => warn(e, setWarning)).then((payload) => {
              if (!payload) return;
              const { data: payloadData, url } = payload;
              setData(prev => ({
                ...prev,
                // eslint-disable-next-line no-param-reassign
                [scopeKey]: {
                  obsIndex: payloadData.rows,
                  featureIndex: payloadData.cols,
                },
              }));
              addUrl(url, DataType.OBS_FEATURE_MATRIX);
              setStatus(STATUS.SUCCESS);
            });
          } else {
            loader.load().catch(e => warn(e, setWarning)).then((payload) => {
              if (!payload) return;
              const { data: payloadData, url } = payload;
              setData(prev => ({
                ...prev,
                // eslint-disable-next-line no-param-reassign
                [scopeKey]: {
                  obsIndex: payloadData.obsIndex,
                  featureIndex: payloadData.featureIndex,
                },
              }));
              addUrl(url, DataType.OBS_FEATURE_MATRIX);
              setStatus(STATUS.SUCCESS);
            });
          }
        }
      });
    } else {
      setData({});
      if (isRequired) {
        warn(
          new LoaderNotFoundError(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn),
          setWarning,
        );
        setStatus(STATUS.ERROR);
      } else {
        setStatus(STATUS.SUCCESS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingLoaders]);

  return [data, status];
}
