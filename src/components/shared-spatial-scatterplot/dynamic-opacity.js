import clamp from 'lodash/clamp';

// Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
// Reference: https://observablehq.com/@bmschmidt/dot-density-election-maps-with-webgl
export function getPointSizeDevicePixels(devicePixelRatio, zoom, xRange, yRange, width, height) {
  // Size of a point, in units of the diagonal axis.
  const pointSize = 0.001;
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

// Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
// Reference: https://observablehq.com/@bmschmidt/dot-density-election-maps-with-webgl
export function getPointOpacity(zoom, width, height, numCells, avgFillDensity) {
  const scaleFactor = 2 ** zoom;

  const W = width;
  const H = height;
  const N = numCells;

  let targetShare = avgFillDensity;
  if (!targetShare) {
    targetShare = Math.min(1, 1 / (10 ** (Math.log10(N) - 3)));
  }

  const fractionOfTotalVisible = 1 / (scaleFactor ** 2);
  const pixelArea = W * H;
  const totalPoints = N;
  const alpha = (
    (targetShare / 50) * pixelArea
    / (totalPoints * (Math.exp(Math.log(scaleFactor) * 0.35) ** 2))
  ) / fractionOfTotalVisible;

  const pointOpacity = clamp(alpha, 1.01 / 255, 1.0);
  return pointOpacity;
}
