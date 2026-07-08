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
  Object.entries(files).forEach(([key, value]) => {
    store.put(`/${key}`, enc(value));
  });
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


/**
 * A v3 store using the (unratified) inline consolidated-metadata proposal:
 * a `consolidated_metadata.metadata` object embedded directly in the root's
 * own `zarr.json`, rather than a v2-style side-car `.zmetadata` file.
 * zarrita 0.6.1 has no native support for this format; `openListableRoot`
 * parses it itself (see `tryV3InlineConsolidated` in hierarchy.ts).
 */
export function makeV3StoreWithInlineConsolidated(): MemStore {
  const store = new MemStore();
  const obsMeta = {
    zarr_format: 3,
    node_type: 'group',
    attributes: OBS_ATTRS,
  };
  const umapMeta = {
    zarr_format: 3,
    node_type: 'array',
    shape: [10, 2],
    chunk_grid: { name: 'regular', configuration: { chunk_shape: [10, 2] } },
    chunk_key_encoding: { name: 'default', configuration: { separator: '/' } },
    data_type: 'float32',
    fill_value: 0,
    codecs: [{ name: 'bytes' }],
    attributes: {},
  };
  const xMeta = {
    zarr_format: 3,
    node_type: 'array',
    shape: [10, 5],
    chunk_grid: { name: 'regular', configuration: { chunk_shape: [10, 5] } },
    chunk_key_encoding: { name: 'default', configuration: { separator: '/' } },
    data_type: 'float32',
    fill_value: 0,
    codecs: [{ name: 'bytes' }],
    attributes: {},
  };
  const rootMeta = {
    zarr_format: 3,
    node_type: 'group',
    attributes: { foo: 'bar' },
    consolidated_metadata: {
      kind: 'inline',
      must_understand: false,
      metadata: {
        obs: obsMeta,
        'obsm/X_umap': umapMeta,
        X: xMeta,
      },
    },
  };
  store.put('/zarr.json', enc(rootMeta));
  return store;
}


/**
 * A v3 store shaped like a Zarr pyramid: sequential numeric resolution-level
 * arrays ('0', '1', '2'), with no consolidated metadata at all. Written with
 * zarrita's real writer, so this is a genuine (non-hand-built) v3 store.
 */
export async function makePyramidStore(numLevels: number): Promise<MemStore> {
  const store = new MemStore();
  await create(root(store), { attributes: {} });
  await Promise.all(Array.from({ length: numLevels }, (_, i) => create(
    root(store).resolve(String(i)),
    { shape: [10, 10], chunk_shape: [10, 10], data_type: 'uint8' },
  )));
  return store;
}

/**
 * A v2 store with one array whose dtype zarrita cannot parse (a structured/
 * recarray dtype, e.g. as Scanpy's `rank_genes_groups` can produce), built by
 * hand since zarrita's own writer can't emit this dtype shape either. Used to
 * exercise the "node exists but fails to open" error path
 * (ZarrUnsupportedNodeError), distinct from a genuinely missing node.
 */
export function makeStoreWithUnsupportedDtype(): MemStore {
  const store = new MemStore();
  store.put('/.zgroup', enc({ zarr_format: 2 }));
  store.put('/weird/.zarray', enc({
    zarr_format: 2,
    shape: [2],
    chunks: [2],
    dtype: [['f0', '<f4'], ['f1', '<i4']], // structured dtype -- zarrita can't parse this
    compressor: null,
    fill_value: 0,
    order: 'C',
    filters: null,
  }));
  return store;
}
