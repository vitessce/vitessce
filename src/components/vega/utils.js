import { useRef, useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import * as vl from 'vega-lite-api';
import * as Vega from 'vega';
import * as VegaLite from 'vega-lite';
import { GRID_RESIZE } from '../../events';

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

export const VEGA_THEMES = {
  dark: {
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
    // The default.
  },
};

export function createVegaLiteApi() {
  vl.register(Vega, VegaLite);
  return vl;
}
