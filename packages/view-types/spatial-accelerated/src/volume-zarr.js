import { get, slice } from 'zarrita';

const BRICK_SIZE = 32;
const SPATIAL_AXES = ['z', 'y', 'x'];

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
  return shapes.slice(0, maxLevels).map((shape, source) => {
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
      zMode,
    };
  });
}

// Conservative maximum for any brick, including unaligned source chunks.
export function decodedBytesPerBrick(level, array, labels, bytesPerElement) {
  const counts = SPATIAL_AXES.map((axis, dimension) => {
    const chunkSize = array.chunks[labels.indexOf(axis)];
    const factor = axis === 'z' ? level.zFactor : 1;
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

export function createVolumeBrickSource({
  arrays, levels, labels, cacheBytes = 256 * (2 ** 20),
}) {
  // Zarrita assembles selections through getChunk. Cache decoded chunks, shared
  // across neighboring bricks, including in-flight reads. Failures are retryable.
  const cache = new Map();
  let bytes = 0;
  const cachedArrays = arrays.map((array, source) => new Proxy(array, {
    get(target, property) {
      if (property !== 'getChunk') return Reflect.get(target, property);
      return (coordinates, ...options) => {
        const key = `${source}:${coordinates.join(',')}`;
        if (cache.has(key)) {
          const entry = cache.get(key);
          cache.delete(key);
          cache.set(key, entry);
          return entry.promise;
        }
        const entry = { bytes: 0 };
        entry.promise = target.getChunk(coordinates, ...options).then((chunk) => {
          if (cache.get(key) === entry) {
            entry.bytes = chunk.data.byteLength;
            bytes += entry.bytes;
            // Evict least recently used decoded chunks; in-flight entries have 0 bytes.
            // Oversized chunks are returned but not retained beyond the budget.
            Array.from(cache.entries()).some(([oldKey, oldEntry]) => {
              if (bytes <= cacheBytes) return true;
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
      };
    },
  }));

  async function readBrick({ level: levelIndex, t = 0, c = 0, bx, by, bz }) {
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
    const isSample = zMode === 'sample';
    const isMean = zMode === 'mean';
    const isMax = zMode === 'max';
    const values = new Float64Array(BRICK_SIZE ** 3);
    if (isMax) values.fill(-Infinity);
    const sourceEnd = Math.min(sourceDepth, (z0 + nz) * zFactor);
    // Sample one plane per bin; stepped slices in zarrita also read skipped chunks.
    // At most one brick depth of source planes is in flight: 32 single-plane
    // samples, or one 32-plane slab at a time for native and filtered reads.
    const step = isSample ? zFactor : BRICK_SIZE;
    const concurrency = isSample ? BRICK_SIZE : 1;
    const ranges = [];
    for (let start = z0 * zFactor; start < sourceEnd; start += step) {
      const readStart = isSample
        ? Math.min(sourceDepth - 1, start + Math.floor(zFactor / 2)) : start;
      ranges.push([readStart, isSample ? readStart + 1 : Math.min(sourceEnd, start + step)]);
    }
    const spatialLabels = labels.filter(axis => SPATIAL_AXES.includes(axis));
    let DataType = null;
    // Fold each result into values as it arrives, so results are not retained.
    const accumulate = (result, [readStart, readEnd]) => {
      DataType = result.data.constructor;
      const [sz, sy, sx] = SPATIAL_AXES.map(axis => result.stride[spatialLabels.indexOf(axis)]);
      for (let z = 0; z < readEnd - readStart; z++) {
        const outputZ = Math.floor((readStart + z) / zFactor) - z0;
        for (let y = 0; y < ny; y++) {
          for (let x = 0; x < nx; x++) {
            const value = result.data[z * sz + y * sy + x * sx];
            const index = (outputZ * BRICK_SIZE + y) * BRICK_SIZE + x;
            if (isMean) values[index] += value;
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
        const selections = {
          t, c, z: slice(...range), y: slice(y0, y0 + ny), x: slice(x0, x0 + nx),
        };
        // eslint-disable-next-line no-await-in-loop
        const result = await get(cachedArrays[level.source], labels.map(axis => selections[axis]));
        accumulate(result, range);
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, ranges.length) }, readNext));
    const data = new DataType(BRICK_SIZE ** 3);
    const isInteger = !(data instanceof Float32Array || data instanceof Float64Array);
    for (let z = 0; z < nz; z++) {
      const count = isMean ? Math.min(zFactor, sourceDepth - (z0 + z) * zFactor) : 1;
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const index = (z * BRICK_SIZE + y) * BRICK_SIZE + x;
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
    cache: {
      stats: () => ({ entries: cache.size, bytes }),
      clear: () => { cache.clear(); bytes = 0; },
    },
  };
}
