/* eslint-disable camelcase, no-underscore-dangle */
import { describe, it, expect } from 'vitest';
import { root as zarrRoot, create as zarrCreate, set as zarrSet } from 'zarrita';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import AnnDataSource from './AnnDataSource.js';
import anndata_0_7_DenseFixture from './json-fixtures/anndata-0.7/anndata-dense.json';
import anndata_0_8_DenseFixture from './json-fixtures/anndata-0.8/anndata-dense.json';
import anndata_0_9_DenseFixture from './json-fixtures/anndata-0.9/anndata-dense.json';
import anndata_0_10_DenseFixture from './json-fixtures/anndata-0.10/anndata-dense.json';
import anndata_0_11_DenseFixture from './json-fixtures/anndata-0.11/anndata-dense.json';
import anndata_0_12_DenseFixture from './json-fixtures/anndata-0.12/anndata-dense.json';


describe('sources/AnnDataSource', () => {
  Object.entries({ 0.7: anndata_0_7_DenseFixture, 0.8: anndata_0_8_DenseFixture, 0.9: anndata_0_9_DenseFixture, '0.10': anndata_0_10_DenseFixture, 0.11: anndata_0_11_DenseFixture, 0.12: anndata_0_12_DenseFixture }).forEach(([version, fixture]) => {
    describe(`AnnData v${version}`, () => {
      it('getJson returns json', async () => {
        const dataSource = new AnnDataSource({
          url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
          store: createStoreFromMapContents(fixture),
        });
        const zAttrs = await dataSource.getJson('obs/.zattrs');
        expect(Object.keys(zAttrs).sort()).toEqual([
          '_index',
          'column-order',
          'encoding-type',
          'encoding-version',
        ].sort());
      });

      it('loadObsColumns returns ids for location in store', async () => {
        const dataSource = new AnnDataSource({
          url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
          store: createStoreFromMapContents(fixture),
        });
        const ids = await dataSource.loadObsColumns(['obs/leiden']);
        expect(ids).toEqual([['1', '1', '2']]);
      });

      it('loadObsIndex returns names', async () => {
        const dataSource = new AnnDataSource({
          url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
          store: createStoreFromMapContents(fixture),
        });
        const names = await dataSource.loadObsIndex();
        expect(names).toEqual(['CTG', 'GCA', 'ACG']);
      });
    });
  });
});

describe('AnnDataSource.loadNumericForDims', () => {
  // Wrap the fixture store so that every chunk read is counted.
  function createCountingStore(fixture) {
    const inner = createStoreFromMapContents(fixture);
    const calls = [];
    return {
      calls,
      store: {
        get: (key, opts) => {
          calls.push(key);
          return inner.get(key, opts);
        },
      },
    };
  }

  it('reads each chunk once for contiguous dims', async () => {
    const { store, calls } = createCountingStore(anndata_0_12_DenseFixture);
    const dataSource = new AnnDataSource({
      url: '@fixtures/zarr/anndata-0.12/anndata-dense.zarr',
      store,
    });
    const result = await dataSource.loadNumericForDims('obsm/X_umap', [0, 1]);
    expect(result.shape).toEqual([2, 3]);
    expect(Array.from(result.data[0])).toEqual([-1, 0, 1]);
    expect(Array.from(result.data[1])).toEqual([-1, 0, 1]);
    // Both dims live in the single chunk 0.0; the contiguous-slice path
    // must read it exactly once rather than once per dim.
    const chunkReads = calls.filter(key => /X_umap\/(c\/0\/0|0\.0)$/.test(key));
    expect(chunkReads.length).toEqual(1);
  });

  it('returns the same data for non-contiguous dims via the per-dim path', async () => {
    const dataSource = new AnnDataSource({
      url: '@fixtures/zarr/anndata-0.12/anndata-dense.zarr',
      store: createStoreFromMapContents(anndata_0_12_DenseFixture),
    });
    // Both umap columns, requested in descending order: still a contiguous run.
    const descending = await dataSource.loadNumericForDims('obsm/X_umap', [1, 0]);
    expect(Array.from(descending.data[0])).toEqual([-1, 0, 1]);
    expect(Array.from(descending.data[1])).toEqual([-1, 0, 1]);
    // A single dim exercises the per-dim path (max - min + 1 === 1 === length,
    // so it takes the slice path; a duplicated dim forces per-dim).
    const duplicated = await dataSource.loadNumericForDims('obsm/X_umap', [1, 1]);
    expect(Array.from(duplicated.data[0])).toEqual([-1, 0, 1]);
    expect(Array.from(duplicated.data[1])).toEqual([-1, 0, 1]);
  });
});

describe('AnnDataSource.loadObsColumnCodes', () => {
  Object.entries({ 0.7: anndata_0_7_DenseFixture, 0.8: anndata_0_8_DenseFixture, 0.9: anndata_0_9_DenseFixture, '0.10': anndata_0_10_DenseFixture, 0.11: anndata_0_11_DenseFixture, 0.12: anndata_0_12_DenseFixture }).forEach(([version, fixture]) => {
    it(`decodes to the same strings as loadObsColumns for AnnData v${version}`, async () => {
      const dataSource = new AnnDataSource({
        url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
        store: createStoreFromMapContents(fixture),
      });
      const result = await dataSource.loadObsColumnCodes('obs/leiden');
      expect(result).not.toEqual(null);
      const { codes, categories } = result;
      const decoded = Array.from(codes).map(code => categories[code]);
      const [expected] = await dataSource.loadObsColumns(['obs/leiden']);
      expect(decoded).toEqual(expected);
    });
  });

  it('returns null for a non-categorical column', async () => {
    const dataSource = new AnnDataSource({
      url: '@fixtures/zarr/anndata-0.8/anndata-dense.zarr',
      store: createStoreFromMapContents(anndata_0_8_DenseFixture),
    });
    expect(await dataSource.loadObsColumnCodes('obs/_index')).toEqual(null);
  });

  it('caches the promise per column path', async () => {
    const dataSource = new AnnDataSource({
      url: '@fixtures/zarr/anndata-0.8/anndata-dense.zarr',
      store: createStoreFromMapContents(anndata_0_8_DenseFixture),
    });
    const first = dataSource.loadObsColumnCodes('obs/leiden');
    const second = dataSource.loadObsColumnCodes('obs/leiden');
    expect(first).toBe(second);
    expect((await first).codes).toBe((await second).codes);
  });
});

describe('AnnDataSource metadata caching', () => {
  // Wrap the fixture store so that every read is counted.
  function createCountingStore(fixture) {
    const inner = createStoreFromMapContents(fixture);
    const calls = [];
    return {
      calls,
      store: {
        get: (key, opts) => {
          calls.push(key);
          return inner.get(key, opts);
        },
      },
    };
  }
  const isMetadataKey = key => /\.z(attrs|array|group)$/.test(key);

  it('reads each metadata document at most once per data source', async () => {
    const { store, calls } = createCountingStore(anndata_0_11_DenseFixture);
    const dataSource = new AnnDataSource({
      url: '@fixtures/zarr/anndata-0.11/anndata-dense.zarr',
      store,
    });
    // Loading a categorical column both reads attributes and opens arrays on
    // the same nodes; through the per-path node cache each metadata document
    // is still requested only once.
    const column = await dataSource._loadColumn('obs/leiden');
    expect(column).toEqual(['1', '1', '2']);
    const metaAfterFirst = calls.filter(isMetadataKey);
    expect(new Set(metaAfterFirst).size).toEqual(metaAfterFirst.length);
    // Repeating the load, and re-reading attributes directly, adds no reads.
    await dataSource._loadColumn('obs/leiden');
    await dataSource.getJson('obs/leiden/.zattrs');
    expect(calls.filter(isMetadataKey).length).toEqual(metaAfterFirst.length);
  });

  it('does not cache a failed open, so a retry reaches the store again', async () => {
    const { store, calls } = createCountingStore(anndata_0_11_DenseFixture);
    const dataSource = new AnnDataSource({
      url: '@fixtures/zarr/anndata-0.11/anndata-dense.zarr',
      store,
    });
    await expect(dataSource.getJson('obs/missing/.zattrs')).rejects.toThrow();
    const probesAfterFirst = calls.filter(key => key.includes('missing')).length;
    expect(probesAfterFirst).toBeGreaterThan(0);
    await expect(dataSource.getJson('obs/missing/.zattrs')).rejects.toThrow();
    expect(calls.filter(key => key.includes('missing')).length)
      .toBeGreaterThan(probesAfterFirst);
  });
});

describe('AnnDataSource.loadNumericForDims chunk-layout routing', () => {
  it('reads each chunk once and skips unrequested columns on a column-chunked array', async () => {
    const overlay = new Map();
    const root = zarrRoot(overlay);
    const numRows = 6;
    const values = Float32Array.from({ length: numRows * 3 }, (_, i) => i);
    const arr = await zarrCreate(root.resolve('obsm/X_test'), {
      shape: [numRows, 3],
      // One column per chunk, three row-chunks per column: the layout where
      // the contiguous-slice route only adds 2D assembly overhead.
      chunk_shape: [2, 1],
      data_type: 'float32',
      codecs: [{ name: 'bytes', configuration: { endian: 'little' } }],
      fill_value: 0,
    });
    await zarrSet(arr, [null, null], {
      data: values, shape: [numRows, 3], stride: [3, 1],
    });
    const calls = [];
    const store = {
      get: (key) => {
        calls.push(key);
        return overlay.get(key);
      },
    };
    const dataSource = new AnnDataSource({
      url: '@fixtures/zarr/generated/column-chunked.zarr',
      store,
    });
    const result = await dataSource.loadNumericForDims('obsm/X_test', [0, 1]);
    expect(result.shape).toEqual([2, numRows]);
    expect(Array.from(result.data[0])).toEqual([0, 3, 6, 9, 12, 15]);
    expect(Array.from(result.data[1])).toEqual([1, 4, 7, 10, 13, 16]);
    const chunkCalls = calls.filter(key => key.includes('/c/'));
    // Every requested chunk exactly once, and column 2 never touched.
    expect(new Set(chunkCalls).size).toEqual(chunkCalls.length);
    expect(chunkCalls.length).toEqual(6);
    expect(chunkCalls.filter(key => key.endsWith('/2')).length).toEqual(0);
  });
});
