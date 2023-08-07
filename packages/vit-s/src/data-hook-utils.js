import { useEffect, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { extent } from 'd3-array';
import { capitalize, fromEntries } from '@vitessce/utils';
import { DataType, STATUS } from '@vitessce/constants-internal';
import {
  getMatchingLoader,
  useMatchingLoader,
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

  // Convert data to object keyed by scopeKey.
  const urls = useMemo(() => fromEntries(
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

function getFeatureSelectionQueryKeyScopeTuplesAux(
  allSelections, allMatchOnObj, depth, dataset, dataType, isRequired,
  prevLevelScopes, currSelection, currMatchOn,
) {
  // Base case
  if (depth === 0) {
    return currSelection
      ?.map((featureId, featureIndex) => ([
        // queryKey:
        // TODO: use same key suffix as useFeatureSelection for shared caching?
        [dataset, dataType, currMatchOn, featureId, isRequired, 'useFeatureSelectionMultiLevel'],
        // scope info (for rolling up later)
        { levelScopes: prevLevelScopes, featureIndex, numFeatures: currSelection.length },
      ])) || [];
  }
  // Recursive case
  return Object.entries(currSelection)
    ?.flatMap(([levelScope, levelSelections]) => getFeatureSelectionQueryKeyScopeTuplesAux(
      allSelections,
      allMatchOnObj,
      depth - 1,
      dataset,
      dataType,
      isRequired,
      [...prevLevelScopes, levelScope],
      levelSelections,
      currMatchOn?.[levelScope],
    )) || [];
}

/**
 * Get a flat list of tuples like (queryKey, scopeInfo)
 * where scopeInfo is an object like { levelScopes, featureIndex, numFeatures }.
 * Selections and matchOnObj are assumed to be objects with the same keys,
 * both nested to the specified depth. For example, if depth is 2,
 * the first level of keys might be for image layer scopes,
 * and the second level of keys might be for channel scopes.
 * @param {object} selections
 * @param {object} matchOnObj
 * @param {number} depth
 * @param {string} dataset
 * @param {string} dataType
 * @returns
 */
export function getFeatureSelectionQueryKeyScopeTuples(
  selections, matchOnObj, depth,
  dataset, dataType, isRequired,
) {
  // Begin recursion.
  return getFeatureSelectionQueryKeyScopeTuplesAux(
    selections,
    matchOnObj,
    depth,
    dataset,
    dataType,
    isRequired,
    [],
    selections,
    matchOnObj,
  );
}

function getMatrixIndicesQueryKeyScopeTuplesAux(
  allMatchOnObj, depth, dataset, dataType, isRequired,
  prevLevelScopes, currMatchOn,
) {
  // Base case
  if (depth === 0) {
    return ([[
      // queryKey:
      // Note: this uses the same key structure/suffix as
      // useObsFeatureMatrixIndices for shared caching.
      [dataset, dataType, currMatchOn, isRequired, 'useObsFeatureMatrixIndices'],
      // scope info (for rolling up later)
      { levelScopes: prevLevelScopes },
    ]]);
  }
  // Recursive case
  return Object.entries(currMatchOn)
    ?.flatMap(([levelScope, levelMatchOn]) => getMatrixIndicesQueryKeyScopeTuplesAux(
      allMatchOnObj,
      depth - 1,
      dataset,
      dataType,
      isRequired,
      [...prevLevelScopes, levelScope],
      levelMatchOn,
    )) || [];
}

/**
 * Get a flat list of tuples like (queryKey, scopeInfo)
 * where scopeInfo is an object like { levelScopes, featureIndex, numFeatures }.
 * Selections and matchOnObj are assumed to be objects with the same keys,
 * both nested to the specified depth. For example, if depth is 2,
 * the first level of keys might be for image layer scopes,
 * and the second level of keys might be for channel scopes.
 * @param {object} matchOnObj
 * @param {number} depth
 * @param {string} dataset
 * @param {string} dataType
 * @returns
 */
export function getMatrixIndicesQueryKeyScopeTuples(
  matchOnObj, depth,
  dataset, dataType, isRequired,
) {
  // Begin recursion.
  return getMatrixIndicesQueryKeyScopeTuplesAux(
    matchOnObj,
    depth,
    dataset,
    dataType,
    isRequired,
    [],
    matchOnObj,
  );
}

function getQueryKeyScopeTuplesAux(
  allMatchOnObj, depth, dataset, dataType, isRequired,
  prevLevelScopes, currMatchOn,
) {
  // Base case
  if (depth === 0) {
    return ([[
      // queryKey:
      // Note: same key structure/suffix as
      // useDataType() and useDataTypeMulti()
      // for shared caching.
      [dataset, dataType, currMatchOn, isRequired, 'useDataType'],
      // scope info (for rolling up later)
      { levelScopes: prevLevelScopes },
    ]]);
  }
  // Recursive case
  return Object.entries(currMatchOn)
    ?.flatMap(([levelScope, levelMatchOn]) => getQueryKeyScopeTuplesAux(
      allMatchOnObj,
      depth - 1,
      dataset,
      dataType,
      isRequired,
      [...prevLevelScopes, levelScope],
      levelMatchOn,
    )) || [];
}

/**
 * Get a flat list of tuples like (queryKey, scopeInfo)
 * where scopeInfo is an object like { levelScopes, featureIndex, numFeatures }.
 * Selections and matchOnObj are assumed to be objects with the same keys,
 * both nested to the specified depth. For example, if depth is 2,
 * the first level of keys might be for image layer scopes,
 * and the second level of keys might be for channel scopes.
 * @param {object} matchOnObj
 * @param {number} depth
 * @param {string} dataset
 * @param {string} dataType
 * @returns
 */
export function getQueryKeyScopeTuples(
  matchOnObj, depth,
  dataset, dataType, isRequired,
) {
  // Begin recursion.
  return getQueryKeyScopeTuplesAux(
    matchOnObj,
    depth,
    dataset,
    dataType,
    isRequired,
    [],
    matchOnObj,
  );
}


function initializeNestedObjectAux(levelScopes, currObj, getBaseValue, currLevel) {
  const currScope = levelScopes[currLevel];
  const depthRemaining = levelScopes.length - currLevel;
  // Base case.
  if (depthRemaining === 0) {
    return currObj;
  }
  // Recursive case.
  if (!currObj[currScope]) {
    if (depthRemaining === 1) {
      // eslint-disable-next-line no-param-reassign
      currObj[currScope] = getBaseValue();
    } else {
      // eslint-disable-next-line no-param-reassign
      currObj[currScope] = {};
    }
  }
  return initializeNestedObjectAux(levelScopes, currObj[currScope], getBaseValue, currLevel + 1);
}

/**
 * For a list of paths into a nested object,
 * initialize the object if the object keys do not yet exist.
 * For the first level, the object is initialized to the return
 * value of getBaseValue. For example, this allows initializing
 * to an empty array (without reusing the same array object reference).
 * @param {string[]} levelScopes
 * @param {object} currObj
 * @param {function} getBaseValue
 * @returns The value at the end of the path specified by `levelScopes`.
 */
export function initializeNestedObject(levelScopes, currObj, getBaseValue) {
  // Begin recursion.
  return initializeNestedObjectAux(levelScopes, currObj, getBaseValue, 0);
}

/**
 * Nest query results.
 * @param {array} queryKeyScopeTuples
 * @param {array} flatQueryResults Return value of useQueries,
 * after .map() to get inner data elements.
 * @returns The nested object.
 */
export function nestFeatureSelectionQueryResults(queryKeyScopeTuples, flatQueryResults) {
  const nestedData = {};

  // eslint-disable-next-line no-unused-vars
  queryKeyScopeTuples.forEach(([queryKey, { levelScopes, featureIndex, numFeatures }], i) => {
    const getBaseValue = () => new Array(numFeatures);
    const subObj = initializeNestedObject(levelScopes, nestedData, getBaseValue);
    subObj[featureIndex] = flatQueryResults?.[i];
  });
  return nestedData;
}

/**
 * Nest query results.
 * @param {array} queryKeyScopeTuples
 * @param {array} flatQueryResults Return value of useQueries,
 * after .map() to get inner data elements.
 * @param {string[]} outKeys The keys to use for the innermost nesting, such as
 * ['obsIndex', 'featureIndex']. Should be present in the flatQueryResults.
 * @returns The nested object.
 */
export function nestQueryResults(queryKeyScopeTuples, flatQueryResults, outKeys) {
  const nestedData = {};

  // eslint-disable-next-line no-unused-vars
  queryKeyScopeTuples.forEach(([queryKey, { levelScopes }], i) => {
    const getBaseValue = () => ({});
    const subObj = initializeNestedObject(levelScopes, nestedData, getBaseValue);
    outKeys.forEach((key) => {
      subObj[key] = flatQueryResults?.[i]?.[key];
    });
  });
  return nestedData;
}

async function featureSelectionQueryFn(ctx) {
  // (copied from  useFeatureSelection queryFn)
  const { loaders } = ctx.meta;
  const [dataset, dataType, matchOn, featureId, isRequired] = ctx.queryKey;
  const loader = getMatchingLoader(loaders, dataset, dataType, matchOn);
  if (loader) {
    const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
    if (implementsGeneSelection) {
      const payload = await loader.loadGeneSelection({ selection: [featureId] });
      if (!payload) return null;
      const { data } = payload;
      const expressionData = data[0];
      // Compute [min, max] extent of the data, and also a normalized version.
      const dataExtent = extent(expressionData);
      const [min, max] = dataExtent;
      const ratio = 255 / (max - min);
      const normData = new Uint8Array(
        expressionData.map(j => Math.floor((j - min) * ratio)),
      );
      return {
        data: expressionData,
        normData,
        dataExtent,
        dataKey: featureId,
      };
    }
    // Loader does not implement loadGeneSelection.
    const payload = await loader.load();
    if (!payload) return null;
    const { data } = payload;
    const { obsIndex, featureIndex, obsFeatureMatrix } = data;
    // Compute expressionData
    const geneIndex = featureIndex.indexOf(featureId);
    const numGenes = featureIndex.length;
    const numCells = obsIndex.length;
    const expressionData = new Float32Array(numCells);
    for (let cellIndex = 0; cellIndex < numCells; cellIndex += 1) {
      expressionData[cellIndex] = obsFeatureMatrix.data[cellIndex * numGenes + geneIndex];
    }
    // Compute [min, max] extent of the data, and also a normalized version.
    const dataExtent = extent(expressionData);
    const [min, max] = dataExtent;
    const ratio = 255 / (max - min);
    const normData = new Uint8Array(
      expressionData.map(j => Math.floor((j - min) * ratio)),
    );
    return {
      data: expressionData,
      normData,
      dataExtent,
      dataKey: featureId,
    };
  }
  // No loader was found.
  if (isRequired) {
    throw new LoaderNotFoundError(loaders, dataset, dataType, matchOn);
  } else {
    return { data: null, dataKey: null };
  }
}

export function useFeatureSelectionMultiLevel(
  loaders, dataset, isRequired, matchOnObj, selections,
  depth,
) {
  const setWarning = useSetWarning();

  // Create a flat list of tuples (queryKey, scopeInfo).
  const queryKeyScopeTuples = useMemo(() => getFeatureSelectionQueryKeyScopeTuples(
    selections, matchOnObj, depth, dataset, DataType.OBS_FEATURE_MATRIX, isRequired,
  ), [selections, matchOnObj, depth, dataset]);

  const featureQueries = useQueries({
    queries: queryKeyScopeTuples.map(([queryKey]) => ({
      structuralSharing: false,
      placeholderData: null,
      queryKey,
      queryFn: featureSelectionQueryFn,
      meta: { loaders },
    })),
  });

  const anyLoading = featureQueries.some(q => q.isFetching);
  const anyError = featureQueries.some(q => q.isError);
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = anyLoading ? STATUS.LOADING : (anyError ? STATUS.ERROR : STATUS.SUCCESS);
  const flatGeneData = featureQueries.map(q => q.data?.data || null);
  const flatLoadedGeneName = featureQueries.map(q => q.data?.dataKey || null);
  const flatExtents = featureQueries.map(q => q.data?.dataExtent || null);
  const flatNormData = featureQueries.map(q => q.data?.normData || null);

  useEffect(() => {
    featureQueries
      .map(q => q.error)
      .filter(e => Boolean(e))
      .forEach((error) => {
        warn(error, setWarning);
      });
  // Deliberate dependency omissions: use indirect dependencies for efficiency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyError, setWarning]);

  // Need to re-nest the geneData and the loadedGeneName info.
  const [geneData, loadedGeneName, extents, normData] = useMemo(() => {
    const nestedGeneData = nestFeatureSelectionQueryResults(queryKeyScopeTuples, flatGeneData);
    const nestedLoadedGeneName = nestFeatureSelectionQueryResults(
      queryKeyScopeTuples, flatLoadedGeneName,
    );
    const nestedExtents = nestFeatureSelectionQueryResults(queryKeyScopeTuples, flatExtents);
    const nestedNormData = nestFeatureSelectionQueryResults(queryKeyScopeTuples, flatNormData);
    return [nestedGeneData, nestedLoadedGeneName, nestedExtents, nestedNormData];

  // We do not want this useMemo to execute on every re-render, only when the
  // featureQueries results change. Unfortunately, the featureQueries array
  // reference is not stable on each re-render, so we use dataUpdatedAt instead.
  // We use .reduce to ensure the number of dependencies is stable
  // (i.e., a single number, despite possibly different numbers of queries).
  // Reference: https://github.com/TanStack/query/issues/3049#issuecomment-1253201068
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureQueries.reduce((a, h) => a + h.dataUpdatedAt, 0)]);

  return [geneData, loadedGeneName, extents, normData, dataStatus];
}

async function matrixIndicesQueryFn(ctx) {
  // (copied from  useFeatureSelection queryFn)
  const { loaders } = ctx.meta;
  const [dataset, dataType, matchOn, isRequired] = ctx.queryKey;
  const loader = getMatchingLoader(loaders, dataset, dataType, matchOn);
  if (loader) {
    const implementsLoadAttrs = typeof loader.loadAttrs === 'function';
    if (implementsLoadAttrs) {
      const payload = await loader.loadAttrs();
      if (!payload) return null;
      const { data: payloadData } = payload;
      return {
        data: {
          obsIndex: payloadData.rows,
          featureIndex: payloadData.cols,
        },
      };
    }
    // Loader does not implement loadAttrs.
    const payload = await loader.load();
    if (!payload) return null;
    const { data: payloadData } = payload;
    return {
      data: {
        obsIndex: payloadData.obsIndex,
        featureIndex: payloadData.featureIndex,
      },
    };
  }
  // No loader was found.
  if (isRequired) {
    throw new LoaderNotFoundError(loaders, dataset, dataType, matchOn);
  } else {
    return { data: null, dataKey: null };
  }
}

export function useObsFeatureMatrixIndicesMultiLevel(
  loaders, dataset, isRequired, matchOnObj,
  depth,
) {
  const setWarning = useSetWarning();

  // Create a flat list of tuples (queryKey, scopeInfo).
  const queryKeyScopeTuples = useMemo(() => getMatrixIndicesQueryKeyScopeTuples(
    matchOnObj, depth, dataset, DataType.OBS_FEATURE_MATRIX, isRequired,
  ), [matchOnObj, depth, dataset]);

  const indicesQueries = useQueries({
    queries: queryKeyScopeTuples.map(([queryKey]) => ({
      structuralSharing: false,
      placeholderData: null,
      queryKey,
      queryFn: matrixIndicesQueryFn,
      meta: { loaders },
    })),
  });

  const anyLoading = indicesQueries.some(q => q.isFetching);
  const anyError = indicesQueries.some(q => q.isError);
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = anyLoading ? STATUS.LOADING : (anyError ? STATUS.ERROR : STATUS.SUCCESS);
  const flatIndicesData = indicesQueries.map(q => q.data?.data || null);

  useEffect(() => {
    indicesQueries
      .map(q => q.error)
      .filter(e => Boolean(e))
      .forEach((error) => {
        warn(error, setWarning);
      });
  // Deliberate dependency omissions: use indirect dependencies for efficiency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyError, setWarning]);

  // Need to re-nest the geneData and the loadedGeneName info.
  const indicesData = useMemo(() => {
    const nestedIndicesData = nestQueryResults(queryKeyScopeTuples, flatIndicesData, ['obsIndex', 'featureIndex']);
    return nestedIndicesData;

  // We do not want this useMemo to execute on every re-render, only when the
  // featureQueries results change. Unfortunately, the featureQueries array
  // reference is not stable on each re-render, so we use dataUpdatedAt instead.
  // We use .reduce to ensure the number of dependencies is stable
  // (i.e., a single number, despite possibly different numbers of queries).
  // Reference: https://github.com/TanStack/query/issues/3049#issuecomment-1253201068
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicesQueries.reduce((a, h) => a + h.dataUpdatedAt, 0)]);

  return [indicesData, dataStatus];
}

export function useObsLocationsMultiLevel(
  loaders, dataset, isRequired, matchOnObj,
  depth,
) {
  const setWarning = useSetWarning();

  // Create a flat list of tuples (queryKey, scopeInfo).
  const queryKeyScopeTuples = useMemo(() => getQueryKeyScopeTuples(
    matchOnObj, depth, dataset, DataType.OBS_LOCATIONS, isRequired,
  ), [matchOnObj, depth, dataset]);

  const locationsQueries = useQueries({
    queries: queryKeyScopeTuples.map(([queryKey]) => ({
      structuralSharing: false,
      placeholderData: null,
      queryKey,
      queryFn: dataQueryFn,
      meta: { loaders },
    })),
  });

  const anyLoading = locationsQueries.some(q => q.isFetching);
  const anyError = locationsQueries.some(q => q.isError);
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = anyLoading ? STATUS.LOADING : (anyError ? STATUS.ERROR : STATUS.SUCCESS);
  const flatIndicesData = locationsQueries.map(q => q.data?.data || null);

  useEffect(() => {
    locationsQueries
      .map(q => q.error)
      .filter(e => Boolean(e))
      .forEach((error) => {
        warn(error, setWarning);
      });
  // Deliberate dependency omissions: use indirect dependencies for efficiency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyError, setWarning]);

  // Need to re-nest the geneData and the loadedGeneName info.
  const locationsData = useMemo(() => {
    const nestedIndicesData = nestQueryResults(queryKeyScopeTuples, flatIndicesData, ['obsIndex', 'obsLocations']);
    return nestedIndicesData;

  // We do not want this useMemo to execute on every re-render, only when the
  // featureQueries results change. Unfortunately, the featureQueries array
  // reference is not stable on each re-render, so we use dataUpdatedAt instead.
  // We use .reduce to ensure the number of dependencies is stable
  // (i.e., a single number, despite possibly different numbers of queries).
  // Reference: https://github.com/TanStack/query/issues/3049#issuecomment-1253201068
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationsQueries.reduce((a, h) => a + h.dataUpdatedAt, 0)]);

  return [locationsData, dataStatus];
}
