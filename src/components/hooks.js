/* eslint-disable */
import {
  useRef, useState, useEffect, useCallback, useMemo,
} from 'react';
import debounce from 'lodash/debounce';
import { useGridResize, useEmitGridResize } from '../app/state/hooks';
import { VITESSCE_CONTAINER } from './classNames';
import every from 'lodash/every';

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
 * @param {string[]} items The items to wait on.
 * Should be defined as a constant
 * (outside a function component / render function),
 * otherwise strange bugs may occur.
 * @returns {array} An array
 * [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems]
 * where isReady is the boolean value,
 * setItemIsReady marks one item as ready,
 * setItemIsNotReady marks one item as not ready,
 * and resetReadyItem marks all items as waiting.
 */
export function useReady(statusValues) {

  const setItemIsReady = useCallback((readyItem) => {
    console.log(`cleared ${readyItem}`);
  }, []);

  const setItemIsNotReady = useCallback((notReadyItem) => {

  }, []);

  const resetReadyItems = useCallback(() => {
   
  }, []);

  const isReady = useMemo(() => {
    return every(statusValues, val => val === 'success');
  }, statusValues);

  return [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems];
}

/**
 * This hook manages a list of URLs,
 * with adding and resetting helpers.
 * @returns {array} An array
 * [urls, addUrl, resetUrls]
 * where urls is the array of URL objects,
 * addUrl is a function for adding a URL to the array,
 * resetUrls is a function that clears the array.
 */
export function useUrls() {
  const [urls, setUrls] = useState([]);

  const addUrl = useCallback((url, name) => {
    if (url) {
      setUrls(prev => ([...prev, { url, name }]));
    }
  }, [setUrls]);

  const resetUrls = useCallback(() => {
    setUrls([]);
  }, [setUrls]);

  return [urls, addUrl, resetUrls];
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
        } = ref.current.closest('.vitessce-container');
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

export function useExpressionValueGetter({ attrs, expressionData }) {
  // Get a mapping from cell ID to row index in the gene expression matrix.
  const cellIdMap = useMemo(() => {
    const result = {};
    if (attrs && attrs.rows) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < attrs.rows.length; i++) {
        result[attrs.rows[i]] = i;
      }
    }
    return result;
  }, [attrs]);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useCallback((entry) => {
    if (cellIdMap && expressionData && expressionData[0]) {
      const cellIndex = entry;
      const val = expressionData[0][cellIndex];
      return val;
    }
    return 0;
  }, [cellIdMap, expressionData]);
  return getExpressionValue;
}
