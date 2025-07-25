import { describe, it, expect } from 'vitest';
import {
  _initMRMCPT,
  _resolutionStatsToBrickLayout,
  _packPT,
  _ptToZarr,
} from './VolumeDataManager.js';

describe('spatial-accelerated data utils', () => {
  describe('initialization of page table and brick cache', () => {
    it('Can compute brick layout per resolution', () => {
      // TODO: also add test for calculation of brick layout from zarr metadata
      
      const multiResolutionStats = [
        {
          "height": 3181,
          "width": 4045,
          "depth": 194,
        },
        {
          "height": 1590,
          "width": 2022,
          "depth": 194,
        },
        {
          "height": 795,
          "width": 1011,
          "depth": 194,
        },
        {
          "height": 398,
          "width": 506,
          "depth": 194,
        },
        {
          "height": 199,
          "width": 253,
          "depth": 194,
        },
        {
          "height": 99,
          "width": 126,
          "depth": 97,
        },
        {
          "height": 50,
          "width": 63,
          "depth": 48,
        },
        {
          "height": 25,
          "width": 32,
          "depth": 24,
        }
      ];
      const zarrStoreBrickLayout = [
        [ 7, 100, 127 ],
        [ 7, 50, 64 ],
        [ 7, 25, 32 ],
        [ 7, 13, 16 ],
        [ 7, 7, 8 ],
        [ 4, 4, 4 ],
        [ 2, 2, 2 ],
        [ 1, 1, 1 ],
      ];
      const result = _resolutionStatsToBrickLayout(multiResolutionStats);
      expect(result).toEqual(zarrStoreBrickLayout);
    });

    it('Initializes page table based on data extent', () => {
      const zarrStoreBrickLayout = [
        [ 7, 100, 127 ],
        [ 7, 50, 64 ],
        [ 7, 25, 32 ],
        [ 7, 13, 16 ],
        [ 7, 7, 8 ],
        [ 4, 4, 4 ],
        [ 2, 2, 2 ],
        [ 1, 1, 1 ],
      ];
      const channelsZarrMappingsLength = 7;

      const { PT, ptTHREE, bcTHREE } = _initMRMCPT(
        zarrStoreBrickLayout,
        channelsZarrMappingsLength,
      );

      expect(PT).toEqual({
        channelOffsets: [
          [ 0, 0, 1 ],
          [ 0, 1, 0 ],
          [ 0, 1, 1 ],
          [ 1, 0, 0 ],
          [ 1, 0, 1 ],
          [ 1, 1, 0 ],
          [ 1, 1, 1 ]
        ],
        anchors: [
          [ 0, 0, 36 ],
          [ 64, 53, 29 ],
          [ 32, 28, 22 ],
          [ 16, 15, 15 ],
          [ 8, 8, 8 ],
          [ 4, 4, 4 ],
          [ 2, 2, 2 ],
          [ 1, 1, 1 ]
        ],
        offsets: [],
        xExtent: 128,
        yExtent: 103,
        zExtent: 36,
        z0Extent: 7,
        zTotal: 85,
        lowestDataRes: 7
      });

      expect(ptTHREE.isTexture).toEqual(true);
      expect(ptTHREE.source.data.width).toEqual(128);
      expect(ptTHREE.source.data.height).toEqual(103);
      expect(ptTHREE.source.data.depth).toEqual(85);
      expect(ptTHREE.source.data.data).toBeInstanceOf(Uint32Array.__proto__); // Check that Uint32Array
      expect(ptTHREE.source.data.data.length).toEqual(1120640);
      
      expect(bcTHREE.isTexture).toEqual(true);
      expect(bcTHREE.source.data.width).toEqual(2048);
      expect(bcTHREE.source.data.height).toEqual(2048);
      expect(bcTHREE.source.data.depth).toEqual(128);
      expect(bcTHREE.source.data.data).toBeInstanceOf(Uint8Array.__proto__); // Check that Uint8Array
      expect(bcTHREE.source.data.data.length).toEqual(536870912);
    });
  });
  describe('_packPT converts page table properties for a brick into its packed representation', () => {
    it('correctly packs the properties', () => {
      expect(_packPT(0, 80, 1, 0, 0)).toEqual(3223847936);
      expect(_packPT(0, 56, 2, 0, 0)).toEqual(3223062528);
      expect(_packPT(0, 0, 27, 0, 0)).toEqual(3221253120);
      expect(_packPT(0, 111, 61, 0, 0)).toEqual(3224892416);
      expect(_packPT(0, 3, 14, 1, 0)).toEqual(3221305360);
      expect(_packPT(0, 41, 60, 1, 0)).toEqual(3222597648);
    });
  });
  describe('_ptToZarr returns the channel, resolution, and xyz coordinates for a page table coordinate', () => {
    it('correctly converts page table coordinates to image pyramid chunk keys', () => {
      const ptInfo = {
        PT_zExtent: 36,
        PT_z0Extent: 7,
        PT_anchors: [
          [0, 0, 36],
          [64, 53, 29],
          [32, 28, 22],
          [16, 15, 15],
          [8, 8, 8],
          [4, 4, 4],
          [2, 2, 2],
          [1, 1, 1]
        ],
      };
      expect(_ptToZarr(4, 1, 13, ptInfo)).toEqual({ channel: 0, resolution: 4, x: 4, y: 1, z: 5 });
      expect(_ptToZarr(7, 1, 14, ptInfo)).toEqual({ channel: 0, resolution: 4, x: 7, y: 1, z: 6 });
      expect(_ptToZarr(2, 1, 4, ptInfo)).toEqual({ channel: 0, resolution: 5, x: 2, y: 1, z: 0 });
      expect(_ptToZarr(0, 4, 14, ptInfo)).toEqual({ channel: 0, resolution: 4, x: 0, y: 4, z: 6 });
    })
  })
});
