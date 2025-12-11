import { deck } from '@vitessce/gl';
import { clamp } from 'lodash-es';


const BASE_POINT_SIZE = 5;
export const LARGE_DATASET_CELL_COUNT = 10000;
export const SMALL_DATASET_CELL_COUNT = 100;

export const LARGE_DATASET_POINT_SIZE = BASE_POINT_SIZE / LARGE_DATASET_CELL_COUNT;
export const SMALL_DATASET_POINT_SIZE = BASE_POINT_SIZE / SMALL_DATASET_CELL_COUNT;


/**
 * Calculates initial point size based on dataset size.
 * The point size decreases as the number of cells increases to avoid overplotting.
 * The maximum point size is 0.05, for small datasets.
 * The minimum point size is 0.0005, for large datasets.
 * @param {number} numCells
 * @returns {number} Initial point size.
 */
export function getInitialPointSize(numCells = LARGE_DATASET_CELL_COUNT) {
  return BASE_POINT_SIZE / clamp(
    numCells,
    SMALL_DATASET_CELL_COUNT,
    LARGE_DATASET_CELL_COUNT,
  );
}

/**
 * Calculates point size in device pixels based on dataset size and view parameters.
 * Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
 * Reference: https://observablehq.com/@bmschmidt/dot-density-election-maps-with-webgl
 *
 * @param {number} devicePixelRatio The device pixel ratio.
 * @param {number} zoom The current zoom level.
 * @param {number} xRange The range of the x-axis.
 * @param {number} yRange The range of the y-axis.
 * @param {number} width The width of the viewport.
 * @param {number} height The height of the viewport.
 * @param {number} numCells The number of cells in the dataset.
 * @returns {number} Point size in device pixels.
 *
 */
export function getPointSizeDevicePixels(
  devicePixelRatio, zoom, xRange, yRange, width, height, numCells,
) {
  // Smaller datasets get larger point sizes
  const pointSize = getInitialPointSize(numCells);

  // Point size maximum, in screen pixels.
  const pointScreenSizeMax = 10;

  // Point size minimum, in screen pixels.
  const pointScreenSizeMin = 1 / devicePixelRatio;

  const scaleFactor = 2 ** zoom;
  const xAxisRange = 2.0 / ((xRange * scaleFactor) / width);
  const yAxisRange = 2.0 / ((yRange * scaleFactor) / height);

  // The diagonal screen size as a fraction of the current diagonal axis range,
  // then converted to device pixels.
  const diagonalScreenSize = Math.sqrt((width ** 2) + (height ** 2));
  const diagonalAxisRange = Math.sqrt((xAxisRange ** 2) + (yAxisRange ** 2));
  const diagonalFraction = pointSize / diagonalAxisRange;
  const deviceSize = diagonalFraction * diagonalScreenSize;

  const pointSizeDevicePixels = clamp(
    deviceSize,
    pointScreenSizeMin,
    pointScreenSizeMax,
  );
  return pointSizeDevicePixels;
}

/**
 * Calculates point opacity based on dataset size and view parameters.
 * Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
 *
 * @param {*} zoom The current zoom level.
 * @param {number} zoom The current zoom level.
 * @param {number} xRange The range of the x-axis.
 * @param {number} yRange The range of the y-axis.
 * @param {number} width The width of the viewport.
 * @param {number} height The height of the viewport.
 * @param {number} numCells The number of cells in the dataset.
 * @param {number} avgFillDensity Optional average fill density to use instead of calculating one.
 * @returns {number} The calculated point opacity.
 */
export function getPointOpacity(zoom, xRange, yRange, width, height, numCells, avgFillDensity) {
  const N = numCells;
  let minX; let minY; let maxX; let
    maxY;
  try {
    [minX, minY, maxX, maxY] = new deck.OrthographicView({ zoom }).makeViewport({
      height,
      width,
      viewState: { zoom, target: [0, 0, 0] },
    }).getBounds();
  } catch {
    return 1.0;
  }
  const X = maxY - minY;
  const Y = maxX - minX;
  const X0 = xRange;
  const Y0 = yRange;
  const W = width;
  const H = height;

  let rho = avgFillDensity;
  if (!rho) {
    rho = Math.min(1, 1 / (10 ** (Math.log10(N) - 3)));
  }
  // p in the calculation is the pixel length/width of a given point, which for us is 1
  // so it does not factor into our calculation here.
  const alpha = ((rho * W * H) / N) * (Y0 / Y) * (X0 / X);
  const pointOpacity = clamp(alpha, 1.01 / 255, 1.0);
  return pointOpacity;
}
