import { describe, it, expect } from 'vitest';
import {
  multiSetsToTextureData,
} from './bitmask-utils.js';

describe('bitmask utils', () => {
  describe('multiSetsToTextureData', () => {
    it('gets all scope names for a particular coordination type', () => {
      const multiFeatureValues = [
        [1, 2, 3, 255, 1000], // 5 expression values, one per cell
        [10, 20, 30], // 3 expression values, one per glomerulus
      ];

      const multiObsIndex = [
        ['1', '2', '3', '4', '5'], // 5 cells
        ['1', '2', '3'], // 3 glomeruli
      ];

      const setColorValues = [
        {
          setColorIndices: (new Map([
            ['4', 0],
            ['5', 1],
            ['2', 1],
            ['3', 2],
          ])),
          setColors: [
            { color: [255, 0, 0] },
            { color: [0, 255, 0] },
            { color: [0, 0, 255] },
          ],
          obsIndex: ['1', '2', '3', '4', '5'],
        },
        {
          setColorIndices: (new Map([
            ['2', 0],
            ['1', 1],
            ['3', 0],
          ])),
          setColors: [
            { color: [255, 255, 255] },
            { color: [0, 0, 0] },
          ],
          obsIndex: ['1', '2', '3'],
        },
      ];

      const channelIsSetColorMode = [
        true,
        false,
      ];

      const [
        totalData,
        valueTexHeight,
        indicesOffsets,
        totalColors,
        colorTexHeight,
        colorsOffsets,
      ] = multiSetsToTextureData(
        multiFeatureValues,
        multiObsIndex,
        setColorValues,
        channelIsSetColorMode,
        10,
      );

      expect(valueTexHeight).toEqual(2);
      expect(colorTexHeight).toEqual(2);
      expect(indicesOffsets).toEqual([0, 5]);
      expect(colorsOffsets).toEqual([0, 3]);
      expect(totalColors.length).toEqual(20);
      expect(totalColors).toEqual(new Uint8Array([
        // Expect colors to be present for only the channels with isSetColorMode.
        255, 0, 0,
        0, 255, 0,
        0, 0, 255,
        // For isSetColorMode = false, expect all zeros.
        0, 0, 0,
        0, 0, 0,
        // Extra values for padding.
        0, 0, 0, 0, 0,
      ]));
      expect(totalData.length).toEqual(20);
      expect(totalData).toEqual(new Uint8Array([
        // For the first channel, expect the indices to be present.
        // Expect one to be added so that zero is the "null" color.
        0, 1 + 1, 1 + 2, 1 + 0, 1 + 1,
        // For the second channel, expect the expression values to be present.
        // Expect the values [10, 20, 30] to be normalized to [0, 127, 255].
        0, 127, 255,
        // Extra values for padding.
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]));
    });
  });
});
