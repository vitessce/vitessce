import { useState, useEffect, useMemo } from 'react';
import { capitalize } from '@vitessce/utils';
import { STATUS } from '@vitessce/constants-internal';
import { useQuery } from '@tanstack/react-query';
import {
  getMatchingLoader,
  useMatchingLoader,
  useMatchingLoaders,
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
    queryKey: [dataset, dataType, matchOn, 'useDataType'],
    // Query function should return an object
    // { data, dataKey } where dataKey is the loaded gene selection.
    queryFn: async (ctx) => {
      const loader = getMatchingLoader(
        ctx.meta.loaders, ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2],
      );
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
    },
    meta: { loaders },
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
      setWarning(error.message);
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
  // TODO: react-query
  const [data, setData] = useState({});
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
            const { data: payloadData, coordinationValues } = payload;
            setData((prev) => {
              // eslint-disable-next-line no-param-reassign
              prev[scopeKey] = payloadData;
              return prev;
            });
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
