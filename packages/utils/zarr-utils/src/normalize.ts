// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import { root as zarrRoot, FetchStore, type Readable, type AbsolutePath, type RangeQuery } from 'zarrita';
import type { ZipInfo } from 'unzipit';
import ZipFileStore from '@zarrita/storage/zip';
import ReferenceStore from '@zarrita/storage/ref';
import { getDebugMode } from '@vitessce/globals';

// The subset of a TanStack Query QueryClient that the store cache uses. Typed
// structurally so this package does not need a dependency on @tanstack/query-core;
// the instance is created by vit-s and threaded through the DataSource constructor.
export type QueryClientLike = {
  fetchQuery: (options: {
    queryKey: unknown[],
    queryFn: () => Promise<unknown>,
    staleTime?: number,
    gcTime?: number,
  }) => Promise<unknown>,
};

type ZarrOpenRootOptions = {
  requestInit?: RequestInit,
  refSpecUrl?: string,
  queryClient?: QueryClientLike,
};

// How long a fetched chunk stays in the react-query cache once no fetch is using it.
// Chunks are large binary blobs, so retention is kept short: the important effect is
// that concurrent reads of the same chunk share one request (and one decode input);
// re-reads within a brief window are a bonus, not the goal.
const CHUNK_GC_TIME = 30_000;

// react-query does not allow `undefined` as query data, but zarrita stores return
// `undefined` for missing keys, so a sentinel stands in for it inside the cache.
const UNDEFINED_SENTINEL = null;

type CacheFetchFn = (
  cacheKey: unknown[],
  fn: () => Promise<Uint8Array | undefined>,
) => Promise<Uint8Array | undefined>;

/**
 * Build the function through which all cached store reads flow.
 * @param queryClient A QueryClient, when available.
 * @returns With a queryClient: reads go through fetchQuery, which coalesces
 * concurrent requests for the same key and retains results briefly — and, because
 * the cache lives on the client rather than the store instance, is shared across
 * store instances for the same URL. Without one: a local in-flight map that
 * coalesces concurrent requests and retains nothing.
 */
function makeCacheFetch(queryClient?: QueryClientLike): CacheFetchFn {
  if (queryClient) {
    return async (cacheKey, fn) => {
      const result = await queryClient.fetchQuery({
        queryKey: cacheKey,
        queryFn: async () => (await fn()) ?? UNDEFINED_SENTINEL,
        staleTime: Infinity,
        gcTime: CHUNK_GC_TIME,
      });
      return (result === UNDEFINED_SENTINEL ? undefined : result) as Uint8Array | undefined;
    };
  }
  const inflight = new Map<string, Promise<Uint8Array | undefined>>();
  return (cacheKey, fn) => {
    const key = JSON.stringify(cacheKey);
    let promise = inflight.get(key);
    if (!promise) {
      promise = fn().finally(() => {
        inflight.delete(key);
      });
      inflight.set(key, promise);
    }
    return promise;
  };
}

/**
 * A read-through cache around a zarrita store. Concurrent reads of the same
 * (key, range) share one underlying request; see makeCacheFetch for retention.
 */
export class CachedStore {
  store: Readable;

  cacheKeyPrefix: string;

  cacheFetch: CacheFetchFn;

  getRange?: (
    key: AbsolutePath, range: RangeQuery, opts?: RequestInit,
  ) => Promise<Uint8Array | undefined>;

  constructor(store: Readable, cacheKeyPrefix: string, queryClient?: QueryClientLike) {
    this.store = store;
    this.cacheKeyPrefix = cacheKeyPrefix;
    this.cacheFetch = makeCacheFetch(queryClient);
    // getRange is part of zarrita's optional store interface and consumers
    // feature-detect it, so only define it when the wrapped store has one.
    if (typeof (store as { getRange?: unknown }).getRange === 'function') {
      this.getRange = (key, range, opts) => this.cacheFetch(
        ['zarrStore', this.cacheKeyPrefix, key, range],
        () => (this.store as {
          getRange: (
            k: AbsolutePath, r: RangeQuery, o?: RequestInit,
          ) => Promise<Uint8Array | undefined>,
        }).getRange(key, range, opts),
      );
    }
  }

  get(key: AbsolutePath, opts?: RequestInit): Promise<Uint8Array | undefined> {
    return this.cacheFetch(
      ['zarrStore', this.cacheKeyPrefix, key],
      async () => this.store.get(key, opts),
    );
  }
}

class RelaxedFetchStore extends FetchStore {
  // This allows returning `undefined` for 403 responses,
  // as opposed to completely erroring.
  // Needed due to https://github.com/manzt/zarrita.js/pull/212
  // In the future, perhaps we could contribute a way to pass a
  // custom error handling function or additional options
  // to the zarrita FetchStore so that a subclass is not required.
  async get(
    key: AbsolutePath,
    options: RequestInit = {},
  ): Promise<Uint8Array | undefined> {
    try {
      return await super.get(key, options);
    } catch (e: any) {
      // TODO: request/contribute a custom error class
      // to avoid string comparisons in the future.
      if (
        e?.message?.startsWith('Unexpected response status 403')
        && !getDebugMode()
      ) {
        return undefined;
      }
      throw e;
    }
  }

  async getRange(
    key: AbsolutePath,
    range: RangeQuery,
    options: RequestInit = {},
  ): Promise<Uint8Array | undefined> {
    try {
      return await super.getRange(key, range, options);
    } catch (e: any) {
      if (
        e?.message?.startsWith('Unexpected response status 403')
        && !getDebugMode()
      ) {
        return undefined;
      }
      throw e;
    }
  }
}

// Define a transformEntries function that expects a single top-level .zarr directory
// and strips that prefix from all entries.
export function transformEntriesForZipFileStore(entries: ZipInfo['entries']) {
  // Find all top-level directories that end with .zarr
  const topLevelZarrDirectories = new Set(
    Object.keys(entries)
      .map(k => k.split('/')[0])
      .filter(firstPathItem => firstPathItem?.endsWith('.zarr')),
  );
  if (topLevelZarrDirectories.size === 0) {
    return entries;
  }
  // Check that there is exactly one such directory.
  if (topLevelZarrDirectories.size > 1) {
    throw Error('expected exactly one top-level .zarr directory');
  }
  const topLevelZarrDirectory = Array.from(topLevelZarrDirectories)[0];
  // Modify the entries to strip the top-level .zarr directory prefix from paths.
  const newEntries = Object.fromEntries(
    Object.entries(entries).map(([k, v]) => {
      let newKey = k;
      if (k.split('/')[0] === topLevelZarrDirectory) {
        // Use substring to remove the top-level directory name
        // and the following slash from the internal zip paths.
        newKey = k.substring(topLevelZarrDirectory.length + 1);
      }
      return [newKey, v];
    }),
  );
  return newEntries;
}

export function zarrOpenRoot(url: string, fileType: null | string, opts?: ZarrOpenRootOptions) {
  let store: Readable;
  if (fileType && fileType.endsWith('.zip')) {
    store = ZipFileStore.fromUrl(url, {
      overrides: opts?.requestInit,
      transformEntries: transformEntriesForZipFileStore,
    });
  } else if (fileType && fileType.endsWith('.h5ad')) {
    if (!opts?.refSpecUrl) {
      throw new Error('refSpecUrl is required for H5AD files');
    }
    const referenceSpecPromise = fetch(opts.refSpecUrl)
      .then(res => res.json())
      .then(referenceSpec => Object.fromEntries(
        // We want ReferenceStore.fromSpec to use our `target` URL option regardless
        // of what target URL(s) are specified in the reference spec JSON.
        // Reference: https://github.com/manzt/zarrita.js/pull/155
        Object.entries(referenceSpec).map(([key, entry]) => {
          if (Array.isArray(entry) && entry.length >= 1) {
            // eslint-disable-next-line no-param-reassign
            entry[0] = null;
          }
          return [key, entry];
        }),
      ));
    store = ReferenceStore.fromSpec(referenceSpecPromise,
      { target: url, overrides: opts?.requestInit });
  } else {
    store = new RelaxedFetchStore(url, { overrides: opts?.requestInit });
  }

  // Wrap remote stores in a read-through cache, so that concurrent reads of the
  // same chunk (e.g. multiple embedding dims within one chunk column-block) share
  // one request instead of downloading it once per reader.
  return zarrRoot(new CachedStore(store, url, opts?.queryClient));
}
