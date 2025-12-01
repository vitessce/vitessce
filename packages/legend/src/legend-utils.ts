import { scaleSequential } from 'd3-scale';
import {
  interpolate,
  quantize,
  interpolateRgb,
  piecewise,
} from 'd3-interpolate';
import { rgb } from 'd3-color';
// We import directly from the colorScale.js file because
// it is not re-exported from the main entrypoint of the package.
// Reference: https://github.com/bpostlethwaite/colormap/blob/34061829844afb7cbd509d3c3f36625b283191eb/index.js#L11
// @ts-expect-error - colormap package does not have type definitions
import colormaps from 'colormap/colorScale.js';

/**
 * Get an interpolation function for a colormap.
 * Reference: https://observablehq.com/@mjmdavis/color-encoding
 */
export function getInterpolateFunction(cmap: string): (t: number) => string {
  const colormapData = colormaps[cmap].map((d: { rgb: number[] }) => d.rgb);
  const colormapRgb = colormapData.map((x: number[]) => rgb(...(x as [number, number, number])));
  // Perform piecewise interpolation between each color in the range.
  return piecewise(interpolateRgb, colormapRgb) as (t: number) => string;
}

/**
 * Create a canvas element with a color ramp.
 * Reference: https://observablehq.com/@d3/color-legend
 */
function ramp(color: (t: number) => string, n = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = n;
  canvas.height = 1;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get 2d context from canvas');
  }
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}

/**
 * Get a data URL for a colormap image.
 */
export function getXlinkHref(cmap: string): string {
  const interpolateFunc = getInterpolateFunction(cmap);
  const color = scaleSequential([0, 100], interpolateFunc);
  let n = 256;
  if (color.domain && color.range) {
    n = Math.min(color.domain().length, color.range().length);
  }
  const xlinkHref = ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL();
  return xlinkHref;
}
