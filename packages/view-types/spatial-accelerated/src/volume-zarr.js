import { get, slice } from 'zarrita';

const BRICK_SIZE = 32;
const SPATIAL_AXES = ['z', 'y', 'x'];

// A virtual level holding the whole volume in a single brick, appended when the
// coarsest stored level spans several bricks. It is loaded first for every
// channel, so something is on screen after one read per channel. XY is reduced
// by block mean (whole chunks are decoded anyway); Z follows the zMode rules.
function planOverviewLevel(coarsest, shape0, chunkZ, mode) {
  const sourceShape = [coarsest.sourceDepth, coarsest.dataShape[1], coarsest.dataShape[2]];
  const sourceRatio = [coarsest.ratio[0] / coarsest.zFactor, coarsest.ratio[1], coarsest.ratio[2]];
  // Factors come from the shader extent (level-0 size / ratio), which can exceed
  // the data, so that the level is exactly one brick.
  const [zFactor, yFactor, xFactor] = sourceRatio.map((r, axis) => Math.max(
    1, Math.ceil((shape0[axis] / r - 1e-6) / BRICK_SIZE),
  ));
  const factors = [zFactor, yFactor, xFactor];
  const ratio = sourceRatio.map((r, axis) => r * factors[axis]);
  const dataShape = sourceShape.map((size, axis) => Math.ceil(size / factors[axis]));
  let zMode = ['auto', 'none'].includes(mode) ? 'sample' : mode;
  if (zFactor === 1) zMode = 'native';
  else if (zMode === 'sample' && chunkZ >= zFactor) zMode = 'mean';
  return {
    source: coarsest.source,
    sourceDepth: coarsest.sourceDepth,
    dataShape,
    shape: dataShape.map((size, axis) => Math.max(
      size, Math.ceil(shape0[axis] / ratio[axis] - 1e-6),
    )),
    ratio,
    zFactor,
    yFactor,
    xFactor,
    zMode,
    isOverview: true,
  };
}

// Logical voxels cover integer bins of source planes. In particular, the last
// partial bin must not change the scale used by the shader (extent / scale).
export function planVolumeLevels({
  arrays, labels, datasets = [], spacing = [1, 1, 1], mode = 'auto', maxLevels = 10,
}) {
  if (!['auto', 'none', 'sample', 'mean', 'max'].includes(mode)) {
    throw new Error(`Unknown volumeZReduction: ${mode}`);
  }
  if (!SPATIAL_AXES.every(axis => labels.includes(axis))
    || labels.some(axis => !['t', 'c', ...SPATIAL_AXES].includes(axis))) {
    throw new Error('Expected Zarr axes z, y, x, with optional t and c');
  }
  const shapes = arrays.map(array => SPATIAL_AXES.map(axis => array.shape[labels.indexOf(axis)]));
  const scales = arrays.map((array, i) => {
    const scale = datasets[i]?.coordinateTransformations?.find(t => t.type === 'scale')?.scale;
    return SPATIAL_AXES.map(axis => scale?.[labels.indexOf(axis)]);
  });
  const hasScales = scales.every(scale => scale.every(
    value => Number.isFinite(value) && value > 0,
  ));
  const isXYOnly = shapes.every(shape => shape[0] === shapes[0][0]);
  let previousRatioZ = 1;
  const levels = shapes.slice(0, maxLevels).map((shape, source) => {
    const ratio = shape.map((size, axis) => (hasScales
      ? scales[source][axis] / scales[0][axis] : shapes[0][axis] / size));
    let zFactor = 1;
    if (source > 0 && mode !== 'none' && (mode !== 'auto' || isXYOnly)) {
      const physicalRatio = Math.min(spacing[1] * ratio[1], spacing[2] * ratio[2])
        / (spacing[0] * ratio[0]);
      // Shape ratios can be just below an integer, e.g. 4045 / 2023.
      const rounded = Math.round(physicalRatio);
      const factor = Math.abs(physicalRatio - rounded) < 0.05
        ? rounded : Math.floor(physicalRatio);
      zFactor = Math.min(
        Math.max(1, Math.floor(shape[0] / BRICK_SIZE)),
        Math.max(1, factor, Math.ceil(previousRatioZ / ratio[0] - 1e-9)),
      );
    }
    // Auto filters with mean only when the source chunk already spans the bin.
    let zMode = mode;
    if (zFactor === 1) zMode = 'native';
    else if (mode === 'auto') {
      zMode = arrays[source].chunks[labels.indexOf('z')] >= zFactor ? 'mean' : 'sample';
    }
    ratio[0] *= zFactor;
    [previousRatioZ] = ratio;
    // Readable voxels, with Z in bins of zFactor planes.
    const dataShape = [Math.ceil(shape[0] / zFactor), shape[1], shape[2]];
    return {
      source,
      sourceDepth: shape[0],
      dataShape,
      // The shader addresses level-0 extent / ratio voxels. Rounded pyramid sizes
      // (65 -> 32 at scale 2 gives 32.5) can exceed the data; voxels beyond it
      // repeat the edge, so the page table covers every brick the shader requests.
      shape: dataShape.map((size, axis) => Math.max(
        size, Math.ceil(shapes[0][axis] / ratio[axis] - 1e-6),
      )),
      ratio, // ZYX; reverse only when setting the shader's XYZ scales.
      zFactor,
      yFactor: 1,
      xFactor: 1,
      zMode,
    };
  });
  const coarsest = levels[levels.length - 1];
  if (levels.length < maxLevels && coarsest.shape.some(size => size > BRICK_SIZE)) {
    const chunkZ = arrays[coarsest.source].chunks[labels.indexOf('z')];
    levels.push(planOverviewLevel(coarsest, shapes[0], chunkZ, mode));
  }
  return levels;
}

// Conservative maximum for any brick, including unaligned source chunks.
export function decodedBytesPerBrick(level, array, labels, bytesPerElement) {
  const counts = SPATIAL_AXES.map((axis, dimension) => {
    const chunkSize = array.chunks[labels.indexOf(axis)];
    const factor = [level.zFactor, level.yFactor ?? 1, level.xFactor ?? 1][dimension];
    const sourceSize = array.shape[labels.indexOf(axis)];
    let maximum = 0;
    for (let start = 0; start < level.dataShape[dimension]; start += BRICK_SIZE) {
      const end = Math.min(start + BRICK_SIZE, level.dataShape[dimension]);
      let count;
      if (axis === 'z' && level.zMode === 'sample') {
        const chunks = new Set();
        for (let z = start; z < end; z++) {
          const plane = Math.min(sourceSize - 1, z * factor + Math.floor(factor / 2));
          chunks.add(Math.floor(plane / chunkSize));
        }
        count = chunks.size;
      } else {
        count = Math.floor((Math.min(sourceSize, end * factor) - 1) / chunkSize)
          - Math.floor(start * factor / chunkSize) + 1;
      }
      maximum = Math.max(maximum, count);
    }
    return maximum;
  });
  return counts.reduce((product, count) => product * count, bytesPerElement)
    * array.chunks.reduce((product, size) => product * size, 1);
}

// Bytes per element of a v2 Zarr dtype string ('<u2', '|u1') or a viv
// TIFF dtype name ('Uint16', 'Float32').
export function getBytesPerElement(dtype) {
  const [, prefix, digits] = String(dtype).match(/^([<>|]?).*?(\d+)$/) ?? [];
  if (!digits) return 2;
  return prefix ? Number(digits) : Number(digits) / 8;
}

// Room for several 32-plane stacks of large one-plane chunks, e.g. eight of
// idr0048A's 1024 x 1024 uint16 chunks (64 MiB each), so neighboring bricks
// can reuse a stack before it is evicted.
const DECODED_CHUNK_CACHE_BYTES = 512 * (2 ** 20);

// Decoded-chunk LRU shared by all levels and neighboring bricks (Zarr chunks
// or TIFF tiles). Entries hold promises, so concurrent reads of the same chunk
// share one decode. Failures are retryable.
export function createChunkCache(maxBytes = DECODED_CHUNK_CACHE_BYTES) {
  const cache = new Map();
  let bytes = 0;
  function load(key, loader) {
    if (cache.has(key)) {
      const entry = cache.get(key);
      cache.delete(key);
      cache.set(key, entry);
      return entry.promise;
    }
    const entry = { bytes: 0, isReady: false };
    entry.promise = loader().then((chunk) => {
      if (cache.get(key) === entry) {
        entry.isReady = true;
        entry.bytes = chunk.data.byteLength;
        bytes += entry.bytes;
        // Evict least recently used decoded chunks; in-flight entries have 0 bytes.
        // Oversized chunks are returned but not retained beyond the budget.
        Array.from(cache.entries()).some(([oldKey, oldEntry]) => {
          if (bytes <= maxBytes) return true;
          if (oldEntry.bytes > 0) {
            cache.delete(oldKey);
            bytes -= oldEntry.bytes;
          }
          return false;
        });
      }
      return chunk;
    }, (error) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, entry);
    return entry.promise;
  }
  return {
    load,
    // Whether a chunk is decoded and retained, without touching its recency.
    isReady: key => cache.get(key)?.isReady === true,
    stats: () => ({ entries: cache.size, bytes }),
    clear: () => { cache.clear(); bytes = 0; },
  };
}

// Chunk indices along one axis covering an index or a [start, end) range.
function chunkIndices(selection, chunkSize) {
  const [start, end] = Array.isArray(selection) ? selection : [selection, selection + 1];
  const first = Math.floor(start / chunkSize);
  return Array.from({ length: Math.floor((end - 1) / chunkSize) - first + 1 }, (_, i) => first + i);
}

/**
 * Region reader for zarrita arrays (or the Vitessce adapter proxy).
 * readRegion(source, { t, c, z, y, x }) takes [start, end) ranges for z, y, x
 * and returns { data, stride } with strides in ZYX order.
 * readRegion.chunkKeys(source, region) lists the cache keys of the chunks it reads.
 */
export function createZarrRegionReader({ arrays, labels, cache }) {
  // Zarrita assembles selections through getChunk, so caching getChunk lets
  // neighboring bricks reuse decoded chunks.
  const cachedArrays = arrays.map((array, source) => new Proxy(array, {
    get(target, property) {
      if (property !== 'getChunk') return Reflect.get(target, property);
      return (coordinates, ...options) => cache.load(
        `${source}:${coordinates.join(',')}`,
        () => target.getChunk(coordinates, ...options),
      );
    },
  }));
  const spatialLabels = labels.filter(axis => SPATIAL_AXES.includes(axis));
  async function readRegion(source, {
    t, c, z, y, x,
  }) {
    const selections = {
      t, c, z: slice(...z), y: slice(...y), x: slice(...x),
    };
    const result = await get(cachedArrays[source], labels.map(axis => selections[axis]));
    return {
      data: result.data,
      stride: SPATIAL_AXES.map(axis => result.stride[spatialLabels.indexOf(axis)]),
    };
  }
  readRegion.chunkKeys = (source, region) => {
    const { chunks } = arrays[source];
    // Same coordinates as zarrita's getChunk calls, so the same keys as load().
    const perAxis = labels.map((axis, i) => chunkIndices(region[axis] ?? 0, chunks[i]));
    return perAxis
      .reduce((products, indices) => products.flatMap(
        prefix => indices.map(index => [...prefix, index]),
      ), [[]])
      .map(coordinates => `${source}:${coordinates.join(',')}`);
  };
  return readRegion;
}

/**
 * Reads logical 32^3 bricks of the planned levels.
 * @param {object} options
 * @param {object[]} options.arrays Per source level, anything with shape and chunks.
 * @param {object[]} options.levels From planVolumeLevels.
 * @param {string[]} options.labels Axis labels of the arrays.
 * @param {number} options.cacheBytes Budget of the decoded-chunk cache.
 * @param {function} options.createRegionReader Factory ({ arrays, labels, cache })
 * => readRegion; defaults to reading zarrita arrays.
 */
export function createVolumeBrickSource({
  arrays, levels, labels, cacheBytes = DECODED_CHUNK_CACHE_BYTES,
  createRegionReader = createZarrRegionReader,
}) {
  const cache = createChunkCache(cacheBytes);
  const readRegion = createRegionReader({ arrays, labels, cache });

  // The source regions one logical brick reads, and where they land.
  function planBrickReads({ level: levelIndex, bx, by, bz }) {
    const level = levels[levelIndex];
    const origin = [bz, by, bx].map(value => value * BRICK_SIZE);
    if (origin.some((start, axis) => !Number.isInteger(start) || start < 0
      || start >= level.shape[axis])) {
      throw new Error(`Brick outside logical level ${levelIndex}: ${bz},${by},${bx}`);
    }
    // Read only existing data. A brick starting beyond it (see shape vs dataShape)
    // reads the last voxel, which padding then repeats.
    const [z0, y0, x0] = origin.map((start, axis) => Math.min(start, level.dataShape[axis] - 1));
    const valid = origin.map((start, axis) => Math.min(start + BRICK_SIZE, level.dataShape[axis])
      - [z0, y0, x0][axis]);
    const [nz, ny, nx] = valid;
    const { zFactor, zMode, sourceDepth } = level;
    const { yFactor = 1, xFactor = 1 } = level;
    const isSample = zMode === 'sample';
    const sourceEnd = Math.min(sourceDepth, (z0 + nz) * zFactor);
    const [sourceHeight, sourceWidth] = ['y', 'x'].map(
      axis => arrays[level.source].shape[labels.indexOf(axis)],
    );
    const yRange = [y0 * yFactor, Math.min(sourceHeight, (y0 + ny) * yFactor)];
    const xRange = [x0 * xFactor, Math.min(sourceWidth, (x0 + nx) * xFactor)];
    // Sample one plane per bin; stepped slices in zarrita also read skipped chunks.
    // At most one brick depth of source planes is in flight: 32 single-plane
    // samples, or one 32-plane slab at a time for native and filtered reads.
    const step = isSample ? zFactor : BRICK_SIZE;
    const ranges = [];
    for (let start = z0 * zFactor; start < sourceEnd; start += step) {
      const readStart = isSample
        ? Math.min(sourceDepth - 1, start + Math.floor(zFactor / 2)) : start;
      ranges.push([readStart, isSample ? readStart + 1 : Math.min(sourceEnd, start + step)]);
    }
    return {
      level,
      origin: [z0, y0, x0],
      valid,
      yRange,
      xRange,
      ranges,
      sourceHeight,
      sourceWidth,
      concurrency: isSample ? BRICK_SIZE : 1,
    };
  }

  // Cache keys of every source chunk a brick reads.
  function brickChunkKeys(brick) {
    const { level, yRange, xRange, ranges } = planBrickReads(brick);
    const { t = 0, c = 0 } = brick;
    return ranges.flatMap(z => readRegion.chunkKeys(level.source, {
      t, c, z, y: yRange, x: xRange,
    }));
  }

  async function readBrick(brick) {
    const { t = 0, c = 0 } = brick;
    const {
      level, origin: [z0, y0, x0], valid, yRange, xRange, ranges,
      sourceHeight, sourceWidth, concurrency,
    } = planBrickReads(brick);
    const [nz, ny, nx] = valid;
    const { zFactor, zMode, sourceDepth } = level;
    const { yFactor = 1, xFactor = 1 } = level;
    const isMean = zMode === 'mean';
    const isMax = zMode === 'max';
    // Logical voxels average blocks of source voxels for mean Z and for XY factors.
    const isSum = !isMax && (isMean || yFactor > 1 || xFactor > 1);
    const values = new Float64Array(BRICK_SIZE ** 3);
    if (isMax) values.fill(-Infinity);
    // Output voxel of each source row and column in the read region.
    const yOut = Array.from({ length: yRange[1] - yRange[0] },
      (_, i) => Math.floor((yRange[0] + i) / yFactor) - y0);
    const xOut = Array.from({ length: xRange[1] - xRange[0] },
      (_, i) => Math.floor((xRange[0] + i) / xFactor) - x0);
    let DataType = null;
    // Fold each result into values as it arrives, so results are not retained.
    const accumulate = (result, [readStart, readEnd]) => {
      DataType = result.data.constructor;
      const [sz, sy, sx] = result.stride;
      for (let z = 0; z < readEnd - readStart; z++) {
        const outputZ = Math.floor((readStart + z) / zFactor) - z0;
        for (let y = 0; y < yOut.length; y++) {
          const row = (outputZ * BRICK_SIZE + yOut[y]) * BRICK_SIZE;
          for (let x = 0; x < xOut.length; x++) {
            const value = result.data[z * sz + y * sy + x * sx];
            const index = row + xOut[x];
            if (isSum) values[index] += value;
            else values[index] = isMax ? Math.max(values[index], value) : value;
          }
        }
      }
    };
    let nextRead = 0;
    const readNext = async () => {
      while (nextRead < ranges.length) {
        const range = ranges[nextRead];
        nextRead += 1;
        // eslint-disable-next-line no-await-in-loop
        const result = await readRegion(level.source, {
          t, c, z: range, y: yRange, x: xRange,
        });
        accumulate(result, range);
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, ranges.length) }, readNext));
    const data = new DataType(BRICK_SIZE ** 3);
    const isInteger = !(data instanceof Float32Array || data instanceof Float64Array);
    // Source voxels per logical voxel; edge bins may be partial.
    const binSize = (start, factor, size) => Math.min(factor, size - start * factor);
    for (let z = 0; z < nz; z++) {
      const zCount = isMean ? binSize(z0 + z, zFactor, sourceDepth) : 1;
      for (let y = 0; y < ny; y++) {
        const zyCount = zCount * binSize(y0 + y, yFactor, sourceHeight);
        for (let x = 0; x < nx; x++) {
          const index = (z * BRICK_SIZE + y) * BRICK_SIZE + x;
          const count = isSum ? zyCount * binSize(x0 + x, xFactor, sourceWidth) : 1;
          const value = values[index] / count;
          data[index] = isInteger ? Math.round(value) : value;
        }
      }
    }
    // Padding is storage only: never rescale a partial brick to fill 32 voxels.
    // Replication prevents filtering toward zero at the volume boundary.
    if (valid.some(size => size < BRICK_SIZE)) {
      for (let z = 0; z < BRICK_SIZE; z++) {
        for (let y = 0; y < BRICK_SIZE; y++) {
          for (let x = 0; x < BRICK_SIZE; x++) {
            data[(z * BRICK_SIZE + y) * BRICK_SIZE + x] = data[
              (Math.min(z, nz - 1) * BRICK_SIZE + Math.min(y, ny - 1)) * BRICK_SIZE
              + Math.min(x, nx - 1)
            ];
          }
        }
      }
    }
    return { data, valid };
  }

  return {
    readBrick,
    brickChunkKeys,
    // Whether a chunk from brickChunkKeys is decoded, so reading it fetches nothing.
    isChunkCached: cache.isReady,
    cache: { stats: cache.stats, clear: cache.clear },
  };
}
