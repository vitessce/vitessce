import { expose } from 'comlink';
import { Uint64 } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/util/uint64';
import { Uint64Set } from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/uint64_set';
// import * as actual from '@janelia-flyem/neuroglancer/dist/module/neuroglancer/uint64_set.js';
// console.log(Object.keys(actual));
// Main function
function getSegmentColorMapping({ cellIds, cellColorMapping }) {
  const visibleSegments = new Uint64Set();
  const segmentColorHash = new Map();

  for (const cellId of cellIds) {
    const uint64 = Uint64.parseString(cellId);
    visibleSegments.add(uint64);

    const hexOrRgb = cellColorMapping[cellId];
    let rgb;

    if (typeof hexOrRgb === 'string') {
      // Convert hex string → RGB array
      const bigint = parseInt(hexOrRgb.slice(1), 16);
      rgb = [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255
      ];
    } else {
      rgb = hexOrRgb;
    }

    const rgbNormalized = rgb.map(x => x / 255);
    segmentColorHash.set(uint64, rgbNormalized);
  }

  return { visibleSegments, segmentColorHash };
}

expose({ getSegmentColorMapping });
