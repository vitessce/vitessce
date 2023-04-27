import { useState, useEffect, useMemo } from 'react';
import { CoordinationType, DataType, STATUS } from '@vitessce/constants-internal';
import { fromEntries } from '@vitessce/utils';
import {
  useQuery,
} from '@tanstack/react-query';
import {
  getMatchingLoader,
  useMatchingLoader,
  useMultiCoordinationValues,
  useSetWarning,
} from './state/hooks';
import {
  LoaderNotFoundError,
} from './errors/index';
import {
  warn,
  useDataType,
  useDataTypeMulti,
} from './data-hook-utils';

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
    // TODO: useQueries instead, performing loadGeneSelection for each item in `selection` independently.
    // Will require updating loadGeneSelection to consider one gene at a time vs. handing arrays internally.
    enabled: !!selection,
    structuralSharing: false,
    placeholderData: null,
    queryKey: [dataset, DataType.OBS_FEATURE_MATRIX, matchOn, selection],
    queryFn: async (ctx) => {
      const loader = getMatchingLoader(ctx.meta.loaders, ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2]);
      if (loader) {
        const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
        if (implementsGeneSelection) {
          const payload = await loader.loadGeneSelection({ selection });
          if (!payload) return null;
          const { data } = payload;
          return data;
          // TODO: still return loaded selection? Or include the queryKey in the return value?
          // setLoadedGeneName(selection);
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
        return expressionDataForSelection;
        // setLoadedGeneName(selection);
      }
      // No loader was found.
      if (isRequired) {
        throw new LoaderNotFoundError(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn);
      } else {
        return null;
      }
    },
    meta: { loaders },
  });
  const { data: geneData, status } = featureQuery;

  // TODO: remove loadedGeneName element from returned array.
  const loadedGeneName = null;
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
  const [data, setData] = useState({});
  const [status, setStatus] = useState(STATUS.LOADING);

  const setWarning = useSetWarning();
  const loader = useMatchingLoader(loaders, dataset, DataType.OBS_FEATURE_MATRIX, matchOn);

  useEffect(() => {
    if (loader) {
      setStatus(STATUS.LOADING);
      const implementsLoadAttrs = typeof loader.loadAttrs === 'function';
      if (implementsLoadAttrs) {
        loader.loadAttrs().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data: payloadData, url } = payload;
          setData({
            obsIndex: payloadData.rows,
            featureIndex: payloadData.cols,
          });
          addUrl(url, DataType.OBS_FEATURE_MATRIX);
          setStatus(STATUS.SUCCESS);
        });
      } else {
        loader.load().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data: payloadData, url } = payload;
          setData({
            obsIndex: payloadData.obsIndex,
            featureIndex: payloadData.featureIndex,
          });
          addUrl(url, DataType.OBS_FEATURE_MATRIX);
          setStatus(STATUS.SUCCESS);
        });
      }
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
  }, [loader]);

  return [data, status];
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
