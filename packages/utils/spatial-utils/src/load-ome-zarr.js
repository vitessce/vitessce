import { viv } from '@vitessce/gl';
import { open as zarrOpen } from '@zarrita/core';
import { openLru, createZarrArrayAdapter } from '@vitessce/zarr-utils';

function prevPowerOf2(x) {
  return 2 ** Math.floor(Math.log2(x));
}

/*
 * Helper method to determine whether pixel data is interleaved or not.
 * > isInterleaved([1, 24, 24]) === false;
 * > isInterleaved([1, 24, 24, 3]) === true;
 */
function isInterleaved(shape) {
  const lastDimSize = shape[shape.length - 1];
  return lastDimSize === 3 || lastDimSize === 4;
}

export function guessTileSize(arr) {
  const interleaved = isInterleaved(arr.shape);
  const [yChunk, xChunk] = arr.chunks.slice(interleaved ? -3 : -2);
  const size = Math.min(yChunk, xChunk);
  console.log(arr.shape, arr.chunks, size, prevPowerOf2(size));
  // deck.gl requirement for power-of-two tile size.
  return prevPowerOf2(size);
}

function isAxis(axisOrLabel) {
  return typeof axisOrLabel[0] !== 'string';
}

async function loadMultiscales(root) {
  const rootAttrs = (await zarrOpen(root)).attrs;

  let paths = ['0'];
  // Default axes used for v0.1 and v0.2.
  let labels = ['t', 'c', 'z', 'y', 'x'];
  if ('multiscales' in rootAttrs) {
    const { datasets, axes } = rootAttrs.multiscales[0];
    paths = datasets.map(d => d.path);
    if (axes) {
      if (isAxis(axes)) {
        labels = axes.map(axis => axis.name);
      } else {
        labels = axes;
      }
    }
  }

  const data = paths.map(path => zarrOpen(root.resolve(path), { kind: "array" }));
  console.log(data);
  return {
    data: (await Promise.all(data)),
    rootAttrs,
    labels
  };
}
export async function loadOmeZarr(url, requestInit) {
  const root = await openLru(url, requestInit);
  const { data, rootAttrs, labels } = await loadMultiscales(root);
  const tileSize = guessTileSize(data[0]);
  const pyramid = data.map(arr => new viv.ZarrPixelSource(createZarrArrayAdapter(arr), labels, tileSize));
  return {
    data: pyramid,
    metadata: rootAttrs
  };

}