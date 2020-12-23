import * as vl from 'vega-lite-api';
import * as Vega from 'vega/build-es5/vega';
import * as VegaLite from 'vega-lite/build-es5/vega-lite';

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
