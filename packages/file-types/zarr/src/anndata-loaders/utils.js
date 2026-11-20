
export class IncorrectDataTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IncorrectDataTypeError';
  }
}

export function convertBigInt64ArrayToInt32Array(arr) {
  if (!(arr instanceof BigInt64Array)) { // eslint-disable-line no-undef
    throw new IncorrectDataTypeError('Expected a BigInt64Array');
  }
  const out = new Int32Array(arr.length);
  // Create a view of the BigInt64Array buffer as a Int32Array (2x elements of out)
  const view = new Int32Array(arr.buffer);
  for (let i = 0; i < arr.length; i++) {
    /**
                     * Get the lower 32 bits of each 64-bit value.
                     *
                     * Since each 64-bit value takes up 2 slots in the Int32Array view, we
                     * multiply the index by 2 to get the correct position (assuming
                     * little-endian).  Note that we are ignoring the upper bits because
                     * data will never actually need 64 bits of integer precision.
                     * If this comes up someone can open an issue.
                     */
    out[i] = view[i * 2];
  }
  return out;
}

// eslint-disable-next-line no-undef
export const maybeDowncastInt64 = (data) => {
  try {
    return convertBigInt64ArrayToInt32Array(data);
  } catch (error) {
    if (error instanceof IncorrectDataTypeError) {
      return data;
    }
    throw error;
  }
};
export const concatenateColumnVectors = (arr) => {
  const numCols = arr.length;
  const numRows = arr[0].length;
  const { BYTES_PER_ELEMENT } = arr[0];
  const view = new DataView(new ArrayBuffer(numCols * numRows * BYTES_PER_ELEMENT));
  const TypedArray = arr[0].constructor;
  const dtype = TypedArray.name.replace('Array', '');
  for (let i = 0; i < numCols; i += 1) {
    for (let j = 0; j < numRows; j += 1) {
      view[`set${dtype}`](BYTES_PER_ELEMENT * (j * numCols + i), arr[i][j], true);
    }
  }
  return new TypedArray(view.buffer);
};

/**
 * Convert a 64-bit integer array to a Float64Array of plain numbers, exact
 * below 2^53. Unlike maybeDowncastInt64 this keeps the high bits, so it is safe
 * for values that can exceed 2^31, such as sparse `indptr` entries (bounded by
 * nnz). Other arrays pass through unchanged.
 * @param {ArrayLike<number|bigint>} data A typed array.
 * @returns {ArrayLike<number>} A number-valued array.
 */
export function bigInt64ToNumberArray(data) {
  // eslint-disable-next-line no-undef
  if (data instanceof BigInt64Array || data instanceof BigUint64Array) {
    const out = new Float64Array(data.length);
    for (let i = 0; i < data.length; i += 1) {
      out[i] = Number(data[i]);
    }
    return out;
  }
  return data;
}

const BYTES_PER_ELEMENT = {
  bool: 1,
  int8: 1,
  uint8: 1,
  int16: 2,
  uint16: 2,
  int32: 4,
  uint32: 4,
  float32: 4,
  int64: 8,
  uint64: 8,
  float64: 8,
};

/**
 * Bytes per element for a zarrita data type name.
 * @param {string} dtype A dtype such as 'int32' or 'float32'.
 * @returns {number} Bytes per element; 8 (conservative) when unknown.
 */
export function getBytesPerElement(dtype) {
  return BYTES_PER_ELEMENT[dtype] ?? 8;
}

/**
 * Create a function that runs async tasks with bounded concurrency.
 * @param {number} concurrency Maximum number of tasks in flight.
 * @returns {<T>(task: () => Promise<T>) => Promise<T>} A scheduler.
 */
export function createLimiter(concurrency) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= concurrency || queue.length === 0) {
      return;
    }
    active += 1;
    const { task, resolve, reject } = queue.shift();
    task().then(resolve, reject).finally(() => {
      active -= 1;
      next();
    });
  };
  return task => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    next();
  });
}

/**
 * Extract dense columns from a CSR matrix without densifying it.
 *
 * CSR has no per-column index, so the `indices` array is streamed once, chunk by
 * chunk, and every stored value whose column was requested is placed by row.
 * Rows are recovered with a pointer that moves forward over `indptr` as the
 * position in `indices` increases, so the whole pass is O(nnz + numRows). The
 * `data` chunk is fetched only for chunks that contained a hit. Peak memory is a
 * few chunks plus the output columns, independent of nnz.
 *
 * I/O is injected so the traversal can be tested without a store.
 *
 * @param {object} params
 * @param {ArrayLike<number>} params.indptr Row pointers, number-valued, length numRows + 1.
 * @param {number} params.numRows Number of rows (observations).
 * @param {number} params.numCols Number of columns (features).
 * @param {number[]} params.colIndices Requested columns, unique and within [0, numCols).
 * @param {number} params.nnz Number of stored values (length of indices/data).
 * @param {number} params.chunkSize Chunk length of the indices and data arrays.
 * @param {(chunkIndex: number) => Promise<ArrayLike<number|bigint>>} params.getIndicesChunk
 * Reads one chunk of `indices`; may be padded past nnz, as zarr chunks are.
 * @param {(chunkIndex: number) => Promise<ArrayLike<number|bigint>>} params.getDataChunk
 * Reads the corresponding chunk of `data`.
 * @param {number} [params.prefetch=4] How many chunk reads to keep in flight.
 * @returns {Promise<Float32Array[]>} One column per entry of colIndices, length numRows.
 */
export async function extractCsrColumns({
  indptr, numRows, numCols, colIndices, nnz, chunkSize,
  getIndicesChunk, getDataChunk, prefetch = 4,
}) {
  const out = colIndices.map(() => new Float32Array(numRows));
  if (colIndices.length === 0 || nnz === 0) {
    return out;
  }
  // Column -> output slot, so membership is a typed-array read per stored value.
  const slotByCol = new Int32Array(numCols).fill(-1);
  colIndices.forEach((col, slot) => {
    slotByCol[col] = slot;
  });
  const numChunks = Math.ceil(nnz / chunkSize);
  const limit = createLimiter(Math.max(1, prefetch));
  const pending = new Map();
  const prefetchChunk = (c) => {
    if (c < numChunks && !pending.has(c)) {
      pending.set(c, limit(() => getIndicesChunk(c)));
    }
  };
  for (let c = 0; c < Math.min(prefetch, numChunks); c += 1) {
    prefetchChunk(c);
  }
  const fills = [];
  let row = 0;
  for (let c = 0; c < numChunks; c += 1) {
    prefetchChunk(c + prefetch);
    // eslint-disable-next-line no-await-in-loop
    const idx = await pending.get(c);
    pending.delete(c);
    const base = c * chunkSize;
    // The trailing chunk is padded with the fill value (typically 0, which is
    // also a valid column index), so only positions below nnz are stored values.
    const validLen = Math.min(chunkSize, nnz - base);
    const hitPos = [];
    const hitRow = [];
    const hitSlot = [];
    for (let j = 0; j < validLen; j += 1) {
      const slot = slotByCol[Number(idx[j])];
      if (slot >= 0) {
        const k = base + j;
        // k only increases, so the row pointer never moves backwards.
        while (indptr[row + 1] <= k) {
          row += 1;
        }
        hitPos.push(j);
        hitRow.push(row);
        hitSlot.push(slot);
      }
    }
    if (hitPos.length > 0) {
      fills.push(limit(() => getDataChunk(c)).then((values) => {
        for (let h = 0; h < hitPos.length; h += 1) {
          out[hitSlot[h]][hitRow[h]] = Number(values[hitPos[h]]);
        }
      }));
    }
  }
  await Promise.all(fills);
  return out;
}
