import { viv } from '@vitessce/gl';
import { open as zarrOpen } from 'zarrita';
import { createZarrArrayAdapter } from '@vitessce/zarr-utils';
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
            }
            else {
                labels = axes;
            }
        }
    }
    const data = paths
        .map(path => zarrOpen(root.resolve(path), { kind: 'array' }));
    return {
        data: (await Promise.all(data)),
        rootAttrs,
        labels,
    };
}
export class ZarritaPixelSource extends viv.ZarrPixelSource {
    constructor(arr, labels, tileSize) {
        super(arr, labels, tileSize);
        // We prevent reading chunks directly, since Zarrita does not
        // handle x/y chunk differences the same as zarr.js.
        // TODO: fix this once fixed in either zarrita getChunk or
        // in createZarrArrayAdapter.
        // Reference: https://github.com/hms-dbmi/vizarr/pull/172#issuecomment-1714497516
        // eslint-disable-next-line no-underscore-dangle
        this._readChunks = false;
    }
}
// We use our own loadOmeZarr function (instead of viv.loadOmeZarr)
// to bypass usage of zarr.js which is used in Viv's version.
export async function loadOmeZarr(root) {
    const { data, rootAttrs, labels } = await loadMultiscales(root);
    const tileSize = guessTileSize(data[0]);
    const pyramid = data
        .map(arr => new ZarritaPixelSource(createZarrArrayAdapter(arr), labels, tileSize));
    return {
        data: pyramid,
        metadata: rootAttrs,
    };
}
