/* eslint-disable no-underscore-dangle */
import { open as zarrOpen, get as zarrGet, slice } from 'zarrita';
import { createZarrArrayAdapter, UNCACHED_READ } from '@vitessce/zarr-utils';
import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/abstract';
import { MatrixTooLargeError } from '@vitessce/error';
import { log } from '@vitessce/globals';
import {
  commaNumber,
  formatBytes,
  exceedsAllocationBudget,
  getAllocationBudgetBytes,
} from '@vitessce/utils';
import {
  maybeDowncastInt64,
  concatenateColumnVectors,
  bigInt64ToNumberArray,
  getBytesPerElement,
  extractCsrColumns,
  createLimiter,
} from './utils.js';

const SPARSE_DOCS_URL = 'https://vitessce.io/docs/data-troubleshooting/#anndata-zarr-obsfeaturematrix-with-sparse-matrices';
const TOO_LARGE_DOCS_URL = 'https://vitessce.io/docs/data-troubleshooting/#my-obsfeaturematrix-is-too-large-to-render-everything';

// Above this estimated download, a CSR feature selection logs a warning (once per
// loader), so that a permitted-but-slow scan is not silent.
const CSR_SCAN_WARN_BYTES = 256 * (2 ** 20);
// Chunk reads kept in flight while scanning a CSR matrix.
const CSR_SCAN_PREFETCH = 4;
// Concurrent slice reads when selecting many features from a CSC matrix.
const CSC_READ_CONCURRENCY = 8;
// A scan visits each chunk once, so its reads bypass the store-level cache rather
// than pinning the whole array in it.
const SCAN_READ_OPTS = { [UNCACHED_READ]: true };

// Put array of data into an object,
// to match the expected format of the
// value returned from the load function.
const toObject = data => ({ data });

const describeShape = shape => `[${shape.join(', ')}]`;
const describeBytes = bytes => (
  Number.isFinite(bytes) ? formatBytes(bytes) : 'more memory than can be addressed'
);

function fullMatrixMessage({ path, shape, description, bytes }) {
  return `Loading the full observation-by-feature matrix at "${path}" (shape ${describeShape(shape)}, ${description}) needs about ${describeBytes(bytes)} of memory, more than this browser's ~${formatBytes(getAllocationBudgetBytes())} budget. Load a subset of features with the "initialFeatureFilterPath" option (or a smaller subset, if one is already set), or point "path" at a smaller matrix, for example in obsm, together with "featureFilterPath". See ${TOO_LARGE_DOCS_URL}`;
}

function csrScanMessage({ path, shape, nnz, bytes }) {
  return `Selecting features from the csr_matrix at "${path}" (shape ${describeShape(shape)}, ${commaNumber(nnz)} stored values) requires scanning about ${describeBytes(bytes)} of "indices" and "data" per selection, more than this browser's ~${formatBytes(getAllocationBudgetBytes())} budget. Store the matrix as csc_matrix (adata.X = scipy.sparse.csc_matrix(adata.X)) so that individual features can be read without scanning the whole matrix. See ${SPARSE_DOCS_URL}`;
}

/**
 * Whether an error is the RangeError thrown for a typed array that is too large
 * or whose buffer could not be allocated. Checked by name as well as by class,
 * since the error may originate in another realm.
 * @param {*} e A caught error.
 * @returns {boolean} True for an allocation failure.
 */
function isAllocationFailure(e) {
  return e instanceof RangeError || e?.name === 'RangeError';
}

/**
 * Run an allocation, converting an allocation failure into a
 * MatrixTooLargeError that explains which matrix was being loaded and what to
 * do about it.
 * @param {Function} allocate A function performing the allocation.
 * @param {string} message The descriptive message to use on failure.
 * @returns {*} The allocation result.
 */
function allocateOrThrow(allocate, message) {
  try {
    return allocate();
  } catch (e) {
    if (isAllocationFailure(e)) {
      throw new MatrixTooLargeError(`${message} (${e.message})`);
    }
    throw e;
  }
}

/**
 * Loader for converting zarr into the a cell x gene matrix for use in Genes/Heatmap components.
 */
export default class ObsFeatureMatrixAnndataLoader extends AbstractTwoStepLoader {
  getOptions() {
    return this.options;
  }

  /**
   * Memoize the promise returned by `factory` on this loader under `key`. A
   * rejected promise is dropped again, so that a later call (for example a
   * react-query retry) re-runs the work instead of re-awaiting a dead promise.
   * @param {string} key The property name to store the promise under.
   * @param {() => Promise<any>} factory Creates the promise on first use.
   * @returns {Promise<any>} The memoized promise.
   */
  _memoized(key, factory) {
    if (!this[key]) {
      this[key] = Promise.resolve().then(factory).catch((err) => {
        delete this[key];
        throw err;
      });
    }
    return this[key];
  }

  /**
   * Log a warning at most once per loader for a given topic.
   * @param {string} topic A key identifying the warning.
   * @param {string} message The warning message.
   */
  _warnOnce(topic, message) {
    if (!this._warned) {
      this._warned = new Set();
    }
    if (!this._warned.has(topic)) {
      this._warned.add(topic);
      log.warn(message);
    }
  }

  /**
   * Class method for loading the genes list from AnnData.var,
   * filtered if a there is a `geneFilterZarr` present in the view config.
   * @returns {Promise} A promise for the zarr array contianing the gene names.
   */
  loadFilteredGeneNames() {
    return this._memoized('filteredGeneNames', async () => {
      const { path, featureFilterPath: geneFilterZarr, geneAlias } = this.getOptions();
      const [geneNames, geneFilter] = await Promise.all([
        geneAlias
          ? this.dataSource.loadVarAlias(geneAlias, path)
          : this.dataSource.loadVarIndex(path),
        geneFilterZarr ? this.dataSource.getFlatArrDecompressed(geneFilterZarr) : null,
      ]);
      return geneFilter ? geneNames.filter((_, j) => geneFilter[j]) : geneNames;
    });
  }

  /**
   * Class method for loading a filtered subset of the genes list
   * @param {String} filterZarr A location in the zarr store to fetch a boolean array from.
   * @returns {Array} A list of filtered genes.
   */
  async _getFilteredGenes(filterZarr) {
    const filter = await this.dataSource.getFlatArrDecompressed(filterZarr);
    const geneNames = await this.loadFilteredGeneNames();
    const genes = geneNames.filter((_, i) => filter[i]);
    return genes;
  }

  /**
   * Class method for getting the integer indices of a selection of genes within a list.
   * @param {Array} selection A list of gene names.
   * @returns {Array} A list of integer indices (-1 for genes that are not present).
   */
  async _getGeneIndices(selection) {
    const geneNames = await this.loadFilteredGeneNames();
    return selection.map(gene => geneNames.indexOf(gene));
  }

  /**
   * Class method for getting the number of cells i.e entries in `obs`.
   * @returns {Number} The number of cells.
   */
  async _getNumCells() {
    const { path } = this.getOptions();
    const cells = await this.dataSource.loadObsIndex(path);
    return cells.length;
  }

  /**
   * Load the attributes of the matrix group or array (encoding type, and the
   * shape for sparse encodings).
   * @returns {Promise<object>} The attributes.
   */
  _loadMatrixZattrs() {
    return this._memoized('matrixZattrs', () => {
      const { path: matrix } = this.getOptions();
      return this.dataSource.getJson(`${matrix}/.zattrs`);
    });
  }

  /**
   * Class method for opening the sparse matrix arrays in zarr.
   * @returns {Promise<Array>} The opened indptr, indices, and data arrays.
   */
  _openSparseArrays() {
    return this._memoized('sparseArrays', () => {
      const { path: matrix } = this.getOptions();
      const { storeRoot } = this.dataSource;
      return Promise.all(
        ['indptr', 'indices', 'data'].map(name => zarrOpen(
          storeRoot.resolve(`${matrix}/${name}`), { kind: 'array' },
        )),
      );
    });
  }

  /**
   * Open the dense matrix array in zarr.
   * @returns {Promise<object>} The opened zarr array.
   */
  _openDenseArray() {
    return this._memoized('denseArray', () => {
      const { path: matrix } = this.getOptions();
      const { storeRoot } = this.dataSource;
      return zarrOpen(storeRoot.resolve(matrix), { kind: 'array' });
    });
  }

  /**
   * Load the sparse `indptr` array once, as plain numbers. Its values are
   * bounded by nnz and can exceed 2^31, so int64 is converted without truncation.
   * @returns {Promise<ArrayLike<number>>} The row (CSR) or column (CSC) pointers.
   */
  _loadIndptr() {
    return this._memoized('indptr', async () => {
      const [indptrArr] = await this._openSparseArrays();
      const { data } = await zarrGet(indptrArr);
      return bigInt64ToNumberArray(data);
    });
  }

  /**
   * The column to report for a feature that is not in the matrix: zeros, with
   * a warning. This matches what the CSC route always did, and keeps a feature
   * selection shared across datasets from failing in the ones that lack a gene.
   * @param {string} name The feature name.
   * @param {number} numRows The number of observations.
   * @returns {Float32Array} An all-zero column.
   */
  _missingFeatureColumn(name, numRows) {
    const { path } = this.getOptions();
    log.warn(`Feature "${name}" was not found in the observation-by-feature matrix at "${path}"; its values are reported as zeros.`);
    return new Float32Array(numRows);
  }

  /**
   * Class method for loading a gene selection from a CSC matrix.
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Promise} A Promise.all array of promises containing Float32Arrays, one per selection.
   */
  async _loadCSCGeneSelection(selection) {
    const indices = await this._getGeneIndices(selection);
    const [, indexArr, dataArr] = await this._openSparseArrays();
    const [indptr, { shape }] = await Promise.all([
      this._loadIndptr(),
      this._loadMatrixZattrs(),
    ]);
    const numRows = shape[0];
    const limit = createLimiter(CSC_READ_CONCURRENCY);
    return Promise.all(
      indices.map(async (index, i) => {
        if (index < 0) {
          return this._missingFeatureColumn(selection[i], numRows);
        }
        const start = indptr[index];
        const end = indptr[index + 1];
        const geneData = new Float32Array(numRows);
        // If there is no change in the column pointer, then the column is all zeros.
        if (start === end) {
          return geneData;
        }
        const [{ data: rowIndices }, { data: values }] = await Promise.all([
          limit(() => zarrGet(indexArr, [slice(start, end)])),
          limit(() => zarrGet(dataArr, [slice(start, end)])),
        ]);
        const rows = bigInt64ToNumberArray(rowIndices);
        const vals = bigInt64ToNumberArray(values);
        for (let r = 0; r < rows.length; r += 1) {
          geneData[rows[r]] = vals[r];
        }
        return geneData;
      }),
    );
  }

  /**
   * Class method for loading a gene selection from a CSR matrix.
   *
   * CSR has no per-column slice, so the requested columns are gathered by one
   * chunk-wise scan of `indices`/`data` (see extractCsrColumns); the matrix is
   * never densified. Concurrent selections on this loader share a single scan.
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Promise} A Promise.all array of promises containing Float32Arrays, one per selection.
   */
  async _loadCSRGeneSelection(selection) {
    const indices = await this._getGeneIndices(selection);
    const [, indexArr, dataArr] = await this._openSparseArrays();
    const { shape } = await this._loadMatrixZattrs();
    const { path } = this.getOptions();
    const nnz = indexArr.shape[0];
    const bytesPerEntry = getBytesPerElement(indexArr.dtype) + getBytesPerElement(dataArr.dtype);
    // Every selection reads all of `indices` and most of `data`; refuse when that
    // is beyond what a browser can reasonably move, before reading any chunk.
    const scanBytes = nnz * bytesPerEntry;
    if (exceedsAllocationBudget(scanBytes)) {
      throw new MatrixTooLargeError(csrScanMessage({
        path, shape, nnz, bytes: scanBytes,
      }));
    }
    const numRows = shape[0];
    const numRequested = new Set(indices.filter(index => index >= 0)).size;
    // Memory held during the scan: chunks in flight, the pointers, and the outputs.
    const workingSetBytes = CSR_SCAN_PREFETCH * indexArr.chunks[0] * bytesPerEntry
      + (numRows + 1) * 8
      + numRows * 4 * numRequested;
    if (exceedsAllocationBudget(workingSetBytes)) {
      throw new MatrixTooLargeError(csrScanMessage({
        path, shape, nnz, bytes: workingSetBytes,
      }));
    }
    if (scanBytes > CSR_SCAN_WARN_BYTES) {
      this._warnOnce('csrScan', `Selecting features from the csr_matrix at "${path}" scans about ${formatBytes(scanBytes)} of "indices" and "data" per selection. Store the matrix as csc_matrix so that individual features can be read directly. See ${SPARSE_DOCS_URL}`);
    }
    return Promise.all(
      indices.map((index, i) => (
        index < 0
          ? this._missingFeatureColumn(selection[i], numRows)
          : this._requestCsrColumn(index)
      )),
    );
  }

  /**
   * Request one CSR column. Requests are collected and served by a single scan
   * per batch, so that the one-query-per-feature pattern of the data hooks does
   * not scan the matrix once per feature.
   * @param {number} col The column index.
   * @returns {Promise<Float32Array>} The column.
   */
  _requestCsrColumn(col) {
    if (!this._csrInflight) {
      this._csrInflight = new Map();
      this._csrPending = new Set();
    }
    let entry = this._csrInflight.get(col);
    if (!entry) {
      entry = {};
      entry.promise = new Promise((resolve, reject) => {
        entry.resolve = resolve;
        entry.reject = reject;
      });
      this._csrInflight.set(col, entry);
      this._csrPending.add(col);
      this._scheduleCsrFlush();
    }
    return entry.promise;
  }

  _scheduleCsrFlush() {
    if (this._csrFlushScheduled || this._csrScanning) {
      return;
    }
    this._csrFlushScheduled = true;
    // A macrotask, so that every caller in the same burst has enqueued its columns
    // regardless of how many awaits it went through to get here.
    setTimeout(() => {
      this._csrFlushScheduled = false;
      this._flushCsrScan();
    }, 0);
  }

  async _flushCsrScan() {
    if (this._csrScanning || this._csrPending.size === 0) {
      return;
    }
    const cols = Array.from(this._csrPending);
    this._csrPending.clear();
    this._csrScanning = true;
    try {
      const columns = await this._scanCsrColumns(cols);
      cols.forEach((col, i) => this._csrInflight.get(col).resolve(columns[i]));
    } catch (err) {
      cols.forEach(col => this._csrInflight.get(col).reject(err));
    } finally {
      cols.forEach(col => this._csrInflight.delete(col));
      this._csrScanning = false;
      if (this._csrPending.size > 0) {
        // Columns requested while this scan ran form the next one.
        this._scheduleCsrFlush();
      }
    }
  }

  /**
   * Scan the CSR `indices`/`data` arrays once for the given columns.
   * @param {number[]} cols Unique column indices.
   * @returns {Promise<Float32Array[]>} One column per entry of cols.
   */
  async _scanCsrColumns(cols) {
    const [, indexArr, dataArr] = await this._openSparseArrays();
    const [indptr, { shape }] = await Promise.all([
      this._loadIndptr(),
      this._loadMatrixZattrs(),
    ]);
    const nnz = indexArr.shape[0];
    const chunkSize = indexArr.chunks[0];
    const getIndicesChunk = c => indexArr.getChunk([c], SCAN_READ_OPTS).then(chunk => chunk.data);
    // AnnData writes `data` with the same chunks as `indices`; if a store does not,
    // read the matching element range instead of a chunk.
    const getDataChunk = dataArr.chunks[0] === chunkSize
      ? c => dataArr.getChunk([c], SCAN_READ_OPTS).then(chunk => chunk.data)
      : c => zarrGet(
        dataArr,
        [slice(c * chunkSize, Math.min(nnz, (c + 1) * chunkSize))],
        { opts: SCAN_READ_OPTS },
      ).then(chunk => chunk.data);
    return extractCsrColumns({
      indptr,
      numRows: shape[0],
      numCols: shape[1],
      colIndices: cols,
      nnz,
      chunkSize,
      getIndicesChunk,
      getDataChunk,
      prefetch: CSR_SCAN_PREFETCH,
    });
  }

  /**
   * Class method for loading a full sparse (CSR or CSC) matrix from zarr into a
   * dense row-major Float32Array.
   * @param {string} encodingType Either 'csr_matrix' or 'csc_matrix'.
   * @returns {Promise<Float32Array>} The dense matrix.
   */
  _loadSparseCellXGene(encodingType) {
    return this._memoized('sparseMatrix', async () => {
      const { path } = this.getOptions();
      const [[indptrArr, indexArr, dataArr], { shape }] = await Promise.all([
        this._openSparseArrays(),
        this._loadMatrixZattrs(),
      ]);
      const nnz = indexArr.shape[0];
      const bytes = 4 * shape[0] * shape[1]
        + nnz * (getBytesPerElement(indexArr.dtype) + getBytesPerElement(dataArr.dtype))
        + indptrArr.shape[0] * getBytesPerElement(indptrArr.dtype);
      const message = fullMatrixMessage({
        path, shape, description: encodingType, bytes,
      });
      if (exceedsAllocationBudget(bytes)) {
        // Attempt anyway: the budget is a heuristic, and a failed allocation is
        // reported descriptively below.
        this._warnOnce('fullMatrix', message);
      }
      const numCols = shape[1];
      // Allocate before downloading, so that a matrix too large to hold fails
      // right away instead of after fetching every stored value.
      const matrix = allocateOrThrow(() => new Float32Array(shape[0] * numCols), message);
      const [indptr, indices, values] = await Promise.all([
        this._loadIndptr(),
        zarrGet(indexArr).then(({ data }) => bigInt64ToNumberArray(data)),
        zarrGet(dataArr).then(({ data }) => bigInt64ToNumberArray(data)),
      ]);
      const numPointers = indptr.length - 1;
      if (encodingType === 'csr_matrix') {
        const numRows = Math.min(shape[0], numPointers);
        for (let row = 0; row < numRows; row += 1) {
          for (let k = indptr[row]; k < indptr[row + 1]; k += 1) {
            matrix[row * numCols + indices[k]] = values[k];
          }
        }
      } else {
        const numStoredCols = Math.min(numCols, numPointers);
        for (let col = 0; col < numStoredCols; col += 1) {
          for (let k = indptr[col]; k < indptr[col + 1]; k += 1) {
            matrix[indices[k] * numCols + col] = values[k];
          }
        }
      }
      return matrix;
    });
  }

  /**
   * Class method for loading a full dense matrix from zarr.
   * @returns {Promise<TypedArray>} The matrix, in the array's own dtype
   * (int64 downcast to int32).
   */
  _loadDenseCellXGene() {
    return this._memoized('denseMatrix', async () => {
      const { path } = this.getOptions();
      const z = await this._openDenseArray();
      const bytes = getBytesPerElement(z.dtype) * z.shape[0] * z.shape[1];
      const message = fullMatrixMessage({
        path, shape: z.shape, description: `dense ${z.dtype}`, bytes,
      });
      if (exceedsAllocationBudget(bytes)) {
        this._warnOnce('fullMatrix', message);
      }
      let data;
      try {
        // zarrita allocates the whole selection up front.
        ({ data } = await createZarrArrayAdapter(z).getRaw(null));
      } catch (e) {
        if (isAllocationFailure(e)) {
          throw new MatrixTooLargeError(`${message} (${e.message})`);
        }
        throw e;
      }
      return maybeDowncastInt64(data);
    });
  }

  /**
   * Class method for loading the cell x gene matrix.
   * @returns {Promise} A promise for the zarr array contianing the cell x gene data.
   */
  loadCellXGene() {
    return this._memoized('cellXGene', () => this._loadCellXGeneUncached());
  }

  async _loadCellXGeneUncached() {
    const { path, initialFeatureFilterPath: matrixGeneFilter } = this.getOptions();
    const { 'encoding-type': encodingType } = await this._loadMatrixZattrs();
    if (matrixGeneFilter) {
      // Only the filtered features are needed, so read them as columns whatever
      // the encoding; this never densifies the full matrix.
      const genes = await this._getFilteredGenes(matrixGeneFilter);
      if (genes.length === 0) {
        return toObject(new Float32Array(0));
      }
      const numRows = await this._getNumCells();
      // The per-feature columns plus their interleaved copy.
      const bytes = 2 * 4 * numRows * genes.length;
      const message = fullMatrixMessage({
        path,
        shape: [numRows, genes.length],
        description: `${encodingType || 'dense'}, ${genes.length} filtered features`,
        bytes,
      });
      if (exceedsAllocationBudget(bytes)) {
        this._warnOnce('fullMatrix', message);
      }
      const { data } = await this.loadGeneSelection({ selection: genes });
      return toObject(allocateOrThrow(() => concatenateColumnVectors(data), message));
    }
    if (encodingType === 'csr_matrix' || encodingType === 'csc_matrix') {
      return toObject(await this._loadSparseCellXGene(encodingType));
    }
    return toObject(await this._loadDenseCellXGene());
  }

  /**
   * Class method for loading a gene selection.
   * @param {Object} args
   * @param {Array} args.selection A list of gene names whose data should be fetched.
   * @returns {Object} { data } containing an array of gene expression data.
   */
  async loadGeneSelection({ selection }) {
    const { 'encoding-type': encodingType } = await this._loadMatrixZattrs();
    let genes;
    if (encodingType === 'csc_matrix') {
      genes = await this._loadCSCGeneSelection(selection);
    } else if (encodingType === 'csr_matrix') {
      genes = await this._loadCSRGeneSelection(selection);
    } else {
      const [z, indices] = await Promise.all([
        this._openDenseArray(),
        this._getGeneIndices(selection),
      ]);
      // We can index directly into a normal dense array zarr store via `get`.
      genes = await Promise.all(
        indices.map(async (index, i) => {
          if (index < 0) {
            return this._missingFeatureColumn(selection[i], z.shape[0]);
          }
          const { data } = await zarrGet(z, [null, index]);
          return maybeDowncastInt64(data);
        }),
      );
    }
    return { data: genes, url: null };
  }

  /**
   * Class method for loading only attributes i.e rows and columns
   * @param {Array} selection A list of gene names whose data should be fetched.
   * @returns {Object} { data: { rows, cols }, url } containing row and col labels for the matrix.
   */
  loadAttrs() {
    const { path } = this.getOptions();
    return Promise.all([this.dataSource.loadObsIndex(path), this.loadFilteredGeneNames()])
      .then((d) => {
        const [cellNames, geneNames] = d;
        const attrs = { rows: cellNames, cols: geneNames };
        return {
          data: attrs,
          url: null,
        };
      });
  }

  async loadInitialFilteredGeneNames() {
    const filteredGeneNames = await this.loadFilteredGeneNames();
    const {
      initialFeatureFilterPath: matrixGeneFilterZarr,
    } = this.getOptions();
    // In order to return the correct gene list with the heatmap data,
    // we need to filter the columns of attrs so it matches the cellXGene data.
    if (matrixGeneFilterZarr) {
      const matrixGeneFilter = await this.dataSource.getFlatArrDecompressed(
        matrixGeneFilterZarr,
      );
      return filteredGeneNames.filter((_, i) => matrixGeneFilter[i]);
    }
    return filteredGeneNames;
  }

  async load() {
    const { path } = this.getOptions();
    const [obsIndex, featureIndex, obsFeatureMatrix] = await Promise.all([
      this.dataSource.loadObsIndex(path),
      this.loadInitialFilteredGeneNames(),
      this.loadCellXGene(),
    ]);
    return new LoaderResult(
      { obsIndex, featureIndex, obsFeatureMatrix },
      null,
    );
  }
}
