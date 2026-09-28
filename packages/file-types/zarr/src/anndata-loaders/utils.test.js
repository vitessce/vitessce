import { describe, it, expect, vi } from 'vitest';
import {
  convertBigInt64ArrayToInt32Array,
  IncorrectDataTypeError,
  bigInt64ToNumberArray,
  getBytesPerElement,
  extractCsrColumns,
} from './utils.js';

const toArray = typedArr => Array.from(typedArr).map(Number);
const toBigInt = value => BigInt(value); // eslint-disable-line no-undef

// Build CSR arrays from a dense row-major matrix, for testing the column scan.
function denseToCsr(matrix) {
  const indptr = [0];
  const indices = [];
  const data = [];
  matrix.forEach((rowValues) => {
    rowValues.forEach((value, col) => {
      if (value !== 0) {
        indices.push(col);
        data.push(value);
      }
    });
    indptr.push(indices.length);
  });
  return { indptr, indices, data, nnz: indices.length };
}

// A 20 x 15 matrix with an all-zero row (7), all-zero columns (4 and 9), and a
// value pattern that identifies each (row, col) uniquely.
const NUM_ROWS = 20;
const NUM_COLS = 15;
const DENSE = Array.from({ length: NUM_ROWS }, (_, i) => Array.from(
  { length: NUM_COLS },
  (__, j) => ((i + j) % 3 === 0 && i !== 7 && j !== 4 && j !== 9 ? i * NUM_COLS + j + 1 : 0),
));
const CSR = denseToCsr(DENSE);

function makeChunkReaders(csr, chunkSize, { Indices = Int32Array, Data = Float32Array } = {}) {
  // Chunks are padded to chunkSize with zeros, as zarr chunks are.
  const padded = (arr, c) => {
    const slice = arr.slice(c * chunkSize, (c + 1) * chunkSize);
    const chunk = new Array(chunkSize).fill(0);
    slice.forEach((v, i) => { chunk[i] = v; });
    return chunk;
  };
  const asTyped = (Ctor, values) => (
    Ctor === BigInt64Array // eslint-disable-line no-undef
      ? Ctor.from(values.map(toBigInt))
      : Ctor.from(values)
  );
  return {
    getIndicesChunk: vi.fn(async c => asTyped(Indices, padded(csr.indices, c))),
    getDataChunk: vi.fn(async c => asTyped(Data, padded(csr.data, c))),
  };
}

async function extract(colIndices, chunkSize, options = {}) {
  const { getIndicesChunk, getDataChunk } = makeChunkReaders(CSR, chunkSize, options);
  const columns = await extractCsrColumns({
    indptr: CSR.indptr,
    numRows: NUM_ROWS,
    numCols: NUM_COLS,
    colIndices,
    nnz: CSR.nnz,
    chunkSize,
    getIndicesChunk,
    getDataChunk,
    ...(options.prefetch ? { prefetch: options.prefetch } : {}),
  });
  return { columns, getIndicesChunk, getDataChunk };
}

const expectedColumn = j => DENSE.map(rowValues => rowValues[j]);

describe('loaders/utils', () => {
  describe('convertBigInt64ArrayToInt32Array', () => {
    it('check data equality', async () => {
      const data = [1n, 2n, 3n, 4n, 5n];
      const bigIntArray = new BigInt64Array(data); // eslint-disable-line no-undef
      expect(new Int32Array(toArray(bigIntArray)))
        .toEqual(convertBigInt64ArrayToInt32Array(bigIntArray));
    });

    it('check error', async () => {
      const array = new Int32Array([1, 2, 3, 4, 5]);
      expect(() => convertBigInt64ArrayToInt32Array(array))
        .toThrow(IncorrectDataTypeError);
    });
  });

  describe('bigInt64ToNumberArray', () => {
    it('keeps values above 2^31, unlike the int32 downcast', () => {
      const big = (2n ** 33n) + 5n;
      // eslint-disable-next-line no-undef
      const converted = bigInt64ToNumberArray(new BigInt64Array([big, 5n, 0n]));
      expect(converted).toBeInstanceOf(Float64Array);
      expect(Array.from(converted)).toEqual([(2 ** 33) + 5, 5, 0]);
    });

    it('passes non-BigInt arrays through by identity', () => {
      const arr = new Int32Array([1, 2]);
      expect(bigInt64ToNumberArray(arr)).toBe(arr);
    });
  });

  describe('getBytesPerElement', () => {
    it('maps zarrita dtypes to byte widths, defaulting conservatively', () => {
      expect(getBytesPerElement('float32')).toEqual(4);
      expect(getBytesPerElement('int64')).toEqual(8);
      expect(getBytesPerElement('uint8')).toEqual(1);
      expect(getBytesPerElement('bool')).toEqual(1);
      expect(getBytesPerElement('v2:object')).toEqual(8);
    });
  });

  describe('extractCsrColumns', () => {
    it('matches the dense columns across chunk sizes', async () => {
      const cols = [1, 14, 4, 0, 7];
      const chunkSizes = [1, 3, 8, CSR.nnz, CSR.nnz + 10];
      // eslint-disable-next-line no-restricted-syntax
      for (const chunkSize of chunkSizes) {
        // eslint-disable-next-line no-await-in-loop
        const { columns, getIndicesChunk } = await extract(cols, chunkSize);
        expect(columns.map(toArray)).toEqual(cols.map(expectedColumn));
        expect(getIndicesChunk).toHaveBeenCalledTimes(Math.ceil(CSR.nnz / chunkSize));
      }
    });

    it('ignores fill-value padding in the trailing chunk', async () => {
      // Column 0 equals the fill value, so padding read as stored values would
      // wrongly place hits for it. Pick a chunk size that leaves a partial chunk.
      const chunkSize = 7;
      expect(CSR.nnz % chunkSize).not.toEqual(0);
      const { columns } = await extract([0], chunkSize);
      expect(toArray(columns[0])).toEqual(expectedColumn(0));
    });

    it('fetches data only for chunks that contain a requested column', async () => {
      // Column 14 has a hit in roughly one of every three rows, so several
      // small chunks carry no hit for it.
      const chunkSize = 2;
      const { columns, getIndicesChunk, getDataChunk } = await extract([14], chunkSize);
      expect(toArray(columns[0])).toEqual(expectedColumn(14));
      const chunksWithHits = new Set();
      CSR.indices.forEach((col, k) => {
        if (col === 14) {
          chunksWithHits.add(Math.floor(k / chunkSize));
        }
      });
      expect(getDataChunk).toHaveBeenCalledTimes(chunksWithHits.size);
      expect(getDataChunk.mock.calls.length).toBeLessThan(getIndicesChunk.mock.calls.length);
    });

    it('returns zero columns without reads when nothing is requested', async () => {
      const { columns, getIndicesChunk } = await extract([], 4);
      expect(columns).toEqual([]);
      expect(getIndicesChunk).not.toHaveBeenCalled();
    });

    it('is independent of the prefetch depth', async () => {
      const cols = [2, 13];
      const serial = await extract(cols, 5, { prefetch: 1 });
      const parallel = await extract(cols, 5, { prefetch: 6 });
      expect(serial.columns.map(toArray)).toEqual(parallel.columns.map(toArray));
      expect(serial.columns.map(toArray)).toEqual(cols.map(expectedColumn));
    });

    it('accepts 64-bit integer indices and data', async () => {
      const { columns } = await extract([1, 7], 6, {
        Indices: BigInt64Array, // eslint-disable-line no-undef
        Data: BigInt64Array, // eslint-disable-line no-undef
      });
      expect(columns.map(toArray)).toEqual([1, 7].map(expectedColumn));
    });
  });
});
