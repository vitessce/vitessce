// Version-independent helpers for reading Zarr hierarchy state.
//
// This module serves as a bridge , that is, it allows compatibility-critical code (config
// generation, raster discovery)  to inspect a Zarr store without depending on v2
// metadata file names (.zattrs / .zarray / .zgroup / .zmetadata). Everything
// here routes through zarrita, which resolves `.zattrs`/`.zarray` on v2 stores
// and `zarr.json` on v3 stores transparently.
import {
  open,
  root,
  tryWithConsolidated,
  NodeNotFoundError,
  type Location,
  type Listable,
} from 'zarrita';
import type { Readable } from '@zarrita/storage';
import { ZarrNodeNotFoundError, ZarrUnsupportedNodeError } from '@vitessce/error';

/** A node entry as reported by consolidated metadata. */
export interface NodeEntry {
    /** Absolute path within the store, e.g. "/obsm/X_umap". */
    path: string;
    kind: 'array' | 'group';
}

function stripLeadingSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path;
}
/**
 * Try each metadata key in order, returning the first successfully-parsed
 * listable store, or `null` if none work. Written recursively rather than as
 * a loop so each attempt can `await` sequentially (a `.forEach()` callback
 * can't be awaited in sequence, and can't early-exit at all) without
 * tripping the no-loop-statements lint rule.
 */
async function tryConsolidatedWithKeys(
  store: Readable,
  metadataKeys: string[],
): Promise<Listable<Readable> | null> {
  const [metadataKey, ...rest] = metadataKeys;
  if (metadataKey === undefined) return null;
  try {
    const listable = await tryWithConsolidated(store, { metadataKey });
    if ('contents' in listable) {
      return listable as Listable<Readable>;
    }
  } catch {
    // Malformed/unsupported manifest under this key -- try the next one.
  }
  return tryConsolidatedWithKeys(store, rest);
}

/**
 * Zarr v3 has a separate, unratified proposal for consolidated metadata
 * (zarr-specs#309, implemented experimentally by zarr-python): rather than a
 * side-car file like v2's `.zmetadata`, the root's own `zarr.json` carries a
 * `consolidated_metadata.metadata` object inline. zarrita 0.6.1's
 * `tryWithConsolidated` only understands the v2 side-car format, so a v3
 * store using this convention would otherwise always fall through to plain
 * node-by-node probing -- silently missing any node whose name isn't on a
 * caller's fixed candidate list (e.g. a custom obsm embedding name).
 *
 * This parses that inline format ourselves and synthesizes a
 * zarrita-`Listable`-compatible wrapper, so it gets the same fast,
 * complete-enumeration path as v2 consolidated stores.
 *
 * @returns A `Listable<Readable>` if the root has valid v3 inline
 *   consolidated metadata, or `null` otherwise (including on any parse
 *   failure -- callers fall back to plain probing in that case).
 */
async function tryV3InlineConsolidated(store: Readable): Promise<Listable<Readable> | null> {
  let bytes;
  try {
    bytes = await store.get('/zarr.json');
  } catch {
    return null;
  }
  if (!bytes) return null;

  let rootMeta: Record<string, unknown>;
  try {
    rootMeta = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
  const inline = rootMeta.consolidated_metadata as { metadata?: Record<string, unknown> }
    | undefined;
  if (rootMeta.zarr_format !== 3 || !inline || typeof inline.metadata !== 'object') {
    return null;
  }

  const known: Record<string, unknown> = { '/zarr.json': rootMeta };
  Object.entries(inline.metadata).forEach(([path, meta]) => {
    known[`/${path}/zarr.json`] = meta;
  });
  const encoder = new TextEncoder();

  return {
    async get(key: string, opts?: unknown) {
      if (key in known) {
        return encoder.encode(JSON.stringify(known[key]));
      }
      return store.get(key as `/${string}`, opts as never);
    },
    getRange: store.getRange?.bind(store),
    contents() {
      return Object.entries(known)
        .filter(([key]) => key.endsWith('/zarr.json'))
        .map(([key, meta]) => {
          const path = key.slice(0, -'/zarr.json'.length) || '/';
          const kind = (meta as { node_type?: string }).node_type === 'array' ? 'array' : 'group';
          return { path, kind };
        });
    },
  } as unknown as Listable<Readable>;
}

/**
   * Open a store as a *listable* root when consolidated metadata is present
   * (v2 `.zmetadata` or a v3 consolidated `zarr.json`), falling back to the plain
   * store otherwise. This is the drop-in replacement for manual
   * `fetch('.../.zmetadata')` calls.
   *
   * @returns The zarrita root `Location` plus a `contents` manifest (normalized
   *   node entries) when the store is listable, or `null` contents otherwise.
   */
export async function openListableRoot(
  store: Readable,
): Promise<{ root: Location<Readable>; contents: NodeEntry[] | null }> {
  // `tryWithConsolidated` only falls back to the plain store when the metadata
  // is *absent* (NodeNotFoundError). A `.zmetadata` that exists but is malformed
  // or an unsupported consolidated format causes it to throw. We degrade to the
  // plain store in that case too, so odd stores fall through to node probing
  // rather than failing outright (matching the historical 404-tolerant behavior).
  let maybeListable: Readable | Listable<Readable> = store;
  let listed = false;

  const consolidated = await tryConsolidatedWithKeys(store, ['.zmetadata', 'zmetadata']);
  if (consolidated) {
    maybeListable = consolidated;
    listed = true;
  } else {
    // zarrita has no built-in support for Zarr v3's (unratified) inline
    // consolidated-metadata proposal -- see the doc comment on
    // `tryV3InlineConsolidated` above.
    const v3Listable = await tryV3InlineConsolidated(store);
    if (v3Listable) {
      maybeListable = v3Listable;
      listed = true;
    }
  }
  if (!listed) maybeListable = store;
  const contents = 'contents' in maybeListable
    ? (maybeListable as Listable<Readable>)
      .contents()
      .map(({ path, kind }) => ({ path, kind }))
    : null;
  return { root: root(maybeListable) as Location<Readable>, contents };
}

/** Version-independent existence check for a node at `path`. */
export async function nodeExists(
  loc: Location<Readable>,
  path?: string,
): Promise<boolean> {
  try {
    await open(path ? loc.resolve(path) : loc);
    return true;
  } catch (e) {
    if (e instanceof NodeNotFoundError) return false;
    throw e;
  }
}

/**
   * Version-independent attribute access. Returns `{}` for a missing node rather
   * than throwing, mirroring the historical `.zattrs`-fetch semantics that
   * callers relied on.
   */
export async function getAttrs(
  loc: Location<Readable>,
  path?: string,
): Promise<Record<string, unknown>> {
  try {
    const node = await open(path ? loc.resolve(path) : loc);
    return (node.attrs ?? {}) as Record<string, unknown>;
  } catch (e) {
    if (e instanceof NodeNotFoundError) return {};
    throw new ZarrUnsupportedNodeError(
      `Zarr node at "${path ?? loc.path}" exists but could not be opened (unsupported dtype or codec?).`,
      { cause: e },
    );
  }
}

/**
   * Version-independent array metadata.
   *
   * NOTE: `dtype` is whatever zarrita reports, which is already normalized to
   * v3-style names (e.g. "uint8", "float32", "v2:object") for BOTH v2 and v3
   * stores. Callers must NOT re-map from v2 conventions like "|u1"/"<f4".
   */
export async function getArrayMeta(
  loc: Location<Readable>,
  path?: string,
): Promise<{
    dtype: string;
    shape: number[];
    chunks: number[];
    attrs: Record<string, unknown>;
  }> {
  let arr;
  try {
    arr = await open(path ? loc.resolve(path) : loc, { kind: 'array' });
  } catch (e) {
    if (e instanceof NodeNotFoundError) {
      throw new ZarrNodeNotFoundError(`Zarr array not found at "${path ?? loc.path}".`, { cause: e });
    }
    throw new ZarrUnsupportedNodeError(
      `Zarr array at "${path ?? loc.path}" exists but could not be opened (unsupported dtype or codec?).`,
      { cause: e },
    );
  }
  return {
    dtype: arr.dtype as string,
    shape: [...arr.shape],
    chunks: [...arr.chunks],
    attrs: (arr.attrs ?? {}) as Record<string, unknown>,
  };
}

/**
   * Given a set of candidate child paths under a group, return those that exist.
   *
   * Replaces v2 patterns that enumerated children either by parsing `.zmetadata`
   * keys or by fetching hardcoded `.zarray`/`.zattrs` files. When a consolidated
   * `contents` manifest is available, we filter it in-memory (no network
   * round-trips); otherwise each candidate is probed via zarrita.
   */
export async function findExistingPaths(
  loc: Location<Readable>,
  candidates: string[],
  contents: NodeEntry[] | null = null,
): Promise<string[]> {
  if (contents) {
    const known = new Set(contents.map(({ path }) => stripLeadingSlash(path)));
    return candidates.filter(c => known.has(stripLeadingSlash(c)));
  }
  const results = await Promise.all(
    candidates.map(async c => ((await nodeExists(loc, c)) ? c : null)),
  );
  return results.filter((c): c is string => c !== null);
}

/**
 * Version-independent node lookup returning both `kind` and `attrs`, or `null`
 * if the node doesn't exist. Useful when a caller needs to know whether a node
 * exists at all (as opposed to `getAttrs`, which can't distinguish "missing
 * node" from "node exists with empty attrs").
 */
export async function getNode(
  loc: Location<Readable>,
  path?: string,
): Promise<{ kind: 'array' | 'group'; attrs: Record<string, unknown> } | null> {
  try {
    const node = await open(path ? loc.resolve(path) : loc);
    return { kind: node.kind, attrs: (node.attrs ?? {}) as Record<string, unknown> };
  } catch (e) {
    if (e instanceof NodeNotFoundError) return null;
    throw new ZarrUnsupportedNodeError(
      `Zarr node at "${path ?? loc.path}" exists but could not be opened (unsupported dtype or codec?).`,
      { cause: e },
    );
  }
}

/**
 * Recursively probes '0', '1', '2', ... stopping at the first missing index.
 * Written recursively to avoid no-loop-statements lint rule.
 */
async function discoverSequentialLevels(loc: Location<Readable>, index: number):
  Promise<string[]> {
  const candidate = String(index);
  const exists = await nodeExists(loc, candidate);
  if (!exists) return [];
  const rest = await discoverSequentialLevels(loc, index + 1);
  return [candidate, ...rest];
}

/**
 * Discover Zarr pyramid resolution-level array paths.
 *
 * When a consolidated manifest is available, this is a fast in-memory filter
 * over every array node (matching the historical `.zmetadata`-key-scan
 * behavior). Otherwise, it probes sequential
 * numeric names ('0', '1', '2', ...) until one is missing: the general
 * Zarr/OME-NGFF pyramid-level naming convention, used here as a
 * non-consolidated correctness baseline. Consolidated metadata is only
 * an optimization
 */
export async function discoverPyramidLevels(
  loc: Location<Readable>,
  contents: NodeEntry[] | null = null,
): Promise<string[]> {
  if (contents) {
    return contents
      .filter(({ kind }) => kind === 'array')
      .map(({ path }) => stripLeadingSlash(path));
  }
  return discoverSequentialLevels(loc, 0);
}
