import { useState, useEffect, useMemo } from 'react';
import { CoordinationType, DataType, STATUS } from '@vitessce/constants-internal';
import { fromEntries } from '@vitessce/utils';
import { useQuery } from '@tanstack/react-query';
import {
  getMatchingLoader,
  useMatchingLoader,
  useMultiCoordinationValues,
  useSetWarning,
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
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_EMBEDDING,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsLocationsData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_LOCATIONS,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsLabelsData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_LABELS,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsSegmentationsData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_SEGMENTATIONS,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsSetsData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_SETS,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useObsFeatureMatrixData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.OBS_FEATURE_MATRIX,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useFeatureLabelsData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.FEATURE_LABELS,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useImageData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.IMAGE,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useGenomicProfilesData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.GENOMIC_PROFILES,
    loaders, dataset, addUrl, isRequired,
    coordinationSetters, initialCoordinationValues, matchOn,
  );
}

export function useNeighborhoodsData(
  loaders, dataset, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues, matchOn,
) {
  return useDataType(
    DataType.NEIGHBORHOODS,
    loaders, dataset, addUrl, isRequired,
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
  const featureQuery = useQuery({
    // TODO: useQueries instead,
    // performing loadGeneSelection for each item in `selection` independently.
    // This will require updating loadGeneSelection functions
    // to consider one gene at a time vs. handing arrays internally.
    enabled: !!selection,
    structuralSharing: false,
    placeholderData: null,
    queryKey: [dataset, DataType.OBS_FEATURE_MATRIX, matchOn, selection, 'useFeatureSelection'],
    // Query function should return an object
    // { data, dataKey } where dataKey is the loaded gene selection.
    queryFn: async (ctx) => {
      const loader = getMatchingLoader(
        ctx.meta.loaders, ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2],
      );
      if (loader) {
        const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
        if (implementsGeneSelection) {
          const payload = await loader.loadGeneSelection({ selection });
          if (!payload) return null;
          const { data } = payload;
          return { data, dataKey: selection };
        }
        // Loader does not implement loadGeneSelection.
        const payload = await loader.load();
        if (!payload) return null;
        const { data } = payload;
        const { obsIndex, featureIndex, obsFeatureMatrix } = data;
        const expressionDataForSelection = selection.map((sel) => {
          const geneIndex = featureIndex.indexOf(sel);
          const numGenes = featureIndex.length;
          const numCells = obsIndex.length;
          const expressionData = new Float32Array(numCells);
          for (let cellIndex = 0; cellIndex < numCells; cellIndex += 1) {
            expressionData[cellIndex] = obsFeatureMatrix.data[cellIndex * numGenes + geneIndex];
          }
          return expressionData;
        });
        return { data: expressionDataForSelection, dataKey: selection };
      }
      // No loader was found.
      if (isRequired) {
        throw new LoaderNotFoundError(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn);
      } else {
        return { data: null, dataKey: null };
      }
    },
    meta: { loaders },
  });
  const { data, status } = featureQuery;
  const geneData = data?.data || null;
  const loadedGeneName = data?.dataKey || null;
  return [geneData, loadedGeneName, status];
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
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @returns {object} [attrs] { rows, cols } object containing cell and gene names.
 */
export function useObsFeatureMatrixIndices(
  loaders, dataset, addUrl, isRequired, matchOn,
) {
  // TODO: use setwarning
  const setWarning = useSetWarning();

  const placeholderObject = useMemo(() => ({}), []);

  const indicesQuery = useQuery({
    structuralSharing: false,
    placeholderData: placeholderObject,
    // Include the hook name in the queryKey to prevent the case in which an identical queryKey
    // in a different hook would cause an accidental cache hit.
    queryKey: [dataset, DataType.OBS_FEATURE_MATRIX, matchOn, 'useObsFeatureMatrixIndices'],
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
            urls: [[url, DataType.OBS_FEATURE_MATRIX]],
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
          urls: [[url, DataType.OBS_FEATURE_MATRIX]],
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
    onSuccess: ({ namedUrls }) => {
      // TODO: refactor to simply return the list of URLs rather than using a callback.
      namedUrls?.forEach(([url, name]) => {
        addUrl(url, name);
      });
    },
    meta: { loaders },
  });
  const { data, status } = indicesQuery;
  const loadedData = data?.data || placeholderObject;
  // TODO: set warning
  // TODO: ensure the status constants are correct.
  return [loadedData, status];
}

export function useMultiObsLabels(
  coordinationScopes, obsType, loaders, dataset, addUrl,
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
  const [obsLabelsData, obsLabelsDataStatus] = useDataTypeMulti(
    DataType.OBS_LABELS, loaders, dataset,
    addUrl, false, {}, {},
    obsLabelsMatchOnObj,
  );
  return [obsLabelsTypes, obsLabelsData, obsLabelsDataStatus];
}
