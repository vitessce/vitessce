import {
  useRef, useState, useEffect, useCallback, useMemo,
} from 'react';
import { debounce, every } from 'lodash-es';
import { extent } from 'd3-array';
import { useQuery } from '@tanstack/react-query';
import { capitalize } from '@vitessce/utils';
import { STATUS, AsyncFunctionType } from '@vitessce/constants-internal';
import { VITESSCE_CONTAINER } from './classNames.js';
import { useGridResize, useEmitGridResize } from './state/hooks.js';
import { useAsyncFunction } from './contexts.js';


function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useVitessceContainer(ref) {
  return useCallback(() => {
    if (ref.current) {
      return ref.current.closest(`.${VITESSCE_CONTAINER}`);
    }
    return null;
  }, [ref]);
}

/**
 * Custom hook, gets the full window dimensions.
 * @returns {array} `[width, height]` where width and height
 * are numbers.
 */
export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    const onResizeDebounced = debounce(handleResize, 100, { trailing: true });

    window.addEventListener('resize', onResizeDebounced);
    return () => window.removeEventListener('resize', onResizeDebounced);
  }, []);

  return windowDimensions;
}

/**
 * Custom hook, subscribes to GRID_RESIZE and window resize events.
 * @returns {array} `[width, height, containerRef]` where width and height
 * are numbers and containerRef is a React ref.
 */
export function useGridItemSize() {
  const containerRef = useRef();

  const [height, setHeight] = useState();
  const [width, setWidth] = useState();

  const resizeCount = useGridResize();
  const incrementResizeCount = useEmitGridResize();

  // On window resize events, increment the grid resize count.
  useEffect(() => {
    function onWindowResize() {
      incrementResizeCount();
    }
    const onResizeDebounced = debounce(onWindowResize, 100, { trailing: true });
    window.addEventListener('resize', onResizeDebounced);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onResizeDebounced);
    };
  }, [incrementResizeCount]);

  // On new grid resize counts, re-compute the component
  // width/height.
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    setHeight(containerRect.height);
    setWidth(containerRect.width);
  }, [resizeCount]);

  return [width, height, containerRef];
}

/**
 * Custom hook, subscribes to GRID_RESIZE and window resize events.
 * @returns {array} `[width, height, deckRef]` where width and height
 * are numbers and deckRef is a React ref to be used with
 * a <DeckGL/> element (or a forwardRef to one).
 */
export function useDeckCanvasSize() {
  const deckRef = useRef();

  const [height, setHeight] = useState();
  const [width, setWidth] = useState();

  const resizeCount = useGridResize();
  const incrementResizeCount = useEmitGridResize();

  // On window resize events, increment the grid resize count.
  useEffect(() => {
    function onWindowResize() {
      incrementResizeCount();
    }
    const onResizeDebounced = debounce(onWindowResize, 100, { trailing: true });
    window.addEventListener('resize', onResizeDebounced);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onResizeDebounced);
    };
  }, [incrementResizeCount]);

  // On new grid resize counts, re-compute the DeckGL canvas
  // width/height.
  useEffect(() => {
    if (!deckRef.current) return;
    const { canvas } = deckRef.current.deck;
    const canvasRect = canvas.getBoundingClientRect();
    setHeight(canvasRect.height);
    setWidth(canvasRect.width);
  }, [resizeCount]);

  return [width, height, deckRef];
}

/**
 * This hook handles a boolean isReady value,
 * which only returns true once every item in the
 * input list has been marked as "ready".
 * @param {string[]} statusValues The items to wait on.
 * @returns {boolean} Whether the status values are all success.
 */
export function useReady(statusValues) {
  return useMemo(() => every(
    statusValues, val => val !== STATUS.LOADING,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), statusValues);
}

/**
 * This hook helps manage a list of URLs.
 * @param {(null|object[])[]} urls Array of (null or array of { url, name }).
 * @returns {array} An array of { url, name } objects (flattened from the input).
 */
export function useUrls(urls) {
  const mergedUrls = useMemo(
    () => urls.filter(a => Array.isArray(a)).flat().filter((url, index, array) => {
      const firstIndex = array.findIndex(u => u && url && u.name === url.name);
      return index === firstIndex;
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    urls,
  );
  return mergedUrls;
}

/**
 * Custom hook, subscribes to the width and height of the closest .vitessce-container
 * element and updates upon window resize events.
 * @param {Ref} ref A React ref object within the `.vitessce-container`.
 * @returns {array} `[width, height]` where width and height
 * are numbers.
 */
export function useClosestVitessceContainerSize(ref) {
  const [height, setHeight] = useState();
  const [width, setWidth] = useState();

  useEffect(() => {
    function onWindowResize() {
      if (ref.current) {
        const {
          clientHeight: componentHeight, clientWidth: componentWidth,
        } = ref.current.closest(`.${VITESSCE_CONTAINER}`);
        setWidth(componentWidth);
        setHeight(componentHeight);
      }
    }
    const onResizeDebounced = debounce(onWindowResize, 100, { trailing: true });
    window.addEventListener('resize', onResizeDebounced);
    onWindowResize();
    return () => {
      window.removeEventListener('resize', onResizeDebounced);
    };
  }, [ref]);

  return [width, height];
}

/**
 * Normalize an obsFeatureMatrix to a Uint8Array.
 * @param {object} params
 * @param {object} params.obsFeatureMatrix The obsFeatureMatrix
 * returned by the useObsFeatureMatrix hook.
 * @returns {array} A tuple [obsFeatureMatrix, dataExtent]
 * where obsFeatureMatrix
 * is a Uint8Array with the same shape as
 * params.obsFeatureMatrix.data, and dataExtent is the
 * [min, max] of the original data.
 */
export function useUint8ObsFeatureMatrix({ obsFeatureMatrix }) {
  return useMemo(() => {
    if (obsFeatureMatrix && obsFeatureMatrix.data) {
      const dataExtent = extent(obsFeatureMatrix.data);
      const [min, max] = dataExtent;
      const ratio = 255 / (max - min);
      const data = new Uint8Array(
        obsFeatureMatrix.data.map(i => Math.floor((i - min) * ratio)),
      );
      return [{ data }, dataExtent];
    }
    return [null, null];
  }, [obsFeatureMatrix]);
}

/**
 * Normalize a feature selection (data for selected
 * columns of an obsFeatureMatrix) to a Uint8Array.
 * @param {Float32Array[] | null} expressionData The expressionData
 * returned by the useFeatureSelection hook,
 * where each element corresponds to an
 * array of values for a selected feature.
 * @returns {{
 *  normData: Uint8Array[] | null,
 *  extents: [number, number][] | null,
 *  missing: number[]
 * }} An object tuple {normData, extents, missing} where
 * normData is an array of Uint8Arrays (or null),
 * extents is an array of [min, max] values for each feature (or null), and
 * missing is an array of numbers (between 0 and 1) for each feature (or null).
 */
export function useUint8FeatureSelection(expressionData) {
  return useMemo(() => {
    if (expressionData?.[0] == null) {
      return { normData: null, extents: null, missing: null };
    }
    const extents = expressionData.map(arr => extent(arr));
    const normData = expressionData.map((arr, i) => {
      const [min, max] = extents[i];
      const ratio = 255 / (max - min);
      return new Uint8Array(
        arr.map(j => Math.floor((j - min) * ratio)),
      );
    });
    const missing = expressionData.map((arr) => {
      const numMissing = arr.reduce((prev, curr) => (Number.isNaN(curr) ? prev + 1 : prev), 0);
      return numMissing / arr.length;
    });
    return { normData, extents, missing };
  }, [expressionData]);
}

export function useExpressionValueGetter(
  { instanceObsIndex, matrixObsIndex, expressionData },
) {
  // Get a mapping from cell ID to row index in the gene expression matrix.
  // Since the two obsIndices (instanceObsIndex = the obsIndex from obsEmbedding)
  // may be ordered differently (matrixObsIndex = the obsIndex from obsFeatureMatrix),
  // we need a way to look up an obsFeatureMatrix obsIndex index
  // given an obsEmbedding obsIndex index.
  const toMatrixIndexMap = useMemo(() => {
    if (instanceObsIndex && matrixObsIndex) {
      const matrixIndexMap = new Map(matrixObsIndex.map((key, i) => ([key, i])));
      return instanceObsIndex.map(key => matrixIndexMap.get(key));
    }
    return null;
  }, [instanceObsIndex, matrixObsIndex]);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useCallback((entry, { index: instanceIndex }) => {
    if (toMatrixIndexMap && expressionData && expressionData[0]) {
      const rowIndex = toMatrixIndexMap[instanceIndex];
      const val = expressionData[0][rowIndex];
      return val;
    }
    return 0;
  }, [toMatrixIndexMap, expressionData]);
  return getExpressionValue;
}

export function useGetObsMembership(obsSetsMembership) {
  return useCallback((obsId) => {
    if (obsId) {
      return obsSetsMembership?.get(obsId) || [];
    }
    return [];
  }, [obsSetsMembership]);
}

export function useGetObsInfo(obsType, obsLabelsTypes, obsLabelsData, obsSetsMembership) {
  return useCallback((obsId) => {
    if (obsId) {
      const obsMembership = obsSetsMembership?.get(obsId) || [];
      return {
        [`${capitalize(obsType)} ID`]: obsId,
        ...Object.fromEntries(
          obsMembership
            .flatMap(path => path.slice(1).map((pathEl, elLevel) => ([
              `${path[0]}${path.length > 2 ? ` L${elLevel + 1}` : ''}`,
              pathEl,
            ]))),
        ),
        ...Object.fromEntries(
          Object.entries(obsLabelsTypes).map(([scopeKey, obsLabelsType]) => ([
            obsLabelsType,
            obsLabelsData?.[scopeKey]?.obsLabels?.[
              // TODO: Maybe all loaders that return obsIndex should also return an obsIndexMap
              // with keys: obsId, values: obsIdx
              // which would avoid the indexOf calls.
              obsLabelsData?.[scopeKey]?.obsIndex?.indexOf(obsId)
            ],
          ])).filter(([obsLabelsType]) => Boolean(obsLabelsType)),
        ),
      };
    }
    return null;
  }, [obsType, obsLabelsTypes, obsLabelsData, obsSetsMembership]);
}

/**
 * This hook expands a featureLabelsMap
 * by including mappings from ENSEMBL to HGNC IDs.
 * User-provided mappings should take precedence,
 * but they are not always provided in the config or contained
 * in a column of the AnnData.var dataframe, for example.
 * @param {string} featureType A feature type. Fetching is only done for 'gene'.
 * @param {Map|null} featureLabelsMap An optional user-supplied feature labels
 * mapping from the dataset.
 * @returns {{ stripCuriePrefixes: boolean }|null} An options object.
 */
export function useExpandedFeatureLabelsMap(featureType, featureLabelsMap, options) {
  // TODO: Should this be done via a hook?
  // We could alternatively expand these types of mappings in the featureLabels data loader class.
  // TODO: Add an option to opt-out?
  const { stripCuriePrefixes = true } = options || {};
  const getTermMapping = useAsyncFunction(AsyncFunctionType.GET_TERM_MAPPING);

  const enabled = (featureType === 'gene');
  const termMappingQuery = useQuery({
    enabled,
    queryKey: ['useExpandedFeatureLabelsMap', 'ensembl', 'hgnc'],
    queryFn: async () => getTermMapping('ensembl', 'hgnc'),
  });
  const { data: fetchedMapping, status, isFetching } = termMappingQuery;

  const updatedFeatureLabelsMap = useMemo(() => {
    if (!fetchedMapping) return featureLabelsMap;
    return new Map([
      ...(stripCuriePrefixes
        ? Array.from(fetchedMapping).map(([k, v]) => ([k.split(':')[1], v.split(':')[1]]))
        : fetchedMapping
      ),
      ...(featureLabelsMap || []),
    ]);
  }, [fetchedMapping, featureLabelsMap, stripCuriePrefixes]);
  // If not enabled, return success
  // eslint-disable-next-line no-nested-ternary
  const dataStatus = (enabled
    ? (isFetching ? STATUS.LOADING : status)
    : STATUS.SUCCESS
  );
  return [updatedFeatureLabelsMap, dataStatus];
}

/**
 * Using a loader object's options,
 * return a mapping from group name to column name.
 * @param {*} loader obsSets or sampleSets loader class
 * @param {[boolean]} reverse Optionally, reverse
 * (so, return column name to group name mapping).
 * @returns {Record<string, string>} Mapping from group name to column name.
 */
export function useColumnNameMapping(loader, reverse = false) {
  return useMemo(() => {
    const result = {};
    if (loader?.options) {
      const optionsArray = loader.options.obsSets
        ? loader.options.obsSets
        : loader.options.sampleSets;
      optionsArray.forEach((optionObject) => {
        const { name, path } = optionObject;
        let columnName;
        if (optionObject.column) {
          columnName = optionObject.column;
        } else if (path) {
          columnName = path.split('/').at(-1);
        } else {
          columnName = name;
        }
        result[name] = columnName;
      });
    }
    if (reverse) {
      return Object.fromEntries(
        Object.entries(result)
          .map(([k, v]) => ([v, k])),
      );
    }
    return result;
  }, [loader]);
}
