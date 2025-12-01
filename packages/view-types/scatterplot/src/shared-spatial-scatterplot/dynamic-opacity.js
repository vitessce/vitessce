import { deck } from '@vitessce/gl';
import { clamp } from 'lodash-es';


const LARGE_DATASET_POINT_SIZE = 0.0005; // ~500k cells
const SMALL_DATASET_POINT_SIZE = 0.01; // ~5k cells
const LARGE_DATASET_CELL_COUNT = 500000;
const SMALL_DATASET_CELL_COUNT = 5000;


/**
 * Calculates point size in device pixels based on dataset size and view parameters.
 * Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
 * Reference: https://observablehq.com/@bmschmidt/dot-density-election-maps-with-webgl
 *
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
  // Calculate point size using reverse logarithmic scaling
  // Smaller datasets get larger point sizes
  let pointSize = LARGE_DATASET_POINT_SIZE;
  if (numCells && numCells > 0) {
    const logCells = Math.log10(numCells);
    const logSmall = Math.log10(SMALL_DATASET_CELL_COUNT);
    const logLarge = Math.log10(LARGE_DATASET_CELL_COUNT);
    // Interpolate logarithmically between small and large dataset sizes
    const t = clamp((logCells - logSmall) / (logLarge - logSmall), 0, 1);
    const datasetSizeFactor = (LARGE_DATASET_POINT_SIZE - SMALL_DATASET_POINT_SIZE) * t;
    pointSize = SMALL_DATASET_POINT_SIZE + datasetSizeFactor;
  }

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
