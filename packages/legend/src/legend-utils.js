import { scaleSequential } from 'd3-scale';
import {
  interpolate,
  quantize,
  interpolateRgb,
  piecewise,
} from 'd3-interpolate';
import { rgb } from 'd3-color';
import colormaps from 'colormap/colorScale.js';

// Reference: https://observablehq.com/@mjmdavis/color-encoding
function getInterpolateFunction(cmap) {
  const colormapData = colormaps[cmap].map(d => d.rgb);
  const colormapRgb = colormapData.map(x => rgb(...x));
  // Perform piecewise interpolation between each color in the range.
  return piecewise(interpolateRgb, colormapRgb);
}

// Reference: https://observablehq.com/@d3/color-legend
function ramp(color, n = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = n;
  canvas.height = 1;
  const context = canvas.getContext('2d');
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}

export function getXlinkHref(cmap) {
  const interpolateFunc = getInterpolateFunction(cmap);
  const color = scaleSequential([0, 100], interpolateFunc);
  let n = 256;
  if (color.domain && color.range) {
    n = Math.min(color.domain().length, color.range().length);
  }
  const xlinkHref = ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL();
  return xlinkHref;
}
