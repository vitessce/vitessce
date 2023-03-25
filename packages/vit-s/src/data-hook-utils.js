import { useState, useEffect } from 'react';
import equal from 'fast-deep-equal';
import { capitalize } from '@vitessce/utils';
import { DataType, STATUS } from '@vitessce/constants-internal';
import { useMatchingLoader, useMatchingLoaders, useMatchingLoadersSecondary, useSetWarning } from './state/hooks';
import {
  AbstractLoaderError,
  LoaderNotFoundError,
} from './errors/index';
import { getDefaultCoordinationValues } from './plugins';

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
  const defaultCoordinationValues = getDefaultCoordinationValues();
  Object.entries(values).forEach(([coordinationType, value]) => {
    const setterName = `set${capitalize(coordinationType)}`;
    const setterFunc = setters[setterName];
    const initialValue = initialValues && initialValues[coordinationType];
    const shouldInit = equal(initialValue, defaultCoordinationValues[coordinationType]);
    if (shouldInit && setterFunc) {
      setterFunc(value);
    }
  });
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
export function useDataType(
  dataType, loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  const [data, setData] = useState({});
  const [status, setStatus] = useState(STATUS.LOADING);

  const setWarning = useSetWarning();
  const loader = useMatchingLoader(loaders, dataset, dataType, matchOn);

  useEffect(() => {
    if (loader) {
      setStatus(STATUS.LOADING);
      loader.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data: payloadData, url, coordinationValues } = payload;
        setData(payloadData);
        if (Array.isArray(url)) {
          url.forEach(([val, name]) => {
            addUrl(val, name);
          });
        } else if (url) {
          addUrl(url, dataType);
        }
        initCoordinationSpace(
          coordinationValues,
          coordinationSetters,
          initialCoordinationValues,
        );
        setStatus(STATUS.SUCCESS);
      });
    } else {
      setData({});
      if (isRequired) {
        warn(new LoaderNotFoundError(loaders, dataset, dataType, matchOn), setWarning);
        setStatus(STATUS.ERROR);
      } else {
        setStatus(STATUS.SUCCESS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader]);

  return [data, status];
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
export function useDataTypeMulti(
  dataType, loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOnObj,
) {
  const [data, setData] = useState({});
  // TODO: per-scopeKey status values
  const [status, setStatus] = useState(STATUS.LOADING);

  const setWarning = useSetWarning();
  const matchingLoaders = useMatchingLoaders(loaders, dataset, dataType, matchOnObj);

  useEffect(() => {
    if (matchingLoaders) {
      setStatus(STATUS.LOADING);
      Object.entries(matchingLoaders).forEach(([scopeKey, loader]) => {
        if (loader) {
          loader.load().catch(e => warn(e, setWarning)).then((payload) => {
            if (!payload) return;
            const { data: payloadData, url, coordinationValues } = payload;
            setData(prev => ({
              ...prev,
              // eslint-disable-next-line no-param-reassign
              [scopeKey]: payloadData,
            }));
            addUrl(url, dataType);
            initCoordinationSpace(
              coordinationValues,
              coordinationSetters,
              initialCoordinationValues,
            );
            setStatus(STATUS.SUCCESS);
          });
        }
      });
    } else {
      setData({});
      if (isRequired) {
        warn(new LoaderNotFoundError(loaders, dataset, dataType, matchOnObj), setWarning);
        setStatus(STATUS.ERROR);
      } else {
        setStatus(STATUS.SUCCESS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingLoaders]);

  return [data, status];
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
