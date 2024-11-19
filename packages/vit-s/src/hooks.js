import {
  useRef, useState, useEffect, useCallback, useMemo,
} from 'react';
import { debounce, every } from 'lodash-es';
import { extent } from 'd3-array';
import { capitalize } from '@vitessce/utils';
import { STATUS } from '@vitessce/constants-internal';
import { useGridResize, useEmitGridResize, useSetWarning } from './state/hooks.js';
import { VITESSCE_CONTAINER } from './classNames.js';


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
 * For datasets, with only ensembile gene ids (e.g. ["ENSG00000123456.1", "ENSG00000987654.2"]),
 * this hook maps a given `geneObject` to their corresponding
 * gene symbols using a gene mapping dataset.
 *
 * @param {string[]|Object} geneObject
 *      - An array of gene strings, or object containing genes as keys
 * @param {Object|undefined} featureMap
 *      - An optional feature map. If provided, the `geneObject` is returned unchanged.
 *
 * @returns {string[]|Object}
 *      - Mapped Gene List or object
 *
 * @example
 * // Example with an array of gene strings (featureList):
 * const geneObject = ["ENSG00000123456.1", "ENSG00000987654.2"];
 * // Example with an object of genes, used in the tooltip:
 * const geneObject = {
 *   "Gene ID": "ENSG00000123456.1",
 *   "Cell ID": "Cell1234",
 *   "Marker Gene": "ENSG00000987654.2"
 * };
 */

export const useMappedGeneList = (geneObject, featureMap) => {
  const setWarning = useSetWarning();
  const [mappedGeneList, setMappedGeneList] = useState(geneObject);
  const [fetchedGenesList, setFetchedGenesList] = useState(null);

  useEffect(() => {
    // Assuming featureMap is set for symbolic genes
    if (featureMap !== undefined) {
      setMappedGeneList(geneObject);
      return;
    }
    const isEnsembleGene = value => value?.toUpperCase().startsWith('ENSG');
    const isGeneKey = key => key.toLowerCase().includes('gene');
    const ensbGenes = Array.isArray(geneObject)
      ? geneObject?.some(isEnsembleGene)
      : geneObject && Object.entries(geneObject)?.some(([key, value]) => isGeneKey(key)
              && isEnsembleGene(value));
    if (!ensbGenes) return;

    const fetchGeneData = async () => {
      const controller = new AbortController();
      const { signal } = controller;

      try {
        const response = await fetch('https://vitessce-resources.s3.us-east-2.amazonaws.com/genes_filtered.json', { signal });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFetchedGenesList(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setWarning(err.message);
        }
      }

      return () => controller.abort();
    };

    fetchGeneData();
  }, [geneObject, featureMap]);

  useEffect(() => {
    if (!fetchedGenesList || featureMap !== undefined) return;

    const mapGenes = () => {
      const isEnsembleGene = value => value?.toUpperCase().startsWith('ENSG');
      const isGeneKey = key => key.toLowerCase().includes('gene');

      let updatedGeneObject = { ...geneObject };

      if (Array.isArray(geneObject)) {
        updatedGeneObject = geneObject
          .map((gene) => {
            if (isEnsembleGene(gene)) {
              const trimmedValue = gene.split('.')[0]; // Trim after the dot
              return fetchedGenesList[trimmedValue];
            }
            return null;
          })
          .filter(Boolean);
      } else {
        Object.entries(geneObject).forEach(([key, value]) => {
          if (isGeneKey(key) && isEnsembleGene(value)) {
            const trimmedValue = value.split('.')[0];
            updatedGeneObject[key] = fetchedGenesList[trimmedValue];
          }
        });
      }

      setMappedGeneList(updatedGeneObject);
    };

    mapGenes();
  }, [fetchedGenesList, geneObject, featureMap]);

  return mappedGeneList;
};
