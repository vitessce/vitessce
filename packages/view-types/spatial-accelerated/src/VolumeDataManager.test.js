import { describe, it, expect } from 'vitest';
import { isEqual } from 'lodash-es';
import { planVolumeLevels } from './volume-zarr.js';
import {
  _initMRMCPT,
  _getPageTableLayout,
  _planLevelsWithinPageTable,
  _resolutionStatsToBrickLayout,
  _packPT,
  _ptToZarr,
  _requestBufferToRequestObjects,
  _pixelStride,
  _forEachSampledPixel,
  _groupBySourceChunk,
  _getVoxelSpacing,
  _getDataRange,
  _toUint8,
  _zarrToPt,
  VolumeDataManager,
} from './VolumeDataManager.js';

// idr0062A logical levels: several bricks per level, and level 0 stacked along z.
function createManager() {
  const arrays = [[236, 275, 271], [236, 137, 135], [236, 68, 67]].map(s => ({
    shape: [1, 2, ...s], chunks: [1, 1, 1, s[1], s[2]],
  }));
  const levels = planVolumeLevels({ arrays, labels: ['t', 'c', 'z', 'y', 'x'] });
  const brickLayout = levels.map(l => l.shape.map(n => Math.ceil(n / 32)));
  const { PT } = _initMRMCPT(brickLayout, 2);
  const writes = [];
  const gl = {
    getParameter: () => 2048,
    TEXTURE_3D: 1,
    TEXTURE0: 0,
    activeTexture() {},
    bindTexture() {},
    isContextLost: () => false,
    texSubImage3D: (target, level, x, y, z, w, h, d) => writes.push({ x, y, z, w, h, d }),
  };
  const manager = new VolumeDataManager(gl);
  manager.renderer = { properties: { get: () => ({}) } };
  manager.ptTHREE = {};
  manager.PT = PT;
  manager.zarrStore.resolutions = brickLayout.length;
  manager.zarrStore.brickLayout = brickLayout;
  manager.channels.zarrMappings = [0, 1];
  return { manager, writes, brickLayout, PT };
}

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
        overviewAttempts: new Map(),
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
  describe('_planLevelsWithinPageTable', () => {
    const labels = ['c', 'z', 'y', 'x'];
    // XY-only halving pyramid with one-plane chunks, like idr0048A 9846152.
    const pyramid = (depth, height, width, count) => Array.from({ length: count }, (_, i) => ({
      shape: [3, depth, Math.ceil(height / (2 ** i)), Math.ceil(width / (2 ** i))],
      chunks: [1, 1, 1024, 1024],
    }));
    const extentsOf = (levels) => {
      const brickLayout = levels.map(l => l.shape.map(n => Math.ceil(n / 32)));
      const { xExtent, yExtent, zTotal } = _getPageTableLayout(brickLayout, 3);
      return [xExtent, yExtent, zTotal];
    };

    it('keeps every level when the page table fits (idr0048A 9846152)', () => {
      const arrays = pyramid(91, 13350, 19120, 9);
      const { levels, firstSource, spacing } = _planLevelsWithinPageTable({
        arrays, labels, channelCount: 3,
      });
      expect(firstSource).toBe(0);
      expect(spacing).toEqual([1, 1, 1]);
      expect(levels).toEqual(planVolumeLevels({ arrays, labels }));
      expect(extentsOf(levels)).toEqual([602, 423, 27]);
    });

    it('drops the finest levels of an image wider than requests can address', () => {
      // 40000 voxels is 1250 bricks; request coordinates have 10 bits for x and y.
      const arrays = pyramid(64, 30000, 40000, 6);
      const {
        levels, arrays: planned, firstSource, spacing,
      } = _planLevelsWithinPageTable({
        arrays, labels, spacing: [2, 0.5, 0.5], channelCount: 3,
      });
      expect(firstSource).toBe(1);
      expect(planned).toEqual(arrays.slice(1));
      expect(levels[0]).toMatchObject({ source: 0, zFactor: 1, shape: [64, 15000, 20000] });
      // Level 0 is now source 1, with twice the XY voxel size: same physical extent.
      expect(spacing).toEqual([2, 1, 1]);
      expect(levels[0].shape.map((size, axis) => size * spacing[axis]))
        .toEqual([128, 15000, 20000]);
      extentsOf(levels).forEach((extent, axis) => {
        expect(extent).toBeLessThanOrEqual([1024, 1024, 4096][axis]);
      });
    });

    it('also respects the GPU 3D texture size', () => {
      const arrays = pyramid(91, 13350, 19120, 9);
      const { levels, firstSource } = _planLevelsWithinPageTable({
        arrays, labels, channelCount: 3, max3DTextureSize: 256,
      });
      expect(firstSource).toBe(2);
      expect(Math.max(...extentsOf(levels))).toBeLessThanOrEqual(256);
    });

    it('rejects an image whose coarsest level does not fit', () => {
      expect(() => _planLevelsWithinPageTable({
        arrays: pyramid(32, 40000, 40000, 1), labels, channelCount: 3,
      })).toThrow(/page table/);
    });
  });

  describe('switching the channel of a page table slot', () => {
    it('_purgeChannel clears exactly the page table entries of its slot', () => {
      const { manager, writes, brickLayout, PT } = createManager();
      // eslint-disable-next-line no-underscore-dangle
      manager._purgeChannel(1);
      const cleared = new Set();
      writes.forEach(({ x, y, z, w, h, d }) => {
        for (let k = 0; k < d; k++) {
          for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) cleared.add(`${x + i},${y + j},${z + k}`);
          }
        }
      });
      const slotEntries = slot => brickLayout.flatMap(([zBricks, yBricks, xBricks], r) => {
        const keys = [];
        for (let z = 0; z < zBricks; z++) {
          for (let y = 0; y < yBricks; y++) {
            for (let x = 0; x < xBricks; x++) {
              const pt = _zarrToPt(slot, r, x, y, z, PT);
              keys.push(`${pt.x},${pt.y},${pt.z}`);
            }
          }
        }
        return keys;
      });
      expect(slotEntries(1).filter(key => !cleared.has(key))).toHaveLength(0); // none missed
      expect(slotEntries(0).filter(key => cleared.has(key))).toHaveLength(0); // other slot intact
      expect(writes.filter(({ x, y, z, w, h, d }) => x + w > PT.xExtent
        || y + h > PT.yExtent || z + d > PT.zTotal)).toHaveLength(0);
    });

    it('maps the new channel when all slots are in use', () => {
      const { manager } = createManager();
      // Both slots are used; channel 5 replaces channel 1, which is no longer requested.
      manager.updateChannels({ A: { spatialTargetC: 0 }, B: { spatialTargetC: 5 } });
      expect(manager.channels.zarrMappings).toEqual([0, 5]);
    });
  });

  describe('uint8 storage range of other dtypes', () => {
    it('_toUint8 maps [min, max] to 0-255, clamping, with NaN as 0', () => {
      expect(Array.from(_toUint8(new Uint16Array([0, 50, 800, 900]), 50, 800)))
        .toEqual([0, 0, 255, 255]);
      expect(Array.from(_toUint8(new Float32Array([0, 33, 66, NaN, -1]), 0, 66)))
        .toEqual([0, 127, 255, 0, 0]);
    });

    it('_getDataRange ignores NaN and widens a constant range', () => {
      expect(_getDataRange(new Float32Array([NaN, 2.5, 7, NaN]))).toEqual([2.5, 7]);
      expect(_getDataRange(new Float32Array([3, 3]))).toEqual([3, 4]);
      expect(_getDataRange(new Float32Array([NaN]))).toEqual([0, 1]);
    });

    it('_getStorageRange prefers the recorded sample range, then the OMERO window', () => {
      // eslint-disable-next-line no-underscore-dangle
      const storageRange = manager => VolumeDataManager.prototype._getStorageRange.call(manager, 1);
      const omero = { channels: [{}, { window: { start: 50, end: 800, min: 0, max: 65535 } }] };
      expect(storageRange({ sampleRange: [0, 66], ngffMetadata: { omero } })).toEqual([0, 66]);
      expect(storageRange({ sampleRange: null, ngffMetadata: { omero } })).toEqual([50, 800]);
      expect(storageRange({ sampleRange: null, ngffMetadata: { Pixels: {} } })).toBeUndefined();
    });

    it('takes a float channel range from its overview brick, before any other brick', async () => {
      const { manager, brickLayout, PT } = createManager();
      manager.ngffMetadata = { Pixels: {} }; // OME-TIFF without a recorded range
      manager.sampleRange = null;
      manager.channels.downsampleMin = [undefined, undefined];
      manager.channels.downsampleMax = [undefined, undefined];
      // Float values 0-66, as in LuCa-7color_3x3component_data.ome.tif.
      const data = Float32Array.from({ length: 32 ** 3 }, (_, i) => (i % 67));
      manager.brickSource = { readBrick: async () => ({ data }) };
      const overview = brickLayout.length - 1;
      // A finer brick of channel 1 waits for the channel's overview.
      // eslint-disable-next-line no-underscore-dangle
      expect(await manager._fetchBrick(_zarrToPt(1, 0, 0, 0, 0, PT))).toBeNull();
      // eslint-disable-next-line no-underscore-dangle
      const brick = await manager._fetchBrick(_zarrToPt(1, overview, 0, 0, 0, PT));
      expect(manager.channels.downsampleMin[1]).toBe(0);
      expect(manager.channels.downsampleMax[1]).toBe(66);
      expect(brick.chunk).toBeInstanceOf(Uint8Array);
      expect([brick.min, brick.max]).toEqual([0, 255]);
      // eslint-disable-next-line no-underscore-dangle
      expect(await manager._fetchBrick(_zarrToPt(1, 0, 0, 0, 0, PT))).not.toBeNull();
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

  describe('_forEachSampledPixel', () => {
    it('visits every pixel of a small buffer', () => {
      expect(_pixelStride(1024, 512)).toEqual(1);
      const visited = [];
      _forEachSampledPixel(new Uint8Array(3 * 2 * 4), 3, (i, x, y) => visited.push([i, x, y]));
      expect(visited).toEqual([
        [0, 0, 0], [4, 1, 0], [8, 2, 0],
        [12, 0, 1], [16, 1, 1], [20, 2, 1],
      ]);
    });
    it('samples a grid of a large buffer', () => {
      const [width, height] = [3840, 2160];
      expect(_pixelStride(width, height)).toEqual(4);
      let count = 0;
      _forEachSampledPixel(new Uint8Array(width * height * 4), width, (i, x, y) => {
        expect(i).toEqual((y * width + x) * 4);
        expect([x % 4, y % 4]).toEqual([0, 0]);
        count += 1;
      });
      expect(count).toEqual((width / 4) * (height / 4));
    });
  });

  describe('loading bricks that share source chunks', () => {
    // Bricks of one level and z slab share their chunk, as with one-plane chunks
    // that cover the whole XY extent. Uncached reads take a moment.
    function withBrickSource(manager, { cached = [] } = {}) {
      const ready = new Set(cached);
      const reads = [];
      const keyOf = ({ level, c, bz }) => `${level}:${c}:${bz}`;
      // eslint-disable-next-line no-param-reassign
      manager.brickSource = {
        brickChunkKeys: brick => [keyOf(brick)],
        isChunkCached: key => ready.has(key),
        async readBrick(brick) {
          reads.push(`${brick.level}:${brick.c}:${brick.bz}:${brick.by}:${brick.bx}`);
          if (!ready.has(keyOf(brick))) {
            await new Promise((resolve) => { setTimeout(resolve, 1); });
            ready.add(keyOf(brick));
          }
          return { data: new Uint8Array(32 ** 3).fill(9) };
        },
      };
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      manager._writeBrick = () => true;
      return { reads };
    }

    it('_groupBySourceChunk puts requests for the same chunk next to each other', () => {
      const keys = { a: ['s0'], b: ['s1'], c: ['s0'], d: null, e: ['s1', 's2'] };
      expect(_groupBySourceChunk(['a', 'b', 'c', 'd', 'e'], item => keys[item]))
        .toEqual(['a', 'c', 'b', 'e', 'd']);
    });

    it('fetches cached bricks first, groups the rest by chunk, and skips resident ones', async () => {
      const { manager, PT } = createManager();
      const { reads } = withBrickSource(manager, { cached: ['0:0:2'] });
      const pt = (bx, by, bz) => _zarrToPt(0, 0, bx, by, bz, PT);
      // eslint-disable-next-line prefer-destructuring
      manager.bc2pt[3] = pt(5, 5, 5); // already resident
      const uploaded = await manager.handleBrickRequests([
        pt(0, 0, 0), pt(0, 0, 1), pt(1, 0, 0), pt(0, 0, 2), pt(0, 0, 0), pt(5, 5, 5),
      ]);
      expect(reads).toEqual(['0:0:2:0:0', '0:0:0:0:0', '0:0:0:0:1', '0:0:1:0:0']);
      // Slots are taken per uploaded brick.
      expect(uploaded).toHaveLength(4);
      expect(manager.BCUnusedIndex).toBe(4);
    });

    it('loads overview bricks that failed again, up to three loads per channel', async () => {
      const { manager, brickLayout } = createManager();
      const { reads } = withBrickSource(manager);
      // eslint-disable-next-line no-underscore-dangle
      manager._writeBrick = (ptCoord, slot) => {
        manager.bc2pt[slot.bcIndex] = ptCoord;
        return true;
      };
      const overview = brickLayout.length - 1;
      const isFailing = brick => brick.level === overview && brick.c === 0
        && brick.bx === 0 && brick.by === 0 && brick.bz === 0;
      const { readBrick } = manager.brickSource;
      let failedReads = 0;
      manager.brickSource.readBrick = async (brick) => {
        if (isFailing(brick)) {
          failedReads += 1;
          throw new Error('network');
        }
        return readBrick(brick);
      };
      // eslint-disable-next-line no-underscore-dangle
      const [failing] = manager._overviewRequests();
      // eslint-disable-next-line no-underscore-dangle
      expect(await manager._loadOverviews()).toBe(true);
      // Only the failed brick is left, and only for its channel.
      // eslint-disable-next-line no-underscore-dangle
      expect(manager._overviewRequests()).toEqual([failing]);
      // eslint-disable-next-line no-underscore-dangle
      await manager._loadOverviews();
      // eslint-disable-next-line no-underscore-dangle
      await manager._loadOverviews();
      // Then the regular requests take over.
      // eslint-disable-next-line no-underscore-dangle
      expect(await manager._loadOverviews()).toBe(false);
      expect(failedReads).toBe(3);
      // The other bricks loaded once each.
      expect(new Set(reads).size).toBe(reads.length);
    });

    it('pins overview bricks that are already resident instead of loading them', async () => {
      const { manager } = createManager();
      const { reads } = withBrickSource(manager);
      // eslint-disable-next-line no-underscore-dangle
      const [resident, ...others] = manager._overviewRequests();
      manager.bc2pt[7] = resident;
      // eslint-disable-next-line no-underscore-dangle
      await manager._loadOverviews();
      expect(reads).toHaveLength(others.length);
      expect(manager.overviewBricks.get(0)).toContain(7);
    });

    it('takes no cache slots for bricks a bail-out never fetched', async () => {
      const { manager, PT } = createManager();
      const { reads } = withBrickSource(manager);
      const requests = Array.from({ length: 8 }, (_, bz) => _zarrToPt(0, 0, 0, 0, bz, PT));
      const handled = manager.handleBrickRequests(requests);
      manager.needsBailout = true; // as when usage data arrives mid-batch
      const uploaded = await handled;
      expect(reads).toHaveLength(6);
      expect(uploaded).toHaveLength(6);
      expect(manager.BCUnusedIndex).toBe(6);
    });

    it('also loads requests beyond the top k whose chunks are cached', async () => {
      const { manager, PT } = createManager();
      const { reads } = withBrickSource(manager, { cached: ['0:0:3'] });
      manager.initStatus = 'complete';
      manager.k = 1;
      // No overview loads left to try, so the batch goes to the regular requests.
      manager.overviewAttempts.set(0, 3).set(1, 3);
      // Weighted by pixel count: the top request, an uncached one, a cached one.
      const pixels = [[0, 0, 0, 3], [0, 0, 1, 2], [0, 0, 3, 1]].flatMap(
        ([bx, by, bz, count]) => Array(count).fill(_zarrToPt(0, 0, bx, by, bz, PT)),
      );
      // Requests as the shader packs them: x:10 | y:10 | z:12, big-endian RGBA8.
      const buffer = new DataView(new ArrayBuffer(pixels.length * 4));
      pixels.forEach(({ x, y, z }, i) => {
        buffer.setUint32(i * 4, x * (2 ** 22) + y * (2 ** 12) + z);
      });
      await manager.processRequestData(new Uint8Array(buffer.buffer), {});
      expect(reads).toEqual(['0:0:3:0:0', '0:0:0:0:0']);
    });
  });
});
