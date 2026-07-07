// Reusable in-memory Zarr fixtures for the v2/v3 migration test suite.
//
// The v3 store is written with zarrita's real writer; the v2 store is built by
// hand (metadata only) so tests prove our code reads genuine v2 metadata files
// without depending on their names. Both are AnnData-shaped so the same
// fixtures can back config generation and raster tests.
import { create, root } from 'zarrita';

/**
 * Minimal in-memory Zarr store implementing the zarrita Readable + Mutable
 * surface (get / set / delete), backed by a Map of absolute path to bytes.
 */
export class MemStore {
  private readonly data = new Map<string, Uint8Array>();

  async get(key: string): Promise<Uint8Array | undefined> {
    return this.data.get(key);
  }

  async has(key: string): Promise<boolean> {
    return this.data.has(key);
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  /** Synchronous raw byte write, for hand-built fixtures. */
  put(key: string, value: Uint8Array): void {
    this.data.set(key, value);
  }
}

const enc = (o: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(o));

/** AnnData obs dataframe attributes, shared by both fixture versions. */
export const OBS_ATTRS = {
  'column-order': ['cell_type'],
  _index: 'index',
  'encoding-type': 'dataframe',
  'encoding-version': '0.2.0',
};

/**
 * Build a Zarr v3 AnnData-shaped store using zarrita's writer.
 * Contains: root (attrs foo=bar), /obs (dataframe group), /obsm/X_umap (array),
 * /X (array). Note: no /obsm/X_pca — used to assert absence.
 */
export async function makeV3AnnDataStore(): Promise<MemStore> {
  const store = new MemStore();
  await create(root(store), { attributes: { foo: 'bar' } });
  await create(root(store).resolve('obs'), { attributes: OBS_ATTRS });
  await create(root(store).resolve('obsm/X_umap'), {
    shape: [10, 2], chunk_shape: [10, 2], data_type: 'float32',
  });
  await create(root(store).resolve('X'), {
    shape: [10, 5], chunk_shape: [10, 5], data_type: 'float32',
  });
  return store;
}

const V2_GROUP = { zarr_format: 2 };
const v2Array = (shape: number[]) => ({
  zarr_format: 2,
  shape,
  chunks: shape,
  dtype: '<f4', // deliberately v2-style: helper must surface this as "float32"
  compressor: null,
  fill_value: 0,
  order: 'C',
  filters: null,
});

/**
 * Build a Zarr v2 AnnData-shaped store by hand (metadata only). Mirrors the v3
 * fixture's hierarchy. Pass `{ consolidated: true }` to also emit a valid
 * `.zmetadata` (zarr_consolidated_format: 1) for the listable-store path.
 */
export function makeV2AnnDataStore(
  { consolidated = false }: { consolidated?: boolean } = {},
): MemStore {
  const store = new MemStore();
  const files: Record<string, unknown> = {
    '.zgroup': V2_GROUP,
    '.zattrs': { foo: 'bar' },
    'obs/.zgroup': V2_GROUP,
    'obs/.zattrs': OBS_ATTRS,
    'obsm/.zgroup': V2_GROUP,
    'obsm/X_umap/.zarray': v2Array([10, 2]),
    'X/.zarray': v2Array([10, 5]),
  };
  for (const [key, value] of Object.entries(files)) {
    store.put(`/${key}`, enc(value));
  }
  if (consolidated) {
    store.put('/.zmetadata', enc({ zarr_consolidated_format: 1, metadata: files }));
  }
  return store;
}

/** A v2 store whose `.zmetadata` exists but is not a valid consolidated doc. */
export function makeV2StoreWithMalformedConsolidated(): MemStore {
  const store = makeV2AnnDataStore();
  store.put('/.zmetadata', enc({ not: 'a valid consolidated manifest' }));
  return store;
}
