import { useRef, useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import * as vl from 'vega-lite-api';
import * as Vega from 'vega';
import * as VegaLite from 'vega-lite';
import { GRID_RESIZE } from '../../events';

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
      const containerRect = containerRef.current.getBoundingClientRect();
      setHeight(containerRect.height);
      setWidth(containerRect.width);
    }
    const gridResizeToken = PubSub.subscribe(GRID_RESIZE, onResize);
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      PubSub.unsubscribe(gridResizeToken);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return [width, height, containerRef];
}

/**
 * Vega-Lite themes that can be passed to the `config` property
 * of the vega-lite spec.
 */
export const VEGA_THEMES = {
  dark: {
    // The vega-themes dark theme.
    // Reference: https://github.com/vega/vega-themes/blob/master/src/theme-dark.ts
    background: null,

    title: { color: '#fff' },

    style: {
      'guide-label': {
        fill: '#fff',
      },
      'guide-title': {
        fill: '#fff',
      },
    },

    axis: {
      domainColor: '#fff',
      gridColor: '#888',
      tickColor: '#fff',
    },
  },
  light: {
    // The default vega theme.
    background: null,
  },
};

/**
 * Get a `vl` Vega-Lite API object.
 * @returns {object} The Vega-Lite API object, configured
 * by registering the Vega and Vega-Lite libraries.
 */
export function createVegaLiteApi() {
  vl.register(Vega, VegaLite);
  return vl;
}
