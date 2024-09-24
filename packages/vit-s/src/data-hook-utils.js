import { useEffect, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useDuckDB } from 'lazy-duckdb-react';
import {
  capitalize,
  getInitialCoordinationScopePrefix,
} from '@vitessce/utils';
import { STATUS } from '@vitessce/constants-internal';
import {
  getMatchingLoader,
  useMatchingLoader,
  useSetWarning,
} from './state/hooks.js';
import {
  AbstractLoaderError,
  LoaderNotFoundError,
} from './errors/index.js';
import { tableToIPC } from 'apache-arrow';

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


export async function dataQueryFn(ctx) {
  const { placeholderObject, loaders } = ctx.meta;
  // This ordering of the queryKey must match.
  const [dataset, dataType, matchOn, isRequired] = ctx.queryKey;
  const loader = getMatchingLoader(loaders, dataset, dataType, matchOn);
  if (loader) {
    // TODO: can cacheing logic be removed from all loaders?
    const payload = await loader.load();
    if (!payload) return placeholderObject; // TODO: throw error instead?
    const { data, url, requestInit, coordinationValues } = payload;
    // Status: success
    // Array of objects like  { url, name }.
    const urls = (Array.isArray(url) ? url : [{ url, name: dataType }]).filter(d => d.url);
    return { data, coordinationValues, urls, requestInit };
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


export function getTableName({ dataset, dataType, matchOn }) {
  const matchOnStr = Object.keys(matchOn)
    .toSorted()
    .map((key) => `${key}_${matchOn[key]}`)
    .join('_');
  return `${dataType}_${dataset}_${matchOnStr}`
    .replaceAll('-', '')
    .replaceAll(' ', '')
    .replaceAll('(', '')
    .replaceAll(')', ''); // TODO: figure out better alternative
}


export function useSqlInsert(loaders, dataToInsert) {
  const duckdb = useDuckDB();

  const insertQueries = useQueries({
    queries: dataToInsert.map(({ dataType, dataset, matchOn }) => ({
      enabled: !duckdb.loading && !duckdb.error,
      meta: { duckdb, loaders },
      queryKey: [dataType, dataset, matchOn, 'sql-insert'],
      // TODO: Update queryKey to support appending to same table / multiple insertions.
      queryFn: async (ctx) => {
        const [dataType, dataset, matchOn] = ctx.queryKey;
        const { loaders, duckdb } = ctx.meta;
        const loader = getMatchingLoader(loaders, dataset, dataType, matchOn);
        if(loader) {
          const implementsLoadArrow = typeof loader.loadArrow === 'function';
          if(implementsLoadArrow) {
            const arrowTable = await loader.loadArrow();
            console.log('start insert for', dataType)
            const conn = await duckdb.db.connect();
            // TODO: convert to IPC first?
            // Reference: https://github.com/observablehq/feedback/issues/623
            const arrowBuffer = tableToIPC(arrowTable, 'stream');
            console.log(arrowBuffer.byteLength);
            await conn.insertArrowFromIPCStream(arrowBuffer, {
              create: true, // TODO: determine when to insert vs. create
              name: getTableName({ dataset, dataType, matchOn }),
              // TODO: what does the 'schema' option do?
            });
            await conn.close();
            console.log('end insert for', dataType)
            return true;
          }
        }
        return false
      },
    })),
  });
  
  const anyLoading = insertQueries.some(q => q.isFetching || q.isLoading);
  const anyError = insertQueries.some(q => q.isError);
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = anyLoading ? STATUS.LOADING : (anyError ? STATUS.ERROR : STATUS.SUCCESS);
  const isSuccess = dataStatus === STATUS.SUCCESS;

  return [isSuccess];
}

export function useSql(insertionStatus, queryString, options) {
  // TODO: parameters for invalidation?
  const duckdb = useDuckDB();

  const sqlQuery = useQuery({
    enabled: insertionStatus,
    meta: { duckdb, options },
    queryKey: [queryString, 'sql-query'],
    queryFn: async (ctx) => {
      const { duckdb, options } = ctx.meta;
      const [queryString] = ctx.queryKey;
      const { singleRow, extensions } = options || {}
      const conn = await duckdb.db.connect();
      if(Array.isArray(extensions)) {
        for(const extension of extensions) {
          await conn.query(`INSTALL ${extension}`);
        }
        for(const extension of extensions) {
          await conn.query(`LOAD ${extension}`);
        }
      }
      const result = await conn.query(queryString);
      if(options.last) {
        await conn.close();
      }
      if(singleRow) {
        return result.toArray()[0];
      }
      return result;
    },
  });

  const { data: queryResult, status, isFetching, error } = sqlQuery;

  const dataStatus = isFetching ? STATUS.LOADING : status;
  return [queryResult, dataStatus];
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
    // Note: same key structure/suffix as
    // useDataTypeMulti() and getQueryKeyScopeTuplesAux()
    // for shared caching.
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
  const requestInit = data?.requestInit;


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
  return [loadedData, dataStatus, urls, requestInit];
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
  mergeCoordination, viewUid,
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
      // Note: same key structure/suffix as
      // useDataType() and getQueryKeyScopeTuplesAux()
      // for shared caching.
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
      .filter(q => Boolean(q.data?.coordinationValues))
      .forEach((q) => {
        const { coordinationValues } = q.data;
        if (mergeCoordination) {
          mergeCoordination(
            coordinationValues,
            // Auto-generate based on the dataset and data type.
            getInitialCoordinationScopePrefix(dataset, dataType),
            viewUid,
          );
        } else {
          initCoordinationSpace(
            coordinationValues,
            coordinationSetters,
            initialCoordinationValues,
          );
        }
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
  const data = useMemo(() => Object.fromEntries(
    matchOnEntries.map(([scopeKey], i) => ([scopeKey, dataQueries[i].data?.data])),
  // Deliberate dependency omissions: dataQueries and matchOnEntries,
  // since dataQueries changes every re-render. We use the in-direct
  // dependency of matchOnObj and the derived primitive value dataStatus.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [matchOnObj, dataStatus]);

  // Convert data to object keyed by scopeKey.
  const urls = useMemo(() => Object.fromEntries(
    matchOnEntries.map(([scopeKey], i) => ([scopeKey, dataQueries[i].data?.urls])),
  // Deliberate dependency omissions: matchOnEntries, since dataQueries depends on it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [dataQueries]);

  return [data, dataStatus, urls];
}

export function useHasLoader(loaders, dataset, dataType, matchOn) {
  const loader = useMatchingLoader(loaders, dataset, dataType, matchOn);
  return loader !== null;
}
