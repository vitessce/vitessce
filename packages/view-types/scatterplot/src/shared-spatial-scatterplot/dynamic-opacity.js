import { deck } from '@vitessce/gl';
import { clamp } from 'lodash-es';

// Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
// Reference: https://observablehq.com/@bmschmidt/dot-density-election-maps-with-webgl
export function getPointSizeDevicePixels(devicePixelRatio, zoom, xRange, yRange, width, height) {
  // Size of a point, in units of the diagonal axis.
  const pointSize = 0.0005;
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
export function getPointOpacity(zoom, xRange, yRange, width, height, numCells, avgFillDensity) {
  const N = numCells;
  const [minX, minY, maxX, maxY] = new deck.OrthographicView({ zoom }).makeViewport({
    height,
    width,
    viewState: { zoom, target: [0, 0, 0] },
  }).getBounds();
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
