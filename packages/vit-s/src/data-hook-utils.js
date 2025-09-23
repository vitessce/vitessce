import { useEffect, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
  capitalize,
  getInitialCoordinationScopePrefix,
} from '@vitessce/utils';
import { STATUS } from '@vitessce/constants-internal';
import {
  LoaderNotFoundError,
} from '@vitessce/error';
import {
  getMatchingLoader,
  useMatchingLoader,
} from './state/hooks.js';


const DEFAULT_NG_PROPS = {
  layout: '3d',
  position: [0, 0, 0],
  projectionOrientation: [0, 0, 0, 1],
  projectionScale: 1024,
  crossSectionScale: 1,
};

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
    throw new LoaderNotFoundError(`Loader not found for parameters: ${dataset}, ${dataType}, ${JSON.stringify(matchOn)}`);
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
 * @returns {array} [data, status, urls, error] where
 * cells is an object and cellsCount is the
 * number of items in the cells object.
 */
export function useDataType(
  dataType, loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
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

  const dataStatus = isFetching ? STATUS.LOADING : status;
  return [loadedData, dataStatus, urls, error];
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
 * @param {object} matchOnObj Coordination values used to obtain a matching loader.
 * @param {function} mergeCoordination Function to merge coordination values.
 * @param {string} viewUid The view UID to use for merging coordination values.
 * @returns {array} [data, status, urls, errors]
 */
export function useDataTypeMulti(
  dataType, loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOnObj,
  mergeCoordination, viewUid,
) {
  const placeholderObject = useMemo(() => ({}), []);
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
  const errors = anyError ? dataQueries.filter(q => q.isError).map(q => q.error) : [];
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

  return [data, dataStatus, urls, errors];
}

export function useHasLoader(loaders, dataset, dataType, matchOn) {
  const loader = useMatchingLoader(loaders, dataset, dataType, matchOn);
  return loader !== null;
}

function toPrecomputedSource(url) {
  if (!url) return undefined;
  return url.startsWith('precomputed://') ? url : `precomputed://${url}`;
}

const UNIT_TO_NM = {
  nm: 1,
  um: 1e3,
  µm: 1e3,
  micron: 1e3,
  microns: 1e3,
  micrometer: 1e3,
  micrometers: 1e3,
  mm: 1e6,
  cm: 1e7,
  m: 1e9,
};

function normalizeUnit(u) {
  if (!u) return 'nm';
  const s = String(u).trim().toLowerCase();
  if (s === 'µm') return 'um';
  if (s === 'meter' || s === 'meters') return 'm';
  if (s === 'millimeter' || s === 'millimeters') return 'mm';
  if (s === 'centimeter' || s === 'centimeters') return 'cm';
  if (s === 'kilometer' || s === 'kilometers') return 'km';
  if (s === 'nanometer' || s === 'nanometers') return 'nm';
  return s;
}

function isInNanometerRange(value, unit, minNm = 1, maxNm = 100) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return false;

  const u = normalizeUnit(unit);
  const factor = u && UNIT_TO_NM[u];
  if (!factor) return false;

  const nm = n * factor;
  return nm >= minNm && nm <= maxNm;
}

/**
 * Normalize dimensionX/Y/Z to nanometers.
 * @param {object} opts
 * @returns {{ x:[number,'nm'], y:[number,'nm'], z:[number,'nm'] }}
 */
export function normalizeDimensionsToNanometers(opts) {
  const { dimensionUnit, dimensionX, dimensionY, dimensionZ } = opts;

  if (!dimensionUnit || !dimensionX || !dimensionY || !dimensionZ) {
    console.warn('Missing dimension info');
  }
  const xNm = isInNanometerRange(dimensionX, dimensionUnit);
  const yNm = isInNanometerRange(dimensionY, dimensionUnit);
  const zNm = isInNanometerRange(dimensionZ, dimensionUnit);
  if (!xNm || !yNm || !zNm) {
    console.warn('Dimension was converted to nm units');
  }
  return {
    x: xNm ? [dimensionX, dimensionUnit] : [1, 'nm'],
    y: yNm ? [dimensionY, dimensionUnit] : [1, 'nm'],
    z: zNm ? [dimensionZ, dimensionUnit] : [1, 'nm'],
  };
}

export function extractDataTypeEntities(loaders, dataset, dataType) {
  const datasetEntry = loaders?.[dataset];
  const internMap = datasetEntry?.loaders?.[dataType];
  if (!internMap || typeof internMap.entries !== 'function') return [];

  return Array.from(internMap.entries()).map(([key, loader]) => {
    const url = loader?.url ?? loader?.dataSource?.url ?? undefined;
    const fileUid = key?.fileUid
      ?? loader?.coordinationValues?.fileUid
      ?? undefined;

    const { type, layout, position, projectionOrientation,
      projectionScale, crossSectionScale } = loader?.options ?? {};
    const isPrecomputed = loader?.fileType.includes('precomputed');
    if (!isPrecomputed) {
      console.warn('Filetype needs to be precomputed');
    }
    // TODO: do we want to default these, or throw errors/notify user of invalid values
    return {
      key,
      type,
      fileUid,
      // TODO: do we want to allow other values?
      layout: layout ?? DEFAULT_NG_PROPS.layout,
      url,
      source: toPrecomputedSource(url),
      name: fileUid ?? key?.name ?? 'segmentation',
      // For precomputed: nm is the unit used
      dimensions: normalizeDimensionsToNanometers(loader?.options),
      // If not provided, no error, but difficult to see the data
      position: Array.isArray(position) && position.length === 3
        ? position : DEFAULT_NG_PROPS.position,
      // If not provided, will have a default orientation
      projectionOrientation: Array.isArray(projectionOrientation)
        && projectionOrientation.length === 4
        ? projectionOrientation : DEFAULT_NG_PROPS.projectionOrientation,
      //  If not provided, NGSubscriber takes care of it
      projectionScale: Number.isFinite(projectionScale)
        ? projectionScale : DEFAULT_NG_PROPS.projectionScale,
      crossSectionScale: Number.isFinite(crossSectionScale)
        ? crossSectionScale : DEFAULT_NG_PROPS.crossSectionScale,
    };
  });
}

export function useExtractOptionsForNg(loaders, dataset, dataType) {
  const extractedEntities = useMemo(
    () => extractDataTypeEntities(loaders, dataset, dataType),
    [loaders, dataset, dataType],
  );
  const layers = useMemo(() => extractedEntities
    .filter(t => t.source)
    .map(t => ({
      type: t.type,
      source: t.source,
      segments: [],
      name: t.name || 'segmentation',
    })), [extractedEntities]);

  const viewerState = useMemo(() => ({
    dimensions: extractedEntities[0]?.dimensions,
    position: extractedEntities[0]?.position,
    crossSectionScale: extractedEntities[0]?.crossSectionScale,
    projectionOrientation: extractedEntities[0]?.projectionOrientation,
    projectionScale: extractedEntities[0]?.projectionScale,
    layers,
    layout: extractedEntities[0].layout,
  }));

  return [viewerState];
}
