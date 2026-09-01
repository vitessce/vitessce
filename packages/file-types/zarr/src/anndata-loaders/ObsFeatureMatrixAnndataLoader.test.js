/* eslint-disable func-names, camelcase */
import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import { root as zarrRoot, create as zarrCreate } from 'zarrita';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import { log } from '@vitessce/globals';
import { MatrixTooLargeError } from '@vitessce/error';
import ObsFeatureMatrixAnndataLoader from './ObsFeatureMatrixAnndataLoader.js';
import AnnDataSource from '../AnnDataSource.js';
import MuDataSource from '../MuDataSource.js';
import anndata_0_7_CscFixture from '../json-fixtures/anndata-0.7/anndata-csc.json';
import anndata_0_7_CsrFixture from '../json-fixtures/anndata-0.7/anndata-csr.json';
import anndata_0_7_DenseFixture from '../json-fixtures/anndata-0.7/anndata-dense.json';
import anndata_0_8_CscFixture from '../json-fixtures/anndata-0.8/anndata-csc.json';
import anndata_0_8_CsrFixture from '../json-fixtures/anndata-0.8/anndata-csr.adata.json';
import anndata_0_8_DenseFixture from '../json-fixtures/anndata-0.8/anndata-dense.json';
import anndata_0_9_CscFixture from '../json-fixtures/anndata-0.9/anndata-csc.json';
import anndata_0_9_CsrFixture from '../json-fixtures/anndata-0.9/anndata-csr.adata.json';
import anndata_0_9_DenseFixture from '../json-fixtures/anndata-0.9/anndata-dense.json';
import anndata_0_10_CscFixture from '../json-fixtures/anndata-0.10/anndata-csc.json';
import anndata_0_10_CsrFixture from '../json-fixtures/anndata-0.10/anndata-csr.adata.json';
import anndata_0_10_DenseFixture from '../json-fixtures/anndata-0.10/anndata-dense.json';
import anndata_0_11_CscFixture from '../json-fixtures/anndata-0.11/anndata-csc.json';
import anndata_0_11_CsrFixture from '../json-fixtures/anndata-0.11/anndata-csr.adata.json';
import anndata_0_11_DenseFixture from '../json-fixtures/anndata-0.11/anndata-dense.json';
import anndata_0_12_CscFixture from '../json-fixtures/anndata-0.12/anndata-csc.json';
import anndata_0_12_CsrFixture from '../json-fixtures/anndata-0.12/anndata-csr.adata.json';
import anndata_0_12_DenseFixture from '../json-fixtures/anndata-0.12/anndata-dense.json';
import mudata_0_2_CscFixture from '../json-fixtures/mudata-0.2/mudata-csc.json';
import mudata_0_2_CsrFixture from '../json-fixtures/mudata-0.2/mudata-csr.json';
import mudata_0_2_DenseFixture from '../json-fixtures/mudata-0.2/mudata-dense.json';

const toArray = typedArr => Array.from(typedArr).map(Number);
const toBigInt = value => BigInt(value); // eslint-disable-line no-undef

function createAnndataLoader(url, mapContents, path = 'X') {
  const store = createStoreFromMapContents(mapContents);
  const config = {
    url,
    fileType: 'obsFeatureMatrix.anndata.zarr',
    options: { path },
  };
  const source = new AnnDataSource({ ...config, store });
  return new ObsFeatureMatrixAnndataLoader(source, config);
}


const createMudataLoader = (url, mapContents) => {
  const store = createStoreFromMapContents(mapContents);
  const config = {
    url,
    fileType: 'obsFeatureMatrix.mudata.zarr',
    options: {
      path: 'mod/rna/X',
    },
  };
  const source = new MuDataSource({ ...config, store });
  return new ObsFeatureMatrixAnndataLoader(source, config);
};

describe('loaders/ObsFeatureMatrixAnndataLoader', () => {
  Object.entries({ 0.7: [anndata_0_7_DenseFixture, anndata_0_7_CsrFixture, anndata_0_7_CscFixture], 0.8: [anndata_0_8_DenseFixture, anndata_0_8_CsrFixture, anndata_0_8_CscFixture], 0.9: [anndata_0_9_DenseFixture, anndata_0_9_CsrFixture, anndata_0_9_CscFixture], '0.10': [anndata_0_10_DenseFixture, anndata_0_10_CsrFixture, anndata_0_10_CscFixture], 0.11: [anndata_0_11_DenseFixture, anndata_0_11_CsrFixture, anndata_0_11_CscFixture], 0.12: [anndata_0_12_DenseFixture, anndata_0_12_CsrFixture, anndata_0_12_CscFixture] }).forEach(([version, fixtures]) => {
    describe(`AnnData v${version}`, () => {
      const [denseFixture, csrFixture, cscFixture] = fixtures;
      const loaderCsr = createAnndataLoader(
        `@fixtures/zarr/anndata-${version}/anndata-csr${version !== '0.7' ? '.adata' : ''}.zarr`,
        csrFixture,
      );
      const loaderDense = createAnndataLoader(
        `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
        denseFixture,
      );
      const loaderCsc = createAnndataLoader(
        `@fixtures/zarr/anndata-${version}/anndata-csc.zarr`,
        cscFixture,
      );
      it('loadFilteredGeneNames returns gene names', async () => {
        const names = await loaderDense.loadFilteredGeneNames();
        expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
      });

      it('loadGeneSelection matches across storage methods', async () => {
        const selection = { selection: ['gene_1', 'gene_5'] };
        const csrSelection = await loaderCsr.loadGeneSelection(selection);
        const denseSelection = await loaderDense.loadGeneSelection(selection);
        const cscSelection = await loaderCsc.loadGeneSelection(selection);
        expect(cscSelection).toEqual(denseSelection);
        expect(csrSelection).toEqual(denseSelection);
      });

      it('loadCellXGene matches across storage methods', async () => {
        const csrMatrix = await loaderCsr.loadCellXGene();
        const denseMatrix = await loaderDense.loadCellXGene();
        const cscMatrix = await loaderCsc.loadCellXGene();
        expect(cscMatrix).toEqual(denseMatrix);
        expect(csrMatrix).toEqual(denseMatrix);
      });
      it('loadCellXGene matches across dtypes', async () => {
        const csrMatrix = await loaderCsr.loadCellXGene();
        const denseMatrix = await loaderDense.loadCellXGene();
        const cscMatrix = await loaderCsc.loadCellXGene();
        const getDataFromDtype = async (dtype) => {
          const loaderCsrDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csr${version !== '0.7' ? '.adata' : ''}.zarr`,
            csrFixture,
            `layers/${dtype}`,
          );
          const loaderDenseDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
            denseFixture,
            `layers/${dtype}`,
          );
          const loaderCscDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csc.zarr`,
            cscFixture,
            `layers/${dtype}`,
          );
          const csrMatrixDtype = await loaderCsrDtype.loadCellXGene();
          const denseMatrixDtype = await loaderDenseDtype.loadCellXGene();
          const cscMatrixDtype = await loaderCscDtype.loadCellXGene();
          return {
            csrMatrix: csrMatrixDtype,
            denseMatrix: denseMatrixDtype,
            cscMatrix: cscMatrixDtype,
          };
        };
        const dataInt32 = await getDataFromDtype('int32');
        const dataInt64 = await getDataFromDtype('int64');


        expect(toArray(cscMatrix)).toEqual(toArray(dataInt32.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt32.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt32.denseMatrix));
        expect(toArray(cscMatrix)).toEqual(toArray(dataInt64.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt64.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt64.denseMatrix));
      });

      it('loadCellXGeneSelection matches across dtypes', async () => {
        const selection = { selection: ['gene_1', 'gene_5'] };
        const csrMatrix = await loaderCsr.loadGeneSelection(selection);
        const denseMatrix = await loaderDense.loadGeneSelection(selection);
        const cscMatrix = await loaderCsc.loadGeneSelection(selection);
        const getDataFromDtype = async (dtype) => {
          const loaderCsrDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csr${version !== '0.7' ? '.adata' : ''}.zarr`,
            csrFixture,
            `layers/${dtype}`,
          );
          const loaderDenseDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
            denseFixture,
            `layers/${dtype}`,
          );
          const loaderCscDtype = createAnndataLoader(
            `@fixtures/zarr/anndata-${version}/anndata-csc.zarr`,
            cscFixture,
            `layers/${dtype}`,
          );
          const csrMatrixDtype = await loaderCsrDtype.loadGeneSelection(selection);
          const denseMatrixDtype = await loaderDenseDtype.loadGeneSelection(selection);
          const cscMatrixDtype = await loaderCscDtype.loadGeneSelection(selection);
          return {
            csrMatrix: csrMatrixDtype,
            denseMatrix: denseMatrixDtype,
            cscMatrix: cscMatrixDtype,
          };
        };
        const dataInt32 = await getDataFromDtype('int32');
        const dataInt64 = await getDataFromDtype('int64');


        expect(toArray(cscMatrix)).toEqual(toArray(dataInt32.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt32.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt32.denseMatrix));
        expect(toArray(cscMatrix)).toEqual(toArray(dataInt64.cscMatrix));
        expect(toArray(csrMatrix)).toEqual(toArray(dataInt64.csrMatrix));
        expect(toArray(denseMatrix)).toEqual(toArray(dataInt64.denseMatrix));
      });
    });
  });

  describe('MuData v0.2', () => {
    it('loadFilteredGeneNames returns gene names', async () => {
      const loader = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
        mudata_0_2_DenseFixture,
      );
      const names = await loader.loadFilteredGeneNames();
      expect(names).toEqual(Array.from({ length: 15 }).map((_, i) => `gene_${i}`));
    });

    it('loadGeneSelection matches across storage methods', async () => {
      const selection = { selection: ['gene_1', 'gene_5'] };
      const loaderCsr = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csr.zarr',
        mudata_0_2_CsrFixture,
      );
      const csrSelection = await loaderCsr.loadGeneSelection(selection);
      const loaderDense = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
        mudata_0_2_DenseFixture,
      );
      const denseSelection = await loaderDense.loadGeneSelection(selection);
      const loaderCsc = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csc.zarr',
        mudata_0_2_CscFixture,
      );
      const cscSelection = await loaderCsc.loadGeneSelection(selection);
      expect(cscSelection).toEqual(denseSelection);
      expect(csrSelection).toEqual(denseSelection);
    });

    it('loadCellXGene matches across storage methods', async () => {
      const loaderCsr = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csr.zarr',
        mudata_0_2_CsrFixture,
      );
      const csrMatrix = await loaderCsr.loadCellXGene();
      const loaderDense = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
        mudata_0_2_DenseFixture,
      );
      const denseMatrix = await loaderDense.loadCellXGene();
      const loaderCsc = createMudataLoader(
        '@fixtures/zarr/mudata-0.2/mudata-csc.zarr',
        mudata_0_2_CscFixture,
      );
      const cscMatrix = await loaderCsc.loadCellXGene();
      expect(cscMatrix).toEqual(denseMatrix);
      expect(csrMatrix).toEqual(denseMatrix);
    });
  });

  describe('size handling and the CSR column scan', () => {
    const CSR_URL = '@fixtures/zarr/anndata-0.11/anndata-csr.adata.zarr';
    const CSC_URL = '@fixtures/zarr/anndata-0.11/anndata-csc.zarr';
    const DENSE_URL = '@fixtures/zarr/anndata-0.11/anndata-dense.zarr';

    // The fixtures store X[i, j] = j for 3 cells and 15 genes.
    const NUM_CELLS = 3;
    const NUM_GENES = 15;
    const PATTERN = Array.from(
      { length: NUM_CELLS },
      () => Array.from({ length: NUM_GENES }, (_, j) => j),
    );

    const decodeJson = (fixture, key) => JSON.parse(atob(new Map(fixture).get(key)));

    // Replace one metadata document of a fixture, e.g. to fake a shape.
    function withOverride(fixture, key, value) {
      return [...fixture.filter(([k]) => k !== key), [key, btoa(JSON.stringify(value))]];
    }

    function createLoaderFromStore(store, options = { path: 'X' }) {
      const config = {
        url: '@fixtures/zarr/custom.zarr',
        fileType: 'obsFeatureMatrix.anndata.zarr',
        options,
      };
      const source = new AnnDataSource({ ...config, store });
      return new ObsFeatureMatrixAnndataLoader(source, config);
    }

    // A fixture store that records every key read, optionally holding reads of
    // matching keys until released.
    function createCountingStore(mapContents, gatePattern = null) {
      const inner = createStoreFromMapContents(mapContents);
      const reads = [];
      let release = () => {};
      const gate = new Promise((resolve) => { release = resolve; });
      const store = {
        async get(key) {
          reads.push(key);
          if (gatePattern && gatePattern.test(key)) {
            await gate;
          }
          return inner.get(key);
        },
      };
      return { store, reads, release: () => release() };
    }

    // Build a sparse X (zarr v3, written with zarrita) over the obs/var of a
    // fixture, with a chosen chunk size and pointer dtype, so that multi-chunk
    // and int64 code paths can be tested without new fixture files. Optionally
    // adds a uint8 var column usable as a feature filter.
    async function createSparseOverlayStore(baseFixture, {
      encoding, matrix, chunkSize, indexDtype = 'int32', dataDtype = 'float32', varFilter = null,
    }) {
      const numRows = matrix.length;
      const numCols = matrix[0].length;
      const indptr = [0];
      const indices = [];
      const data = [];
      if (encoding === 'csr_matrix') {
        matrix.forEach((rowValues) => {
          rowValues.forEach((value, col) => {
            if (value !== 0) {
              indices.push(col);
              data.push(value);
            }
          });
          indptr.push(indices.length);
        });
      } else {
        for (let col = 0; col < numCols; col += 1) {
          for (let row = 0; row < numRows; row += 1) {
            if (matrix[row][col] !== 0) {
              indices.push(row);
              data.push(matrix[row][col]);
            }
          }
          indptr.push(indices.length);
        }
      }
      const overlay = new Map();
      const root = zarrRoot(overlay);
      await zarrCreate(root.resolve('X'), {
        attributes: { 'encoding-type': encoding, 'encoding-version': '0.1.0', shape: [numRows, numCols] },
      });
      const TYPED = {
        int32: Int32Array,
        int64: BigInt64Array, // eslint-disable-line no-undef
        float32: Float32Array,
        float64: Float64Array,
        uint8: Uint8Array,
      };
      const writeArray = async (path, values, dataType, chunk) => {
        await zarrCreate(root.resolve(path), {
          shape: [values.length],
          chunkShape: [chunk],
          dtype: dataType,
          codecs: [{ name: 'bytes', configuration: { endian: 'little' } }],
          fillValue: 0,
        });
        // Write the chunk bytes directly (the bytes codec is little-endian raw
        // bytes), padding the trailing chunk the way a zarr writer would.
        const Ctor = TYPED[dataType];
        for (let c = 0; c * chunk < values.length; c += 1) {
          const typed = new Ctor(chunk);
          values.slice(c * chunk, (c + 1) * chunk).forEach((value, i) => {
            typed[i] = dataType === 'int64' ? toBigInt(value) : value;
          });
          overlay.set(`/${path}/c/${c}`, new Uint8Array(typed.buffer));
        }
      };
      await writeArray('X/indptr', indptr, indexDtype, indptr.length);
      await writeArray('X/indices', indices, indexDtype, chunkSize);
      await writeArray('X/data', data, dataDtype, chunkSize);
      if (varFilter) {
        await writeArray('var/highly_variable', varFilter.map(v => (v ? 1 : 0)), 'uint8', varFilter.length);
      }
      const base = createStoreFromMapContents(baseFixture);
      return {
        async get(key) {
          return overlay.has(key) ? overlay.get(key) : base.get(key);
        },
      };
    }

    afterEach(() => {
      vi.restoreAllMocks();
      delete window.performance.memory;
    });

    it('selects all-zero, repeated, and unknown features consistently across encodings', async () => {
      const warn = vi.spyOn(log, 'warn').mockImplementation(() => {});
      const selection = { selection: ['gene_0', 'gene_14', 'gene_5', 'gene_5', 'not_a_gene'] };
      const [csr, csc, dense] = await Promise.all([
        createAnndataLoader(CSR_URL, anndata_0_11_CsrFixture).loadGeneSelection(selection),
        createAnndataLoader(CSC_URL, anndata_0_11_CscFixture).loadGeneSelection(selection),
        createAnndataLoader(DENSE_URL, anndata_0_11_DenseFixture).loadGeneSelection(selection),
      ]);
      expect(csr.data.map(toArray)).toEqual(dense.data.map(toArray));
      expect(csc.data.map(toArray)).toEqual(dense.data.map(toArray));
      // gene_0 is all zeros in the fixtures; an unknown feature reports zeros too.
      expect(toArray(dense.data[0])).toEqual([0, 0, 0]);
      expect(toArray(dense.data[1])).toEqual([14, 14, 14]);
      expect(toArray(dense.data[4])).toEqual([0, 0, 0]);
      // One warning per loader for the unknown feature.
      expect(warn).toHaveBeenCalledTimes(3);
      expect(warn.mock.calls[0][0]).toContain('not_a_gene');
    });

    it('coalesces concurrent CSR selections into a single scan', async () => {
      const { store, reads } = createCountingStore(anndata_0_11_CsrFixture);
      const loader = createLoaderFromStore(store);
      const [a, b] = await Promise.all([
        loader.loadGeneSelection({ selection: ['gene_1'] }),
        loader.loadGeneSelection({ selection: ['gene_5', 'gene_1'] }),
      ]);
      expect(toArray(a.data[0])).toEqual([1, 1, 1]);
      expect(b.data.map(toArray)).toEqual([[5, 5, 5], [1, 1, 1]]);
      expect(reads.filter(key => key === '/X/indices/0').length).toEqual(1);
      expect(reads.filter(key => key === '/X/data/0').length).toEqual(1);
    });

    it('serves columns requested during a scan with one further scan', async () => {
      const { store, reads, release } = createCountingStore(
        anndata_0_11_CsrFixture, /\/X\/indices\/0$/,
      );
      const loader = createLoaderFromStore(store);
      const first = loader.loadGeneSelection({ selection: ['gene_1'] });
      // Wait until the first scan is blocked on its chunk read, then ask for more.
      await vi.waitFor(() => expect(reads).toContain('/X/indices/0'));
      const second = loader.loadGeneSelection({ selection: ['gene_2'] });
      const third = loader.loadGeneSelection({ selection: ['gene_3'] });
      await new Promise((resolve) => { setTimeout(resolve, 10); });
      release();
      const [a, b, c] = await Promise.all([first, second, third]);
      expect(toArray(a.data[0])).toEqual([1, 1, 1]);
      expect(toArray(b.data[0])).toEqual([2, 2, 2]);
      expect(toArray(c.data[0])).toEqual([3, 3, 3]);
      // The two later requests shared the second scan.
      expect(reads.filter(key => key === '/X/indices/0').length).toEqual(2);
    });

    it('refuses a CSR selection whose scan exceeds the budget, before reading any chunk', async () => {
      const zarray = decodeJson(anndata_0_11_CsrFixture, '/X/indices/.zarray');
      const fixture = withOverride(
        anndata_0_11_CsrFixture, '/X/indices/.zarray', { ...zarray, shape: [3e9] },
      );
      const { store, reads } = createCountingStore(fixture);
      const loader = createLoaderFromStore(store);
      const error = await loader.loadGeneSelection({ selection: ['gene_1'] }).catch(e => e);
      expect(error).toBeInstanceOf(MatrixTooLargeError);
      expect(error.name).toEqual('MatrixTooLargeError');
      expect(error.message).toContain('"X"');
      expect(error.message).toContain('3,000,000,000');
      expect(error.message).toContain('csc_matrix');
      expect(reads.filter(key => /\/X\/(indices|data)\/\d+$/.test(key))).toEqual([]);
    });

    it('applies the reported heap limit to the scan budget without caching the refusal', async () => {
      Object.defineProperty(window.performance, 'memory', {
        value: { jsHeapSizeLimit: 64 }, configurable: true,
      });
      const loader = createAnndataLoader(CSR_URL, anndata_0_11_CsrFixture);
      await expect(loader.loadGeneSelection({ selection: ['gene_1'] }))
        .rejects.toThrow(MatrixTooLargeError);
      delete window.performance.memory;
      // The same loader answers once the budget allows; nothing stuck in flight.
      const { data } = await loader.loadGeneSelection({ selection: ['gene_1'] });
      expect(toArray(data[0])).toEqual([1, 1, 1]);
    });

    it('warns, but still loads, a full matrix whose estimate exceeds the budget', async () => {
      const warn = vi.spyOn(log, 'warn').mockImplementation(() => {});
      Object.defineProperty(window.performance, 'memory', {
        value: { jsHeapSizeLimit: 64 }, configurable: true,
      });
      const [csr, csc, dense] = await Promise.all([
        createAnndataLoader(CSR_URL, anndata_0_11_CsrFixture).loadCellXGene(),
        createAnndataLoader(CSC_URL, anndata_0_11_CscFixture).loadCellXGene(),
        createAnndataLoader(DENSE_URL, anndata_0_11_DenseFixture).loadCellXGene(),
      ]);
      expect(csr).toEqual(dense);
      expect(csc).toEqual(dense);
      expect(warn).toHaveBeenCalledTimes(3);
      warn.mock.calls.forEach(([message]) => {
        expect(message).toContain('"X"');
        expect(message).toContain('[3, 15]');
        expect(message).toContain('initialFeatureFilterPath');
      });
    });

    it('reports a failed full-matrix allocation as a MatrixTooLargeError', async () => {
      vi.spyOn(log, 'warn').mockImplementation(() => {});
      const fixture = withOverride(anndata_0_11_CsrFixture, '/X/.zattrs', {
        'encoding-type': 'csr_matrix', 'encoding-version': '0.1.0', shape: [2 ** 20, 2 ** 20],
      });
      const { store, reads } = createCountingStore(fixture);
      const loader = createLoaderFromStore(store);
      const error = await loader.loadCellXGene().catch(e => e);
      expect(error).toBeInstanceOf(MatrixTooLargeError);
      expect(error.message).toContain('[1048576, 1048576]');
      expect(error.message).toContain('"X"');
      expect(error.message).toContain('initialFeatureFilterPath');
      // The allocation is attempted before any stored values are downloaded.
      expect(reads.filter(key => /\/X\/(indices|data)\/\d+$/.test(key))).toEqual([]);
    });

    it('does not cache a failed full-matrix load', async () => {
      const inner = createStoreFromMapContents(anndata_0_11_CsrFixture);
      let failed = false;
      const store = {
        async get(key) {
          if (!failed && key === '/X/data/0') {
            failed = true;
            throw new Error('transient');
          }
          return inner.get(key);
        },
      };
      const loader = createLoaderFromStore(store);
      await expect(loader.loadCellXGene()).rejects.toThrow('transient');
      const dense = await createAnndataLoader(DENSE_URL, anndata_0_11_DenseFixture).loadCellXGene();
      expect(await loader.loadCellXGene()).toEqual(dense);
    });

    [
      { encoding: 'csr_matrix', chunkSize: 4 },
      { encoding: 'csr_matrix', chunkSize: 5, indexDtype: 'int64', dataDtype: 'float64' },
      { encoding: 'csr_matrix', chunkSize: 1 },
      { encoding: 'csc_matrix', chunkSize: 4, indexDtype: 'int64' },
    ].forEach((variant) => {
      const label = `${variant.encoding} with ${variant.indexDtype || 'int32'} pointers in chunks of ${variant.chunkSize}`;
      it(`matches the dense matrix for ${label}`, async () => {
        const store = await createSparseOverlayStore(anndata_0_12_DenseFixture, {
          ...variant, matrix: PATTERN,
        });
        const loader = createLoaderFromStore(store);
        const dense = createAnndataLoader(
          '@fixtures/zarr/anndata-0.12/anndata-dense.zarr', anndata_0_12_DenseFixture,
        );
        const selection = { selection: ['gene_0', 'gene_1', 'gene_14', 'gene_7'] };
        const [sparseSelection, denseSelection] = await Promise.all([
          loader.loadGeneSelection(selection),
          dense.loadGeneSelection(selection),
        ]);
        expect(sparseSelection.data.map(toArray)).toEqual(denseSelection.data.map(toArray));
        const [sparseMatrix, denseMatrix] = await Promise.all([
          loader.loadCellXGene(),
          dense.loadCellXGene(),
        ]);
        expect(toArray(sparseMatrix.data)).toEqual(toArray(denseMatrix.data));
      });
    });

    it('loads an initialFeatureFilterPath subset of a CSR matrix without densifying it', async () => {
      const varFilter = Array.from({ length: NUM_GENES }, (_, j) => j % 2 === 0);
      const store = await createSparseOverlayStore(anndata_0_12_DenseFixture, {
        encoding: 'csr_matrix', chunkSize: 4, matrix: PATTERN, varFilter,
      });
      const options = { path: 'X', initialFeatureFilterPath: 'var/highly_variable' };
      const loader = createLoaderFromStore(store, options);
      const result = await loader.load();
      const expectedGenes = varFilter.flatMap((keep, j) => (keep ? [`gene_${j}`] : []));
      expect(result.data.featureIndex).toEqual(expectedGenes);
      // Row-major over the kept columns only.
      const expected = PATTERN.flatMap(rowValues => rowValues.filter((_, j) => varFilter[j]));
      expect(toArray(result.data.obsFeatureMatrix.data)).toEqual(expected);
    });
  });
});
