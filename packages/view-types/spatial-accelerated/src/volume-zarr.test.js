import { describe, it, expect } from 'vitest';
import * as zarr from 'zarrita';
import {
  planVolumeLevels,
  decodedBytesPerBrick,
  createChunkCache,
  createVolumeBrickSource,
} from './volume-zarr.js';

const TCZYX = ['t', 'c', 'z', 'y', 'x'];
// Hand-built levels whose logical shape equals the readable data.
const withDataShape = level => ({ ...level, dataShape: level.shape });

// Shape-only stand-ins for planning, ZYX shapes with t = c = 1.
function mockArrays(shapesZYX, chunksZYX) {
  return shapesZYX.map((shape, i) => ({
    shape: [1, 1, ...shape],
    chunks: [1, 1, ...(chunksZYX?.[i] ?? [1, shape[1], shape[2]])],
  }));
}

function xyOnlyShapes(depth, height, width, levels) {
  return Array.from({ length: levels }, (_, k) => [
    depth, Math.ceil(height / (2 ** k)), Math.ceil(width / (2 ** k)),
  ]);
}

// Map-backed store that counts chunk reads.
function createCountingStore() {
  const map = new Map();
  const store = {
    reads: 0,
    get(key) {
      if (key.includes('/c/')) store.reads += 1;
      return map.get(key);
    },
    set(key, value) { map.set(key, value); },
  };
  return store;
}

const value = (c, z, y, x) => (z * 7 + y * 3 + x + c * 100) % 4000;

async function createTestArray(store, path, shape, chunkShape, dtype = 'uint16') {
  const array = await zarr.create(zarr.root(store).resolve(path), { shape, chunkShape, dtype });
  const [nc, nz, ny, nx] = shape.slice(-4);
  const data = dtype === 'uint8'
    ? new Uint8Array(shape.reduce((a, b) => a * b))
    : new Uint16Array(shape.reduce((a, b) => a * b));
  let i = 0;
  for (let c = 0; c < nc; c++) {
    for (let z = 0; z < nz; z++) {
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) data[i++] = dtype === 'uint8' ? value(c, z, y, x) % 256 : value(c, z, y, x);
      }
    }
  }
  const stride = shape.map((_, axis) => shape.slice(axis + 1).reduce((a, b) => a * b, 1));
  await zarr.set(array, null, { data, shape, stride });
  // Mimic the Vitessce adapter, which reports v2 dtype strings.
  return new Proxy(array, {
    get: (target, property) => (property === 'dtype'
      ? { uint8: '|u1', uint16: '<u2' }[dtype] : Reflect.get(target, property)),
  });
}

function expectedValue(level, c, z, y, x) {
  const { zFactor: f, zMode, sourceDepth: depth } = level;
  if (zMode === 'native') return value(c, z, y, x);
  if (zMode === 'sample') return value(c, Math.min(depth - 1, z * f + Math.floor(f / 2)), y, x);
  const values = [];
  for (let s = z * f; s < Math.min(depth, (z + 1) * f); s++) values.push(value(c, s, y, x));
  if (zMode === 'max') return Math.max(...values);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

describe('volume-zarr', () => {
  describe('createChunkCache', () => {
    const chunk = { data: new Uint8Array(4) };

    it('fails stalled loads, and loads them again on the next read', async () => {
      const cache = createChunkCache(1024, { stallMs: 20 });
      let calls = 0;
      const hanging = () => {
        calls += 1;
        return new Promise(() => {});
      };
      await expect(cache.load('a', hanging)).rejects.toThrow('No chunk loaded');
      expect(cache.isReady('a')).toBe(false);
      await expect(cache.load('a', async () => chunk)).resolves.toBe(chunk);
      expect(calls).toBe(1);
      expect(cache.isReady('a')).toBe(true);
    });

    it('aborts the request of a stalled load, for all of its readers', async () => {
      const cache = createChunkCache(1024, { stallMs: 20 });
      let loaderSignal;
      const hanging = (signal) => {
        loaderSignal = signal;
        return new Promise(() => {});
      };
      const leaving = new AbortController();
      const left = cache.load('a', hanging, { signal: leaving.signal });
      const staying = cache.load('a', hanging, { signal: new AbortController().signal });
      // One reader aborting leaves the request to the other.
      leaving.abort();
      await expect(left).rejects.toMatchObject({ name: 'AbortError' });
      expect(loaderSignal.aborted).toBe(false);
      await expect(staying).rejects.toThrow('No chunk loaded');
      expect(loaderSignal.aborted).toBe(true);
    });

    it('does not count a load that all of its readers aborted as stalled', async () => {
      const cache = createChunkCache(1024, { stallMs: 20 });
      const reader = new AbortController();
      const aborted = cache.load('a', () => new Promise(() => {}), { signal: reader.signal });
      reader.abort();
      await expect(aborted).rejects.toMatchObject({ name: 'AbortError' });
      // A slower load started later is timed from its own start.
      const after = ms => new Promise((resolve) => { setTimeout(() => resolve(chunk), ms); });
      await new Promise((resolve) => { setTimeout(resolve, 15); });
      await expect(cache.load('b', () => after(10))).resolves.toBe(chunk);
    });

    it('counts the bytes loaded, including chunks loaded again after eviction', async () => {
      const cache = createChunkCache(4); // room for one chunk
      await cache.load('a', async () => chunk);
      await cache.load('a', async () => chunk); // cached: not loaded again
      await cache.load('b', async () => chunk); // evicts a
      await cache.load('a', async () => chunk);
      expect(cache.stats()).toMatchObject({ entries: 1, bytes: 4, loadedBytes: 12 });
    });

    it('does not fail slow loads while other chunks keep arriving', async () => {
      const cache = createChunkCache(1024, { stallMs: 30 });
      const after = ms => new Promise((resolve) => { setTimeout(() => resolve(chunk), ms); });
      const slow = cache.load('slow', () => after(50));
      // A chunk arrives every 15 ms, within the stall time.
      await Promise.all([10, 25, 40].map(ms => cache.load(`fast-${ms}`, () => after(ms))));
      await expect(slow).resolves.toBe(chunk);
    });
  });

  describe('planVolumeLevels', () => {
    it('reduces Z of an XY-only pyramid down to at least 32 slices', () => {
      const shapes = xyOnlyShapes(194, 3181, 4045, 6);
      const levels = planVolumeLevels({ arrays: mockArrays(shapes), labels: TCZYX });
      // Then two virtual levels halving each axis over one brick, the last a single brick.
      expect(levels.map(l => l.shape[0])).toEqual([194, 97, 49, 33, 33, 33, 17, 17]);
      expect(levels.map(l => l.zFactor)).toEqual([1, 2, 4, 6, 6, 6, 12, 12]);
      expect(levels.map(l => l.zMode)).toEqual(['native', ...Array(7).fill('sample')]);
      // The shader scale includes the reduction factor; XY keeps shape ratios.
      expect(levels.map(l => l.ratio[0])).toEqual([1, 2, 4, 6, 6, 6, 12, 12]);
      expect(levels[1].ratio[2]).toBeCloseTo(4045 / 2023);
    });

    it('only reduces anisotropic stacks once XY is coarser than Z', () => {
      const shapes = xyOnlyShapes(194, 3181, 4045, 6);
      const levels = planVolumeLevels({
        arrays: mockArrays(shapes), labels: TCZYX, spacing: [2, 0.36, 0.36],
      });
      expect(levels.map(l => l.shape[0])).toEqual([194, 194, 194, 194, 97, 39, 20, 20]);
    });

    it('keeps a pyramid that already downsamples Z under auto, and with none', () => {
      const shapes = [[194, 3181, 4045], [194, 1590, 2022], [194, 795, 1011], [194, 398, 506],
        [194, 199, 253], [97, 99, 126], [48, 50, 63], [24, 25, 32]];
      const arrays = mockArrays(shapes, shapes.map(() => [32, 32, 32]));
      ['auto', 'none'].forEach((mode) => {
        const levels = planVolumeLevels({ arrays, labels: TCZYX, mode });
        expect(levels.map(l => l.shape)).toEqual(shapes);
        expect(levels.every(l => l.zFactor === 1)).toBe(true);
      });
      const forced = planVolumeLevels({ arrays, labels: TCZYX, mode: 'mean' });
      expect(forced.map(l => l.shape[0])).toEqual([194, 97, 49, 33, 33, 33, 48, 24]);
    });

    it('uses NGFF scales as ratios to level 0, including physical units', () => {
      const shapes = xyOnlyShapes(35, 2048, 2048, 3);
      const datasets = [0.108335, 0.21667, 0.43334].map(s => ({
        coordinateTransformations: [{ type: 'scale', scale: [1, 1, 0.4, s, s] }],
      }));
      const levels = planVolumeLevels({
        arrays: mockArrays(shapes), labels: TCZYX, datasets, spacing: [0.4, 0.108335, 0.108335],
      });
      // Fewer than 64 slices: no reduction above the 32-slice floor, except for
      // the virtual levels appended after the coarsest level, which halve Z once.
      expect(levels.map(l => l.shape[0])).toEqual([35, 35, 35, 18, 18, 18, 18]);
      [1, 4, 4].forEach((ratio, axis) => expect(levels[2].ratio[axis]).toBeCloseTo(ratio));
    });

    it('samples Z of virtual levels whatever the reduction, unless a chunk spans the bin', () => {
      // idr0048A: one-plane chunks, so a mean or max overview would read all 1402 planes.
      const shapes = xyOnlyShapes(1402, 5192, 2947, 6);
      ['none', 'sample', 'mean', 'max'].forEach((mode) => {
        const levels = planVolumeLevels({ arrays: mockArrays(shapes), labels: TCZYX, mode });
        expect(levels.at(-1)).toMatchObject({ isOverview: true, zMode: 'sample' });
        expect(levels.filter(l => l.isVirtual).every(l => l.zMode === 'sample')).toBe(true);
      });
      // Chunks of 64 planes span the 62-plane bins: the mean costs no extra reads.
      const thick = mockArrays(shapes, shapes.map(([, y, x]) => [64, y, x]));
      const levels = planVolumeLevels({ arrays: thick, labels: TCZYX, mode: 'max' });
      expect(levels.at(-1)).toMatchObject({ isOverview: true, zMode: 'mean' });
    });

    it('halves every axis over one brick below the coarsest stored level (idr0077)', () => {
      const shapes = [[259, 1920, 1920], [259, 960, 960], [259, 480, 480], [259, 240, 240]];
      const levels = planVolumeLevels({
        arrays: mockArrays(shapes), labels: TCZYX, spacing: [1.633, 0.2696, 0.2696],
      });
      expect(levels.slice(4).map(l => l.shape)).toEqual([
        [130, 120, 120], [65, 60, 60], [33, 30, 30], [17, 30, 30],
      ]);
      expect(levels.slice(4).map(l => [l.zFactor, l.yFactor, l.xFactor])).toEqual([
        [2, 2, 2], [4, 4, 4], [8, 8, 8], [16, 8, 8],
      ]);
      expect(levels.slice(4).every(l => l.source === 3 && l.isVirtual)).toBe(true);
      expect(levels.at(-1).isOverview).toBe(true);
    });

    it('samples planes that nest across virtual levels', async () => {
      const shapes = [[259, 240, 240]];
      const levels = planVolumeLevels({ arrays: mockArrays(shapes), labels: TCZYX });
      const source = createVolumeBrickSource({ arrays: mockArrays(shapes), levels, labels: TCZYX });
      // Source planes read by the bricks of a level.
      const planesOf = (level) => {
        const planes = new Set();
        const [zBricks, yBricks, xBricks] = levels[level].shape.map(n => Math.ceil(n / 32));
        for (let bz = 0; bz < zBricks; bz++) {
          for (let by = 0; by < yBricks; by++) {
            for (let bx = 0; bx < xBricks; bx++) {
              source.brickChunkKeys({ level, bx, by, bz }).forEach(key => planes.add(key));
            }
          }
        }
        return planes;
      };
      for (let level = levels.length - 1; level > 0; level--) {
        const finer = planesOf(level - 1);
        expect([...planesOf(level)].every(key => finer.has(key))).toBe(true);
      }
    });

    it('keeps the overview when the virtual levels exceed maxLevels', () => {
      const shapes = xyOnlyShapes(1402, 5192, 2947, 6);
      const levels = planVolumeLevels({ arrays: mockArrays(shapes), labels: TCZYX, mode: 'none' });
      expect(levels).toHaveLength(10);
      expect(levels.at(-1)).toMatchObject({ isOverview: true });
      expect(levels.at(-1).shape.every(size => size <= 32)).toBe(true);
    });

    it('appends a one-brick overview that covers the shader extent', () => {
      const cases = [
        { shapes: xyOnlyShapes(194, 3181, 4045, 6) },
        { shapes: xyOnlyShapes(1402, 5192, 2947, 6) },
        { shapes: [[401, 4255, 4992], [401, 66, 78]] },
        // Rounded sizes with metadata scales: 130 / 4 = 32.5 exceeds the 32 stored voxels.
        {
          shapes: [[40, 130, 130], [40, 65, 65], [40, 32, 32]],
          datasets: [1, 2, 4].map(s => ({
            coordinateTransformations: [{ type: 'scale', scale: [1, 1, 1, s, s] }],
          })),
        },
      ];
      cases.forEach(({ shapes, datasets }) => {
        const levels = planVolumeLevels({ arrays: mockArrays(shapes), labels: TCZYX, datasets });
        const overview = levels[levels.length - 1];
        expect(overview.isOverview).toBe(true);
        expect(overview.shape.every(size => size <= 32)).toBe(true);
        // Ratios stay monotone, and the brick spans the whole level-0 volume.
        const previous = levels[levels.length - 2];
        expect(overview.ratio.every((r, axis) => r >= previous.ratio[axis])).toBe(true);
        overview.shape.forEach((size, axis) => {
          expect(size * overview.ratio[axis]).toBeGreaterThanOrEqual(shapes[0][axis] - 1e-6);
        });
      });
    });

    it('adds no overview when the coarsest level is already one brick or levels are full', () => {
      const shapes = xyOnlyShapes(30, 1024, 1024, 6); // coarsest 30 x 32 x 32
      expect(planVolumeLevels({ arrays: mockArrays(shapes), labels: TCZYX })).toHaveLength(6);
      const many = xyOnlyShapes(194, 3181, 4045, 6);
      expect(planVolumeLevels({ arrays: mockArrays(many), labels: TCZYX, maxLevels: 6 }))
        .toHaveLength(6);
    });

    it('chooses mean when the source chunk already spans the Z bin', () => {
      const shapes = xyOnlyShapes(256, 256, 256, 2);
      const levels = planVolumeLevels({
        arrays: mockArrays(shapes, shapes.map(() => [64, 64, 64])), labels: TCZYX,
      });
      expect(levels[1]).toMatchObject({ zFactor: 2, zMode: 'mean', shape: [128, 128, 128] });
    });

    it('accepts czyx and zyx arrays, and rejects unknown modes', () => {
      const arrays = [{ shape: [2, 64, 64, 64], chunks: [1, 1, 64, 64] }];
      expect(planVolumeLevels({ arrays, labels: ['c', 'z', 'y', 'x'] })[0].shape).toEqual([64, 64, 64]);
      expect(() => planVolumeLevels({ arrays, labels: TCZYX, mode: 'median' })).toThrow();
      expect(() => planVolumeLevels({ arrays, labels: ['c', 'y', 'x'] })).toThrow();
    });
  });

  describe('decodedBytesPerBrick', () => {
    it('counts the decoded source chunks one brick touches', () => {
      const level = withDataShape({ zFactor: 1, zMode: 'native', shape: [1402, 5192, 2947] });
      const tiled = { shape: [1, 3, 1402, 5192, 2947], chunks: [1, 1, 1, 1024, 1024] };
      expect(decodedBytesPerBrick(level, tiled, TCZYX, 2)).toBe(32 * 1024 * 1024 * 2);
      const bricked = { shape: [1, 3, 1402, 5192, 2947], chunks: [1, 1, 32, 32, 32] };
      expect(decodedBytesPerBrick(level, bricked, TCZYX, 2)).toBe((32 ** 3) * 2);
    });
  });

  describe('createVolumeBrickSource', () => {
    const shape = [1, 2, 70, 45, 50];
    const chunkLayouts = [
      [1, 1, 1, 45, 50], [1, 1, 16, 16, 16], [1, 1, 64, 64, 64], [1, 2, 7, 20, 9],
    ];
    const levels = [[1, 'native'], [2, 'sample'], [2, 'mean'], [3, 'sample'], [3, 'mean'], [3, 'max']]
      .map(([zFactor, zMode]) => withDataShape({
        source: 0, sourceDepth: 70, zFactor, zMode, shape: [Math.ceil(70 / zFactor), 45, 50],
      }));
    // Interior and edge bricks of every level, for both channels.
    const reads = levels.flatMap((level, levelIndex) => [
      [0, 0, 0], [Math.ceil(level.shape[0] / 32) - 1, 1, 1],
    ].flatMap(([bz, by, bx]) => [0, 1].map(c => ({ level: levelIndex, c, bx, by, bz }))));

    function findMismatch({ data, valid }, { level: levelIndex, c, bx, by, bz }) {
      const level = levels[levelIndex];
      for (let z = 0; z < 32; z++) {
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            // Padding replicates the nearest valid voxel; it is never rescaled.
            const expected = expectedValue(
              level, c,
              bz * 32 + Math.min(z, valid[0] - 1),
              by * 32 + Math.min(y, valid[1] - 1),
              bx * 32 + Math.min(x, valid[2] - 1),
            );
            if (data[(z * 32 + y) * 32 + x] !== expected) return [z, y, x];
          }
        }
      }
      return null;
    }

    it.each(chunkLayouts)('reads padded logical bricks matching brute force (chunks %j)', async (...chunks) => {
      const array = await createTestArray(createCountingStore(), 'a', shape, chunks);
      const source = createVolumeBrickSource({ arrays: [array], levels, labels: TCZYX });
      const bricks = await Promise.all(reads.map(read => source.readBrick(read)));
      bricks.forEach((brick, i) => {
        const { level, bx, by, bz } = reads[i];
        expect(brick.data).toBeInstanceOf(Uint16Array);
        expect(brick.data.length).toBe(32 ** 3);
        expect(brick.valid).toEqual([bz, by, bx].map(
          (b, axis) => Math.min(32, levels[level].shape[axis] - (b * 32)),
        ));
        expect({ ...reads[i], mismatch: findMismatch(brick, reads[i]) })
          .toEqual({ ...reads[i], mismatch: null });
      });
    });

    it.each(['sample', 'mean', 'max'])('reads XY-reduced overview bricks matching brute force (%s)', async (zMode) => {
      const array = await createTestArray(createCountingStore(), 'a', shape, [1, 1, 1, 45, 50]);
      // Factors 3 x 2 x 2 leave partial bins on every axis: 70 / 3, 45 / 2, 50 / 2.
      const level = withDataShape({
        source: 0, sourceDepth: 70, zFactor: 3, yFactor: 2, xFactor: 2, zMode, shape: [24, 23, 25],
      });
      const source = createVolumeBrickSource({ arrays: [array], levels: [level], labels: TCZYX });
      const { data } = await source.readBrick({ level: 0, c: 1, bx: 0, by: 0, bz: 0 });
      const mismatches = [];
      for (let z = 0; z < 24; z++) {
        for (let y = 0; y < 23; y++) {
          for (let x = 0; x < 25; x++) {
            const planes = zMode === 'sample' ? [Math.min(69, z * 3 + 1)]
              : Array.from({ length: Math.min(3, 70 - z * 3) }, (_, i) => z * 3 + i);
            const block = planes.flatMap(s => [y * 2, y * 2 + 1].filter(v => v < 45).flatMap(
              v => [x * 2, x * 2 + 1].filter(u => u < 50).map(u => value(1, s, v, u)),
            ));
            const expected = zMode === 'max' ? Math.max(...block)
              : Math.round(block.reduce((a, b) => a + b, 0) / block.length);
            if (data[(z * 32 + y) * 32 + x] !== expected) mismatches.push([z, y, x]);
          }
        }
      }
      expect(mismatches.slice(0, 3)).toEqual([]);
    });

    it('reads czyx arrays', async () => {
      const array = await createTestArray(
        createCountingStore(), 'a', [2, 40, 33, 33], [1, 8, 16, 16], 'uint8',
      );
      const source = createVolumeBrickSource({
        arrays: [array],
        levels: [withDataShape({ source: 0, sourceDepth: 40, zFactor: 1, zMode: 'native', shape: [40, 33, 33] })],
        labels: ['c', 'z', 'y', 'x'],
      });
      const { data } = await source.readBrick({ level: 0, c: 1, bx: 1, by: 0, bz: 1 });
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data[(3 * 32 + 5) * 32]).toBe(value(1, 35, 5, 32) % 256);
      expect(data[(3 * 32 + 5) * 32 + 31]).toBe(value(1, 35, 5, 32) % 256);
    });

    it('samples only retained planes and reuses decoded chunks across bricks', async () => {
      const store = createCountingStore();
      const array = await createTestArray(store, 'a', [1, 1, 256, 64, 64], [1, 1, 1, 64, 64]);
      const source = createVolumeBrickSource({
        arrays: [array],
        levels: [withDataShape({ source: 0, sourceDepth: 256, zFactor: 8, zMode: 'sample', shape: [32, 64, 64] })],
        labels: TCZYX,
      });
      store.reads = 0;
      await source.readBrick({ level: 0, bx: 0, by: 0, bz: 0 });
      expect(store.reads).toBe(32);
      await Promise.all([[1, 0], [0, 1], [1, 1]].map(
        ([bx, by]) => source.readBrick({ level: 0, bx, by, bz: 0 }),
      ));
      expect(store.reads).toBe(32);
      expect(source.cache.stats().entries).toBe(32);
    });

    it('rejects bricks outside the logical level', async () => {
      const array = await createTestArray(
        createCountingStore(), 'a', [1, 1, 40, 33, 33], [1, 1, 32, 32, 32],
      );
      const source = createVolumeBrickSource({
        arrays: [array],
        levels: [withDataShape({
          source: 0, sourceDepth: 40, zFactor: 2, zMode: 'mean', shape: [20, 33, 33],
        })],
        labels: TCZYX,
      });
      await expect(source.readBrick({ level: 0, bx: 0, by: 0, bz: 1 })).rejects.toThrow();
    });

    it('covers the shader extent when a rounded level is smaller than scale implies', async () => {
      // Width 65 -> 32 at metadata scale 2: the shader addresses 65 / 2 = 32.5 voxels.
      const store = createCountingStore();
      const arrays = [
        await createTestArray(store, '0', [1, 1, 32, 32, 65], [1, 1, 32, 32, 32]),
        await createTestArray(store, '1', [1, 1, 32, 32, 32], [1, 1, 32, 32, 32]),
      ];
      const datasets = [1, 2].map(s => ({
        coordinateTransformations: [{ type: 'scale', scale: [1, 1, 1, 1, s] }],
      }));
      const rounded = planVolumeLevels({ arrays, labels: TCZYX, datasets, mode: 'none' });
      expect(rounded[1]).toMatchObject({ dataShape: [32, 32, 32], shape: [32, 32, 33] });
      const source = createVolumeBrickSource({ arrays, levels: rounded, labels: TCZYX });
      // Brick x = 1 exists only for the shader extent; it repeats the last column.
      const { data } = await source.readBrick({ level: 1, bx: 1, by: 0, bz: 0 });
      expect(data[(5 * 32 + 7) * 32 + 0]).toBe(value(0, 5, 7, 31));
      expect(data[(5 * 32 + 7) * 32 + 31]).toBe(value(0, 5, 7, 31));
    });

    it('keeps at most one brick depth of source planes in flight', async () => {
      const store = createCountingStore();
      let inFlight = 0;
      let maxInFlight = 0;
      const { get } = store;
      store.get = async (key) => {
        if (!key.includes('/c/')) return get(key);
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise(resolve => setTimeout(resolve, 1));
        inFlight -= 1;
        return get(key);
      };
      const array = await createTestArray(store, 'a', [1, 1, 256, 32, 32], [1, 1, 1, 32, 32]);
      const source = createVolumeBrickSource({
        arrays: [array],
        // 32 bins of 8 planes: 256 single-plane chunks for one brick.
        levels: [withDataShape({
          source: 0, sourceDepth: 256, zFactor: 8, zMode: 'mean', shape: [32, 32, 32],
        })],
        labels: TCZYX,
      });
      await source.readBrick({ level: 0, bx: 0, by: 0, bz: 0 });
      expect(store.reads).toBe(256);
      expect(maxInFlight).toBeLessThanOrEqual(32);
    });

    it('aborts the chunk requests of an aborted brick that no other brick waits for', async () => {
      const store = createCountingStore();
      // Bricks x = 0 and 1 share chunk 0; brick x = 2 alone reads chunk 1.
      const array = await createTestArray(store, 'a', [1, 1, 32, 32, 96], [1, 1, 32, 32, 64]);
      const signals = new Map();
      let release;
      const gate = new Promise((resolve) => { release = resolve; });
      const { get } = store;
      store.get = async (key, options) => {
        if (!key.includes('/c/')) return get(key);
        signals.set(key.split('/c/')[1], options?.signal);
        await gate;
        return get(key);
      };
      const source = createVolumeBrickSource({
        arrays: [array],
        levels: [withDataShape({
          source: 0, sourceDepth: 32, zFactor: 1, zMode: 'native', shape: [32, 32, 96],
        })],
        labels: TCZYX,
      });
      const controller = new AbortController();
      const brick = bx => ({
        level: 0, bx, by: 0, bz: 0,
      });
      const aborted = [1, 2].map(bx => source.readBrick(brick(bx), { signal: controller.signal }));
      const kept = source.readBrick(brick(0), { signal: new AbortController().signal });
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(Array.from(signals.keys()).sort()).toEqual(['0/0/0/0/0', '0/0/0/0/1']);
      const reason = new DOMException('no longer needed', 'AbortError');
      controller.abort(reason);
      // The aborted bricks stop waiting at once, without the gated reads.
      await Promise.all(aborted.map(read => expect(read).rejects.toBe(reason)));
      expect(signals.get('0/0/0/0/1').aborted).toBe(true);
      // The store request is aborted with the brick's reason.
      expect(signals.get('0/0/0/0/1').reason).toBe(reason);
      // Chunk 0 is still needed by brick x = 0.
      expect(signals.get('0/0/0/0/0').aborted).toBe(false);
      release();
      const { data } = await kept;
      expect(data[(5 * 32 + 7) * 32 + 3]).toBe(value(0, 5, 7, 3));
      // Only the completed chunk is retained; the aborted one is read again next time.
      expect(source.isChunkCached('0:0,0,0,0,0')).toBe(true);
      expect(source.isChunkCached('0:0,0,0,0,1')).toBe(false);
    });

    it('rejects a brick whose signal is already aborted without reading', async () => {
      const store = createCountingStore();
      const array = await createTestArray(store, 'a', [1, 1, 32, 32, 32], [1, 1, 32, 32, 32]);
      const source = createVolumeBrickSource({
        arrays: [array],
        levels: [withDataShape({
          source: 0, sourceDepth: 32, zFactor: 1, zMode: 'native', shape: [32, 32, 32],
        })],
        labels: TCZYX,
      });
      store.reads = 0;
      await expect(source.readBrick(
        { level: 0, bx: 0, by: 0, bz: 0 }, { signal: AbortSignal.abort() },
      )).rejects.toThrow(/abort/i);
      expect(store.reads).toBe(0);
    });
  });
});
