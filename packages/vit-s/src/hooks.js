import {
  useRef, useState, useEffect, useCallback, useMemo,
} from 'react';
import debounce from 'lodash/debounce';
import every from 'lodash/every';
import { capitalize, fromEntries } from '@vitessce/utils';
import { useGridResize, useEmitGridResize } from './state/hooks';
import { VITESSCE_CONTAINER } from './classNames';

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
  return useMemo(
    () => every(
      statusValues,
      val => val === 'success',
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ),
    statusValues,
  );
}

/**
 * This hook helps manage a list of URLs.
 * @param {object} loaders The loaders dependency.
 * @param {string} dataset The dataset UID dependency.
 * @returns {array} An array
 * [urls, addUrl]
 * where urls is the array of URL objects,
 * and addUrl is a function for adding a URL to the array.
 */
export function useUrls(loaders, dataset) {
  const [urls, setUrls] = useState([]);

  const addUrl = useCallback(
    (url, name) => {
      if (url) {
        setUrls(prev => [...prev, { url, name }]);
      }
    },
    [setUrls],
  );

  useEffect(() => {
    setUrls([]);
  }, [loaders, dataset]);

  return [urls, addUrl];
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
        const { clientHeight: componentHeight, clientWidth: componentWidth } = ref.current.closest(`.${VITESSCE_CONTAINER}`);
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

export function useExpressionValueGetter({
  instanceObsIndex,
  matrixObsIndex,
  expressionData,
}) {
  // Get a mapping from cell ID to row index in the gene expression matrix.
  // Since the two obsIndices (instanceObsIndex = the obsIndex from obsEmbedding)
  // may be ordered differently (matrixObsIndex = the obsIndex from obsFeatureMatrix),
  // we need a way to look up an obsFeatureMatrix obsIndex index
  // given an obsEmbedding obsIndex index.
  const toMatrixIndexMap = useMemo(() => {
    if (instanceObsIndex && matrixObsIndex) {
      const matrixIndexMap = new Map(matrixObsIndex.map((key, i) => [key, i]));
      return instanceObsIndex.map(key => matrixIndexMap.get(key));
    }
    return null;
  }, [instanceObsIndex, matrixObsIndex]);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useCallback(
    (entry, { index: instanceIndex }) => {
      if (toMatrixIndexMap && expressionData && expressionData[0]) {
        const rowIndex = toMatrixIndexMap[instanceIndex];
        const val = expressionData[0][rowIndex];
        return val;
      }
      return 0;
    },
    [toMatrixIndexMap, expressionData],
  );
  return getExpressionValue;
}

export function useGetObsInfo(
  obsType,
  obsLabelsTypes,
  obsLabelsData,
  obsSetsMembership,
) {
  return useCallback(
    (obsId) => {
      if (obsId) {
        const obsMembership = obsSetsMembership?.get(obsId) || [];
        return {
          [`${capitalize(obsType)} ID`]: obsId,
          ...fromEntries(
            obsMembership.flatMap(path => path
              .slice(1)
              .map((pathEl, elLevel) => [
                `${path[0]}${path.length > 2 ? ` L${elLevel + 1}` : ''}`,
                pathEl,
              ])),
          ),
          ...fromEntries(
            Object.entries(obsLabelsTypes)
              .map(([scopeKey, obsLabelsType]) => [
                obsLabelsType,
                obsLabelsData?.[scopeKey]?.obsLabels?.[
                  // TODO: Maybe all loaders that return obsIndex should also return an obsIndexMap
                  // with keys: obsId, values: obsIdx
                  // which would avoid the indexOf calls.
                  obsLabelsData?.[scopeKey]?.obsIndex?.indexOf(obsId)
                ],
              ])
              .filter(([obsLabelsType]) => Boolean(obsLabelsType)),
          ),
        };
      }
      return null;
    },
    [obsType, obsLabelsTypes, obsLabelsData, obsSetsMembership],
  );
}
