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
  try {
    maybeListable = await tryWithConsolidated(store);
  } catch {
    maybeListable = store;
  }
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
    throw e;
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
  const arr = await open(path ? loc.resolve(path) : loc, { kind: 'array' });
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
    throw e;
  }
}
