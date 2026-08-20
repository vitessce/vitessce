import { describe, it, expect } from 'vitest';
import { open } from 'zarrita';
import { ZarrNodeNotFoundError, ZarrUnsupportedNodeError } from '@vitessce/error';
import {
  openListableRoot,
  nodeExists,
  getAttrs,
  getArrayMeta,
  getNode,
  findExistingPaths,
  discoverPyramidLevels,
} from './hierarchy.js';
import {
  makeV2AnnDataStore,
  makeV3AnnDataStore,
  makeV2StoreWithMalformedConsolidated,
  makeV3StoreWithInlineConsolidated,
  makePyramidStore,
  makeStoreWithUnsupportedDtype,
  makeSpatialDataV3Store,
  type MemStore,
} from './test-fixtures.js';

// To make sure every helper behaves identically whether the
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

  it('reads Zarr v3\'s inline consolidated_metadata extension (no support in zarrita 0.6.1)',
    async () => {
    // zarrita 0.6.1 only understands v2-style `.zmetadata` files.
    // A v3 store using the separate, unratified inline-consolidation proposal
    // (zarr-specs#309) would otherwise silently fall back to plain probing,
    // missing any node not on a caller's fixed candidate list.
      const store = makeV3StoreWithInlineConsolidated();
      const { root, contents } = await openListableRoot(store);
      expect(contents).not.toBeNull();
      const paths = (contents ?? []).map(c => c.path);
      expect(paths).toContain('/obsm/X_umap');
      expect(paths).toContain('/X');
      const found = await findExistingPaths(
        root,
        ['obsm/X_umap', 'obsm/X_pca', 'X'],
        contents,
      );
      expect(found).toEqual(['obsm/X_umap', 'X']);
    });
});


describe('discoverPyramidLevels', () => {
  it('uses the consolidated manifest when available', async () => {
    const store = makeV2AnnDataStore({ consolidated: true });
    const { root, contents } = await openListableRoot(store);
    expect(contents).not.toBeNull();
    // makeV2AnnDataStore's only arrays are obsm/X_umap and X -- neither is a
    // numeric pyramid-level name, which is fine: the consolidated path
    // returns every array node without assuming any particular naming.
    const levels = await discoverPyramidLevels(root, contents);
    expect(levels.sort()).toEqual(['X', 'obsm/X_umap'].sort());
  });

  it('falls back to sequential numeric probing without a manifest (no .zarray/.zattrs assumptions)', async () => {
    // A genuine v3 pyramid store with no consolidated metadata - this is
    // the fallback path that must still work correctly on its own.
    const store = await makePyramidStore(3);
    const { root, contents } = await openListableRoot(store);
    expect(contents).toBeNull();
    const levels = await discoverPyramidLevels(root, contents);
    expect(levels).toEqual(['0', '1', '2']);
  });

  it('stops probing at the first missing level', async () => {
    const store = await makePyramidStore(1);
    const { root, contents } = await openListableRoot(store);
    const levels = await discoverPyramidLevels(root, contents);
    expect(levels).toEqual(['0']);
  });

  it('returns an empty array when even level 0 is missing', async () => {
    const store = await makePyramidStore(0);
    const { root, contents } = await openListableRoot(store);
    const levels = await discoverPyramidLevels(root, contents);
    expect(levels).toEqual([]);
  });
});

describe('differentiated error semantics by failure mode', () => {
  it('getArrayMeta throws ZarrNodeNotFoundError for a genuinely missing node', async () => {
    const store = await makeV3AnnDataStore();
    const { root } = await openListableRoot(store);
    await expect(getArrayMeta(root, 'does_not_exist')).rejects.toThrow(ZarrNodeNotFoundError);
  });

  it('getNode throws ZarrUnsupportedNodeError (not a not-found error) for a node that exists but fails to open', async () => {
    const store = makeStoreWithUnsupportedDtype();
    const { root } = await openListableRoot(store);
    await expect(getNode(root, 'weird')).rejects.toThrow(ZarrUnsupportedNodeError);
    // Specifically NOT the not-found error -- the node is present, just unreadable.
    await expect(getNode(root, 'weird')).rejects.not.toThrow(ZarrNodeNotFoundError);
  });

  it('getAttrs throws ZarrUnsupportedNodeError for the same unopenable node', async () => {
    const store = makeStoreWithUnsupportedDtype();
    const { root } = await openListableRoot(store);
    await expect(getAttrs(root, 'weird')).rejects.toThrow(ZarrUnsupportedNodeError);
  });

  it('getArrayMeta throws ZarrUnsupportedNodeError for the same unopenable node', async () => {
    const store = makeStoreWithUnsupportedDtype();
    const { root } = await openListableRoot(store);
    await expect(getArrayMeta(root, 'weird')).rejects.toThrow(ZarrUnsupportedNodeError);
  });

  it('getAttrs returns {} (not an error) for a missing node -- distinct from an unopenable one', async () => {
    const store = makeStoreWithUnsupportedDtype();
    const { root } = await openListableRoot(store);
    await expect(getAttrs(root, 'does_not_exist')).resolves.toEqual({});
  });
});

// test for inline consolidated metadata (issue #2370)
describe('a real SpatialData-shaped v3 store with inline consolidated metadata', () => {
  it('discovers every node (images, labels, shapes, tables) via the inline manifest', async () => {
    const store = await makeSpatialDataV3Store();
    const { contents } = await openListableRoot(store);
    expect(contents).not.toBeNull();
    const paths = (contents ?? []).map(c => c.path);
    expect(paths).toEqual(expect.arrayContaining([
      '/images/raw_image',
      '/labels/segmentation_mask',
      '/shapes/nucleus_boundaries',
      '/tables/table',
      '/tables/table/obs',
      '/tables/table/X',
    ]));
  });

  it('reads attrs for SpatialData-specific and nested AnnData-table conventions', async () => {
    const store = await makeSpatialDataV3Store();
    const { root } = await openListableRoot(store);
    expect(await getAttrs(root)).toMatchObject({ 'spatialdata-attrs': { version: '0.4' } });
    expect(await getAttrs(root, 'shapes/nucleus_boundaries')).toMatchObject({ 'encoding-type': 'ngff:shapes' });
    expect(await getAttrs(root, 'tables/table')).toMatchObject({ 'encoding-type': 'anndata' });
    expect(await getAttrs(root, 'tables/table/obs')).toMatchObject({ 'column-order': ['region'] });
  });

  it('reads real array metadata for image, label, and table arrays', async () => {
    const store = await makeSpatialDataV3Store();
    const { root } = await openListableRoot(store);
    const image = await getArrayMeta(root, 'images/raw_image');
    expect(image.dtype).toBe('uint16');
    expect(image.shape).toEqual([3, 100, 100]);
    const labels = await getArrayMeta(root, 'labels/segmentation_mask');
    expect(labels.dtype).toBe('uint32');
    const x = await getArrayMeta(root, 'tables/table/X');
    expect(x.shape).toEqual([5, 10]);
  });

  it('reads real chunk data through the synthesized listable store, not just metadata', async () => {
    const store = await makeSpatialDataV3Store();
    const { root: r } = await openListableRoot(store);
    const arr = await open(r.resolve('images/raw_image'), { kind: 'array' });
    const chunk = await arr.getChunk([0, 0, 0]);
    expect(chunk.shape).toEqual([3, 50, 50]);
  });
});
