import { useState, useEffect } from 'react';
import equal from 'fast-deep-equal';
import log from 'loglevel';
import { capitalize } from '@vitessce/utils';
import { STATUS } from '@vitessce/constants-internal';
import { useMatchingLoader, useMatchingLoaders, useSetWarning } from './state/hooks';
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
  log.warn(error.message);
  log.error(error.stack);
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
            setData((prev) => {
              // eslint-disable-next-line no-param-reassign
              prev[scopeKey] = payloadData;
              return prev;
            });
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
