import { useState, useEffect, useMemo } from 'react';
import { CoordinationType, DataType, STATUS } from '@vitessce/constants-internal';
import { fromEntries } from '@vitessce/utils';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
  useMultiCoordinationValues,
  useComplexCoordination,
  useSetWarning,
  getMatchingLoader,
} from './state/hooks.js';
import {
  LoaderNotFoundError,
} from './errors/index.js';
import {
  warn,
  useDataType,
  useDataTypeMulti,
} from './data-hook-utils.js';

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
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_EMBEDDING,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsSpotsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_SPOTS,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsPointsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_POINTS,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsLocationsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_LOCATIONS,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsLabelsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_LABELS,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsSegmentationsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_SEGMENTATIONS,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsSetsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_SETS,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsFeatureMatrixData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_FEATURE_MATRIX,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useFeatureLabelsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.FEATURE_LABELS,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useImageData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.IMAGE,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useGenomicProfilesData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.GENOMIC_PROFILES,
    loaders, dataset, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useNeighborhoodsData(
  loaders, dataset, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.NEIGHBORHOODS,
    loaders, dataset, isRequired,
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
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {boolean} selection A list of gene names to get expression data for.
 * @returns {array} [geneData] where geneData is an array [Uint8Array, ..., Uint8Array]
 * for however many genes are in the selection.
 */
export function useFeatureSelection(
  loaders,
  dataset,
  isRequired,
  selection,
  matchOn,
) {
  const setWarning = useSetWarning();
  const featureQueries = useQueries({
    queries: selection?.map(featureId => ({
      structuralSharing: false,
      placeholderData: null,
      queryKey: [dataset, DataType.OBS_FEATURE_MATRIX, matchOn, featureId, 'useFeatureSelection'],
      // Query function should return an object
      // { data, dataKey } where dataKey is the loaded gene selection.
      queryFn: async (ctx) => {
        const loader = getMatchingLoader(
          ctx.meta.loaders, ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2],
        );
        if (loader) {
          const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
          if (implementsGeneSelection) {
            const payload = await loader.loadGeneSelection({ selection: [featureId] });
            if (!payload) return null;
            const { data } = payload;
            return { data: data[0], dataKey: featureId };
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
          return { data: expressionData, dataKey: featureId };
        }
        // No loader was found.
        if (isRequired) {
          throw new LoaderNotFoundError(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn);
        } else {
          return { data: null, dataKey: null };
        }
      },
      meta: { loaders },
    })) || [],
  });
  const anyLoading = featureQueries.some(q => q.isFetching);
  const anyError = featureQueries.some(q => q.isError);
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = anyLoading ? STATUS.LOADING : (anyError ? STATUS.ERROR : STATUS.SUCCESS);
  const isSuccess = dataStatus === STATUS.SUCCESS;
  const geneData = isSuccess ? featureQueries.map(q => q.data?.data || null) : null;
  const loadedGeneName = isSuccess ? featureQueries.map(q => q.data?.dataKey || null) : null;

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

  return [geneData, loadedGeneName, dataStatus];
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
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @returns {object} [attrs] { rows, cols } object containing cell and gene names.
 */
export function useObsFeatureMatrixIndices(
  loaders, dataset, isRequired, matchOn,
) {
  const setWarning = useSetWarning();
  const placeholderObject = useMemo(() => ({}), []);
  const indicesQuery = useQuery({
    // TODO: only enable once `loaders` is available?
    structuralSharing: false,
    placeholderData: placeholderObject,
    // Include the hook name in the queryKey to prevent the case in which an identical queryKey
    // in a different hook would cause an accidental cache hit.
    // Note: this uses the same key structure/suffix as
    // getMatrixIndicesQueryKeyScopeTuplesAux for shared caching.
    queryKey: [dataset, DataType.OBS_FEATURE_MATRIX, matchOn, isRequired, 'useObsFeatureMatrixIndices'],
    // Query function should return an object
    // { data, dataKey } where dataKey is the loaded gene selection.
    // TODO: use TypeScript to type the return value?
    queryFn: async (ctx) => {
      const loader = getMatchingLoader(
        ctx.meta.loaders, ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2],
      );
      if (loader) {
        const implementsLoadAttrs = typeof loader.loadAttrs === 'function';
        if (implementsLoadAttrs) {
          // Has loadAttrs function.
          const payload = await loader.loadAttrs();
          if (!payload) return placeholderObject;
          const { data: payloadData, url } = payload;

          return {
            data: {
              obsIndex: payloadData.rows,
              featureIndex: payloadData.cols,
            },
            urls: [{ url, name: DataType.OBS_FEATURE_MATRIX }],
          };
        }
        // No loadAttrs function.
        const payload = await loader.load();
        if (!payload) return placeholderObject;
        const { data: payloadData, url } = payload;
        return {
          data: {
            obsIndex: payloadData.obsIndex,
            featureIndex: payloadData.featureIndex,
          },
          urls: [{ url, name: DataType.OBS_FEATURE_MATRIX }],
        };
      }
      // No loader was found.
      if (isRequired) {
        // Status: error
        throw new LoaderNotFoundError(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn);
      } else {
        // Status: success
        return { data: placeholderObject, dataKey: null };
      }
    },
    meta: { loaders },
  });
  const { data, status, isFetching, error } = indicesQuery;
  const loadedData = data?.data || placeholderObject;

  const dataStatus = isFetching ? STATUS.LOADING : status;
  const urls = data?.urls;

  useEffect(() => {
    if (error) {
      setWarning(error.message);
    }
  }, [error, setWarning]);

  return [loadedData, dataStatus, urls];
}

export function useMultiObsPoints(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsTypeCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.POINT_LAYER,
  );
  const matchOnObj = useMemo(() => obsTypeCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [obsPointsData, obsPointsDataStatus, obsPointsUrls] = useDataTypeMulti(
    DataType.OBS_POINTS, loaders, dataset,
    false, {}, {},
    matchOnObj,
  );
  return [obsPointsData, obsPointsDataStatus, obsPointsUrls];
}

export function useMultiObsSpots(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsTypeCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );
  const matchOnObj = useMemo(() => obsTypeCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [obsSpotsData, obsSpotsDataStatus, obsSpotsUrls] = useDataTypeMulti(
    DataType.OBS_SPOTS, loaders, dataset,
    false, {}, {},
    matchOnObj,
  );
  return [obsSpotsData, obsSpotsDataStatus, obsSpotsUrls];
}

export function useSpotMultiObsSets(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsTypeCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );
  const matchOnObj = useMemo(() => obsTypeCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [obsSetsData, obsSetsDataStatus, obsSetsUrls] = useDataTypeMulti(
    DataType.OBS_SETS, loaders, dataset,
    false, {}, {},
    matchOnObj,
  );
  return [obsSetsData, obsSetsDataStatus, obsSetsUrls];
}

export function useMultiObsLabels(
  coordinationScopes, obsType, loaders, dataset,
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
  const [obsLabelsData, obsLabelsDataStatus, obsLabelsUrls] = useDataTypeMulti(
    DataType.OBS_LABELS, loaders, dataset,
    false, {}, {},
    obsLabelsMatchOnObj,
  );
  return [obsLabelsTypes, obsLabelsData, obsLabelsDataStatus, obsLabelsUrls];
}

export function useMultiObsSegmentations(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const imageCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
  );
  const matchOnObj = useMemo(() => imageCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [
    obsSegmentationsData,
    obsSegmentationsDataStatus,
    obsSegmentationsUrls,
  ] = useDataTypeMulti(
    DataType.OBS_SEGMENTATIONS, loaders, dataset,
    false, {}, {},
    matchOnObj,
  );
  return [obsSegmentationsData, obsSegmentationsDataStatus, obsSegmentationsUrls];
}

export function useMultiImages(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  // TODO: delegate the generation of matchOnObj to a different hoook and pass as a parameter?
  // (in all of the useMulti data hooks)?
  const imageCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
  );
  const matchOnObj = useMemo(() => imageCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [imageData, imageDataStatus, imageUrls] = useDataTypeMulti(
    DataType.IMAGE, loaders, dataset,
    false, {}, {},
    matchOnObj,
  );
  return [imageData, imageDataStatus, imageUrls];
}
