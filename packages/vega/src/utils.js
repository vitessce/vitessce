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
