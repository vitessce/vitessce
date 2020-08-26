import {
  useRef, useState, useEffect, useCallback,
} from 'react';
// eslint-disable-next-line vitessce-rules/prevent-pubsub-import
import PubSub from 'pubsub-js';
import debounce from 'lodash/debounce';
import { GRID_RESIZE } from '../events';

/**
 * Custom hook, subscribes to GRID_RESIZE and window resize events.
 * @returns {array} `[width, height, containerRef]` where width and height
 * are numbers and containerRef is a React ref.
 */
export function useGridItemSize() {
  const containerRef = useRef();

  const [height, setHeight] = useState();
  const [width, setWidth] = useState();

  useEffect(() => {
    function onResize() {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      setHeight(containerRect.height);
      setWidth(containerRect.width);
    }
    const onResizeDebounced = debounce(onResize, 100, { trailing: true });
    const gridResizeToken = PubSub.subscribe(GRID_RESIZE, onResize);
    window.addEventListener('resize', onResizeDebounced);
    onResize();
    return () => {
      PubSub.unsubscribe(gridResizeToken);
      window.removeEventListener('resize', onResizeDebounced);
    };
  }, []);

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

  useEffect(() => {
    function onResize() {
      if (!deckRef.current) return;
      const { canvas } = deckRef.current.deck;
      const canvasRect = canvas.getBoundingClientRect();
      setHeight(canvasRect.height);
      setWidth(canvasRect.width);
    }
    const onResizeDebounced = debounce(onResize, 100, { trailing: true });
    const gridResizeToken = PubSub.subscribe(GRID_RESIZE, onResize);
    window.addEventListener('resize', onResizeDebounced);
    onResize();
    return () => {
      PubSub.unsubscribe(gridResizeToken);
      window.removeEventListener('resize', onResizeDebounced);
    };
  }, []);

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
 * [isReady, setItemIsReady, resetReadyItems]
 * where isReady is the boolean value,
 * setItemIsReady marks one item as ready,
 * and resetReadyItem marks all items as waiting.
 */
export function useReady(supportedItems) {
  const items = supportedItems;
  const [waiting, setWaiting] = useState(items);

  const setItemIsReady = useCallback((readyItem) => {
    setWaiting((waitingItems) => {
      const nextWaitingItems = waitingItems.filter(item => item !== readyItem);
      console.warn(`cleared ${readyItem}; waiting on ${nextWaitingItems.length}: ${JSON.stringify(nextWaitingItems)}`);
      return nextWaitingItems;
    });
  }, [setWaiting]);

  const resetReadyItems = useCallback(() => {
    setWaiting(items);
    console.warn(`waiting on ${items.length}: ${JSON.stringify(items)}`);
  }, [setWaiting, items]);

  const isReady = waiting.length === 0;

  return [isReady, setItemIsReady, resetReadyItems];
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
