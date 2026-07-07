import { describe, it, expect } from 'vitest';
import {
  openListableRoot,
  nodeExists,
  getAttrs,
  getArrayMeta,
  findExistingPaths,
} from './hierarchy.js';
import {
  makeV2AnnDataStore,
  makeV3AnnDataStore,
  makeV2StoreWithMalformedConsolidated,
  type MemStore,
} from './test-fixtures.js';

// The core guarantee of #2452: every helper behaves identically whether the
// underlying store is Zarr v2 or v3. We run one shared suite against both.
describe.each([
  ['v2', () => makeV2AnnDataStore()],
  ['v3', () => makeV3AnnDataStore()],
])('hierarchy helpers on a %s store', (_version, makeStore) => {
  it('reads root attributes without a metadata-file name', async () => {
    const { root } = await openListableRoot(await makeStore());
    expect(await getAttrs(root)).toMatchObject({ foo: 'bar' });
  });

  it('reads nested group attributes (obs dataframe)', async () => {
    const { root } = await openListableRoot(await makeStore());
    const obsAttrs = await getAttrs(root, 'obs');
    expect(obsAttrs['column-order']).toEqual(['cell_type']);
    expect(obsAttrs['encoding-type']).toBe('dataframe');
  });

  it('returns {} for a missing node rather than throwing', async () => {
    const { root } = await openListableRoot(await makeStore());
    expect(await getAttrs(root, 'obsm/does_not_exist')).toEqual({});
  });

  it('resolves node existence for present and absent paths', async () => {
    const { root } = await openListableRoot(await makeStore());
    expect(await nodeExists(root, 'obsm/X_umap')).toBe(true);
    expect(await nodeExists(root, 'obsm/X_pca')).toBe(false);
  });

  it('surfaces array dtype in v3-normalized form (never v2 "<f4"/"|u1")', async () => {
    const { root } = await openListableRoot(await makeStore());
    const meta = await getArrayMeta(root, 'obsm/X_umap');
    expect(meta.dtype).toBe('float32');
    expect(meta.shape).toEqual([10, 2]);
    expect(meta.chunks).toEqual([10, 2]);
  });

  it('discovers existing children among candidates', async () => {
    const { root, contents } = await openListableRoot(await makeStore());
    const found = await findExistingPaths(
      root,
      ['obsm/X_umap', 'obsm/X_pca', 'X'],
      contents,
    );
    expect(found).toEqual(['obsm/X_umap', 'X']);
  });
});

describe('consolidated metadata handling', () => {
  it('exposes a contents manifest when valid consolidated metadata exists', async () => {
    const store = makeV2AnnDataStore({ consolidated: true });
    const { contents } = await openListableRoot(store);
    expect(contents).not.toBeNull();
    const paths = (contents ?? []).map(c => c.path);
    expect(paths).toContain('/obsm/X_umap');
    expect(paths).toContain('/X');
  });

  it('discovers paths from the manifest without per-node probing', async () => {
    const store = makeV2AnnDataStore({ consolidated: true });
    const { root, contents } = await openListableRoot(store);
    expect(contents).not.toBeNull();
    const found = await findExistingPaths(
      root,
      ['obsm/X_umap', 'obsm/X_pca', 'X'],
      contents,
    );
    expect(found).toEqual(['obsm/X_umap', 'X']);
  });

  it('degrades to probing (does not throw) when .zmetadata is malformed', async () => {
    const store = makeV2StoreWithMalformedConsolidated();
    const { root, contents } = await openListableRoot(store);
    // Malformed manifest -> no listable contents, but probing still works.
    expect(contents).toBeNull();
    expect(await nodeExists(root, 'obsm/X_umap')).toBe(true);
    const found = await findExistingPaths(root, ['obsm/X_umap', 'X'], contents);
    expect(found).toEqual(['obsm/X_umap', 'X']);
  });

  it('falls back to probing on a v3 store (no v2-style consolidated manifest)', async () => {
    const store: MemStore = await makeV3AnnDataStore();
    const { contents } = await openListableRoot(store);
    expect(contents).toBeNull();
  });
});