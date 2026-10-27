import { describe, it, expect } from 'vitest';
import { isEqual } from 'lodash-es';
import {
  _initMRMCPT,
  _resolutionStatsToBrickLayout,
  _packPT,
  _ptToZarr,
  _requestBufferToRequestObjects,
  _getVoxelSpacing,
  _zarrToPt,
  VolumeDataManager,
} from './VolumeDataManager.js';

describe('spatial-accelerated data utils', () => {
  describe('_getVoxelSpacing', () => {
    const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    it('uses the root-level scale of the converter datasets', () => {
      // kingsnake: datasets[0] scale is 1, root-level scale doubles Z.
      expect(_getVoxelSpacing(identity, {
        coordinateTransformations: [{ type: 'scale', scale: [1, 1, 2, 1, 1] }],
      })).toEqual([2, 1, 1]);
      // f8ii, melanoma
      expect(_getVoxelSpacing(identity, {
        coordinateTransformations: [{ type: 'scale', scale: [1, 1, 0.28, 0.14, 0.14] }],
      })).toEqual([0.28, 0.14, 0.14]);
    });
    it('uses the model matrix for NGFF dataset scales', () => {
      // idr0101A: datasets[0] scale in micrometers, no root-level transform.
      const matrix = [0.108335, 0, 0, 0, 0, 0.108335, 0, 0, 0, 0, 0.4, 0, 0, 0, 0, 1];
      expect(_getVoxelSpacing(matrix, {})).toEqual([0.4, 0.108335, 0.108335]);
      expect(_getVoxelSpacing(identity, {})).toEqual([1, 1, 1]);
    });
  });

  describe('initialization of page table and brick cache', () => {
    it('Can compute brick layout per resolution', () => {
      // TODO: also add test for calculation of brick layout from zarr metadata

      const multiResolutionStats = [
        {
          height: 3181,
          width: 4045,
          depth: 194,
        },
        {
          height: 1590,
          width: 2022,
          depth: 194,
        },
        {
          height: 795,
          width: 1011,
          depth: 194,
        },
        {
          height: 398,
          width: 506,
          depth: 194,
        },
        {
          height: 199,
          width: 253,
          depth: 194,
        },
        {
          height: 99,
          width: 126,
          depth: 97,
        },
        {
          height: 50,
          width: 63,
          depth: 48,
        },
        {
          height: 25,
          width: 32,
          depth: 24,
        },
      ];
      const zarrStoreBrickLayout = [
        [7, 100, 127],
        [7, 50, 64],
        [7, 25, 32],
        [7, 13, 16],
        [7, 7, 8],
        [4, 4, 4],
        [2, 2, 2],
        [1, 1, 1],
      ];
      const result = _resolutionStatsToBrickLayout(multiResolutionStats);
      expect(result).toEqual(zarrStoreBrickLayout);
    });

    it('Initializes page table based on data extent', () => {
      const zarrStoreBrickLayout = [
        [7, 100, 127],
        [7, 50, 64],
        [7, 25, 32],
        [7, 13, 16],
        [7, 7, 8],
        [4, 4, 4],
        [2, 2, 2],
        [1, 1, 1],
      ];
      const channelsZarrMappingsLength = 7;

      const { PT, ptTHREE, bcTHREE } = _initMRMCPT(
        zarrStoreBrickLayout,
        channelsZarrMappingsLength,
      );

      expect(PT).toEqual({
        channelOffsets: [
          [0, 0, 1],
          [0, 1, 0],
          [0, 1, 1],
          [1, 0, 0],
          [1, 0, 1],
          [1, 1, 0],
          [1, 1, 1],
        ],
        anchors: [
          [0, 0, 36],
          [64, 53, 29],
          [32, 28, 22],
          [16, 15, 15],
          [8, 8, 8],
          [4, 4, 4],
          [2, 2, 2],
          [1, 1, 1],
        ],
        offsets: [],
        xExtent: 128,
        yExtent: 103,
        zExtent: 36,
        z0Extent: 7,
        zTotal: 85,
        lowestDataRes: 7,
      });

      expect(ptTHREE.isTexture).toEqual(true);
      expect(ptTHREE.source.data.width).toEqual(128);
      expect(ptTHREE.source.data.height).toEqual(103);
      expect(ptTHREE.source.data.depth).toEqual(85);
      expect(ptTHREE.source.data.data).toBeInstanceOf(Uint32Array);
      expect(ptTHREE.source.data.data.length).toEqual(1120640);

      expect(bcTHREE.isTexture).toEqual(true);
      expect(bcTHREE.source.data.width).toEqual(2048);
      expect(bcTHREE.source.data.height).toEqual(2048);
      expect(bcTHREE.source.data.depth).toEqual(128);
      expect(bcTHREE.source.data.data).toBeInstanceOf(Uint8Array);
      expect(bcTHREE.source.data.data.length).toEqual(536870912);
    });

    it.each([
      ['f8ii', [[7, 100, 127], [7, 50, 64], [7, 25, 32], [7, 13, 16], [7, 7, 8], [4, 4, 4], [2, 2, 2], [1, 1, 1]]],
      ['idr0062A logical levels', [[8, 9, 9], [8, 5, 5], [4, 3, 3]]],
      ['XY-only, Z not reduced', [[2, 64, 64], [2, 32, 32], [2, 16, 16], [2, 8, 8], [2, 4, 4], [2, 2, 2]]],
    ])('Places every brick of every channel uniquely and decodes it (%s)', (name, layout) => {
      const channelCount = 7;
      const { PT } = _initMRMCPT(layout, channelCount);
      const ptInfo = { PT_zExtent: PT.zExtent, PT_z0Extent: PT.z0Extent, PT_anchors: PT.anchors };
      const seen = new Set();
      const failures = [];
      layout.forEach(([zBricks, yBricks, xBricks], resolution) => {
        for (let channel = 0; channel < channelCount; channel++) {
          for (let z = 0; z < zBricks; z++) {
            for (let y = 0; y < yBricks; y++) {
              for (let x = 0; x < xBricks; x++) {
                const { x: ptx, y: pty, z: ptz } = _zarrToPt(channel, resolution, x, y, z, PT);
                const key = ptx + PT.xExtent * (pty + PT.yExtent * ptz);
                const decoded = _ptToZarr(ptx, pty, ptz, ptInfo);
                if (ptx >= PT.xExtent || pty >= PT.yExtent || ptz >= PT.zTotal || seen.has(key)
                  || !isEqual(decoded, { channel, resolution, x, y, z })) {
                  failures.push({ resolution, channel, x, y, z, decoded });
                }
                seen.add(key);
              }
            }
          }
        }
      });
      expect(failures.slice(0, 3)).toEqual([]);
    });

    it('requests the one-brick overview of every mapped channel at its channel mask', () => {
      // idr0062A logical levels plus the one-brick overview.
      const brickLayout = [[8, 9, 9], [8, 5, 5], [4, 3, 3], [1, 1, 1]];
      const { PT } = _initMRMCPT(brickLayout, 3);
      const manager = {
        zarrStore: { brickLayout },
        channels: { zarrMappings: [0, undefined, 1] },
        overviewBricks: new Map([[2, [5]]]), // slot 2 already has its overview
        PT,
      };
      // eslint-disable-next-line no-underscore-dangle
      const overviewRequests = () => VolumeDataManager.prototype._overviewRequests.call(manager);
      // The coarsest level is anchored at [1, 1, 1], so each slot sits at its channel mask.
      expect(overviewRequests()).toEqual([{ x: 0, y: 0, z: 1 }]); // slot 0: 001
      manager.overviewBricks.clear();
      // slot 2: 011
      expect(overviewRequests()).toEqual([{ x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }]);
    });
  });
  describe('_packPT packs page table properties for a brick', () => {
    it('correctly packs the properties', () => {
      expect(_packPT(0, 80, 1, 0, 0)).toEqual(3223847936);
      expect(_packPT(0, 56, 2, 0, 0)).toEqual(3223062528);
      expect(_packPT(0, 0, 27, 0, 0)).toEqual(3221253120);
      expect(_packPT(0, 111, 61, 0, 0)).toEqual(3224892416);
      expect(_packPT(0, 3, 14, 1, 0)).toEqual(3221305360);
      expect(_packPT(0, 41, 60, 1, 0)).toEqual(3222597648);
    });
  });
  describe('_ptToZarr returns channel, res., xyz coordinates for a page table coord.', () => {
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
          [1, 1, 1],
        ],
      };
      expect(_ptToZarr(4, 1, 13, ptInfo)).toEqual({ channel: 0, resolution: 4, x: 4, y: 1, z: 5 });
      expect(_ptToZarr(7, 1, 14, ptInfo)).toEqual({ channel: 0, resolution: 4, x: 7, y: 1, z: 6 });
      expect(_ptToZarr(2, 1, 4, ptInfo)).toEqual({ channel: 0, resolution: 5, x: 2, y: 1, z: 0 });
      expect(_ptToZarr(0, 4, 14, ptInfo)).toEqual({ channel: 0, resolution: 4, x: 0, y: 4, z: 6 });
    });
  });
  describe('_requestBufferToRequestObjects', () => {
    it('correctly converts a buffer to request objects without optsForWeighting', () => {
      const buffer = new Uint8Array([
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 128, 16, 13,
        0, 0, 0, 0,
      ]);
      const k = 40;
      const { requests: result } = _requestBufferToRequestObjects(buffer, k, {
        width: undefined,
        height: undefined,
        sigmaNormalized: undefined,
      });
      expect(result).toEqual([
        { x: 2, y: 1, z: 13 },
      ]);
    });
    it('correctly converts a buffer to request objects with optsForWeighting', () => {
      const buffer = new Uint8Array([
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 128, 16, 13,
        0, 0, 0, 0,
      ]);
      const k = 40;
      const { requests: result } = _requestBufferToRequestObjects(buffer, k, {
        width: 1,
        height: 1,
        sigmaNormalized: 0.25,
      });
      expect(result).toEqual([
        { x: 2, y: 1, z: 13 },
      ]);
    });
  });
});
