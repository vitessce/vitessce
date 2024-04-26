import { useEffect, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { extent } from 'd3-array';
import { DataType, STATUS } from '@vitessce/constants-internal';
import {
  getMatchingLoader,
  useSetWarning,
} from './state/hooks.js';
import {
  LoaderNotFoundError,
} from './errors/index.js';
import {
  warn,
  dataQueryFn,
} from './data-hook-utils.js';


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
 * @returns The nested object.
 */
export function nestQueryResults(queryKeyScopeTuples, flatQueryResults) {
  const nestedData = {};

  // eslint-disable-next-line no-unused-vars
  queryKeyScopeTuples.forEach(([queryKey, { levelScopes }], i) => {
    const getBaseValue = () => ({});
    const subObj = initializeNestedObject(levelScopes, nestedData, getBaseValue);
    Object.entries(flatQueryResults?.[i] || {}).forEach(([key, value]) => {
      subObj[key] = value;
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
    const nestedIndicesData = nestQueryResults(queryKeyScopeTuples, flatIndicesData);
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

function useDataTypeMultiLevel(
  loaders, dataset, isRequired, matchOnObj,
  depth, dataType,
) {
  const setWarning = useSetWarning();

  // Create a flat list of tuples (queryKey, scopeInfo).
  const queryKeyScopeTuples = useMemo(() => getQueryKeyScopeTuples(
    matchOnObj, depth, dataset, dataType, isRequired,
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
    const nestedIndicesData = nestQueryResults(queryKeyScopeTuples, flatIndicesData);
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

export function useObsLocationsMultiLevel(
  loaders, dataset, isRequired, matchOnObj,
  depth,
) {
  return useDataTypeMultiLevel(
    loaders, dataset, isRequired, matchOnObj,
    depth, DataType.OBS_LOCATIONS,
  );
}

export function useObsSetsMultiLevel(
  loaders, dataset, isRequired, matchOnObj,
  depth,
) {
  return useDataTypeMultiLevel(
    loaders, dataset, isRequired, matchOnObj,
    depth, DataType.OBS_SETS,
  );
}

export function useObsLabelsMultiLevel(
  loaders, dataset, isRequired, matchOnObj,
  depth,
) {
  return useDataTypeMultiLevel(
    loaders, dataset, isRequired, matchOnObj,
    depth, DataType.OBS_LABELS,
  );
}
