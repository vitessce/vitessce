// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import { root as zarrRoot, FetchStore, type Readable, type AsyncReadable, type AbsolutePath, type RangeQuery, extendStore, defineStoreExtension, withRangeCoalescing } from 'zarrita';
import type { ZipInfo } from 'unzipit';
import ZipFileStore from '@zarrita/storage/zip';
import ReferenceStore from '@zarrita/storage/ref';
import { HdfStore } from 'hdf5-as-virtual-zarr';
import { withGetRange } from './base-getrange.js';


// This allows returning `undefined` for 403 responses,
// as opposed to completely erroring.
// Needed due to https://github.com/manzt/zarrita.js/pull/212
// In the future, perhaps we could contribute a way to pass a
// custom error handling function or additional options
// to the zarrita FetchStore so that a subclass is not required.
// Reference: https://zarrita.dev/migration/v0.7.html
export async function relaxedFetch(...args: Parameters<typeof fetch>) {
  const response = await fetch(...args);
  if (response.status === 403) {
    return new Response(null, { status: 404 });
  }
  return response;
}

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
 * Request-option marker that makes CachedStore read straight through to the
 * wrapped store. Readers that stream a large array chunk by chunk (and never
 * revisit a chunk) set it so that the react-query cache does not retain the
 * whole array for CHUNK_GC_TIME. The marker rides on the zarrita request options
 * object, which zarrita passes through to the store unchanged; it is stripped
 * before the options reach the wrapped store (and therefore fetch).
 */
export const UNCACHED_READ = 'vitessceUncachedRead';

type ReadOptions = RequestInit & { [UNCACHED_READ]?: boolean };

/**
 * Separate the UNCACHED_READ marker from the options passed to the wrapped store.
 * @param opts Request options as received from zarrita.
 * @returns Whether the read bypasses the cache, and the options without the marker.
 */
function splitReadOptions(opts?: ReadOptions): [boolean, any] {
  if (!opts || !opts[UNCACHED_READ]) {
    return [false, opts];
  }
  const rest: ReadOptions = { ...opts };
  delete rest[UNCACHED_READ];
  return [true, rest];
}

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
      // Stores are only required to return a value that can be awaited, not
      // necessarily a native Promise (e.g. test fixture stores return synchronously),
      // so wrap with Promise.resolve before relying on `.finally`.
      promise = Promise.resolve(fn()).finally(() => {
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
export const withQueryClientCache = defineStoreExtension(
  (
    innerStore: AsyncReadable,
    extOpts: { cacheKeyPrefix: string, queryClient?: QueryClientLike },
  ) => {
    const { cacheKeyPrefix, queryClient } = extOpts;

    const cacheFetch = makeCacheFetch(queryClient);

    return {
      async get(...args: Parameters<typeof innerStore['get']>): Promise<Uint8Array | undefined> {
        const [key, opts] = args;
        const [uncached, rest] = splitReadOptions(opts as ReadOptions);
        if (uncached) {
          return innerStore.get(key, rest);
        }
        return cacheFetch(
          ['zarrStore', cacheKeyPrefix, key],
          () => innerStore.get(key, rest),
        );
      },
      async getRange(...args: Parameters<NonNullable<typeof innerStore['getRange']>>): Promise<Uint8Array | undefined> {
        const [key, range, opts] = args;
        const [uncached, rest] = splitReadOptions(opts as ReadOptions);

        // Assume the store has already been extended via withGetRange.
        if (typeof innerStore.getRange !== 'function') {
          throw new Error('innerStore does not implement getRange');
        }

        if (uncached) {
          return innerStore.getRange(key, range, rest);
        }
        return cacheFetch(
          ['zarrStore', cacheKeyPrefix, key, range],
          () => {
            if (typeof innerStore.getRange !== 'function') {
              throw new Error('innerStore does not implement getRange');
            }
            return innerStore.getRange(key, range, rest);
          },
        );
      },
    };
  },
);

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


export function applyStoreExtensions(
  store: AsyncReadable,
  url: string,
  queryClient?: QueryClientLike,
) {
  // ExtendStore can be called non-async when no async extensions are used.
  // Reference: https://github.com/manzt/zarrita.js/blob/80c1babcc11217aee643f3305d3176f9576016a8/packages/zarrita/src/extension/extend.ts#L33
  return extendStore(
    store,
    // Ensure getRange is implemented (required by withRangeCoalescing).
    withGetRange,
    // Concurrent getRange calls for the same key (e.g. sharded chunks)
    // within a single microtask are merged into fewer, larger range requests.
    (s: AsyncReadable) => withRangeCoalescing(s),
    // Wrap remote stores in a read-through cache, so that concurrent reads of the
    // same chunk (e.g. multiple embedding dims within one chunk column-block) share
    // one request instead of downloading it once per reader.
    (s: AsyncReadable) => withQueryClientCache(
      s,
      { cacheKeyPrefix: url, queryClient },
    ),
  );
}


/**
 * Wrap a promise of a store in a store that can be used synchronously,
 * waiting for the inner store on each read.
 * @param storePromise A promise that resolves to a store.
 * @returns A store that delegates to the resolved store.
 */
function createLazyStore(storePromise: Promise<AsyncReadable>): AsyncReadable {
  // Ensure the inner store implements getRange (falling back to get if needed).
  const innerStorePromise = storePromise.then(innerStore => withGetRange(innerStore));
  return {
    async get(...args: Parameters<AsyncReadable['get']>) {
      const innerStore = await innerStorePromise;
      return innerStore.get(...args);
    },
    async getRange(...args: Parameters<NonNullable<AsyncReadable['getRange']>>) {
      const innerStore = await innerStorePromise;
      if (typeof innerStore.getRange !== 'function') {
        throw new Error('innerStore does not implement getRange');
      }
      return innerStore.getRange(...args);
    },
  };
}

/**
 * Create a store for reading byte ranges from a single file via HTTP range requests.
 * Every key resolves to the file itself; the key is ignored.
 * This is the "source" format expected by HdfStore.fromStore, which reads
 * the HDF5 file via source.getRange("/", { offset, length }).
 * (Note: FetchStore cannot be used directly, since it would resolve
 * the key "/" to the URL with a trailing slash appended.)
 * @param url The URL of the file.
 * @param requestInit Optional request init options for fetch.
 * @returns A store for the file.
 */
function createSingleFileStore(url: string, requestInit?: RequestInit): AsyncReadable {
  async function fetchBytes(range: RangeQuery | null, opts?: RequestInit) {
    const headers = new Headers(requestInit?.headers);
    new Headers(opts?.headers).forEach((value, name) => headers.set(name, value));
    if (range) {
      headers.set('Range', 'suffixLength' in range
        ? `bytes=-${range.suffixLength}`
        : `bytes=${range.offset}-${range.offset + range.length - 1}`);
    }
    const response = await fetch(url, { ...requestInit, ...opts, headers });
    if (response.status === 404 || response.status === 403) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`Unexpected response status ${response.status} ${response.statusText} for ${url}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
  return {
    async get(_key: AbsolutePath, opts?: RequestInit) {
      return fetchBytes(null, opts);
    },
    async getRange(_key: AbsolutePath, range: RangeQuery, opts?: RequestInit) {
      return fetchBytes(range, opts);
    },
  };
}

/**
 * Create a store for an H5AD file, using a pre-computed reference spec JSON file.
 * @param url The URL of the H5AD file.
 * @param refSpecUrl The URL of the reference spec JSON file.
 * @param requestInit Optional request init options for fetch.
 * @returns A promise that resolves to the store.
 */
function createReferenceStore(
  url: string,
  refSpecUrl: string,
  requestInit?: RequestInit,
): Promise<AsyncReadable> {
  const referenceSpecPromise = fetch(refSpecUrl)
    .then(res => res.json())
    .then((referenceSpec) => {
      // Reference specs are either version 0 (a flat object of references)
      // or version 1 (references nested under a `refs` property).
      // Reference: https://fsspec.github.io/kerchunk/spec.html
      const isVersion1 = referenceSpec.version === 1 && typeof referenceSpec.refs === 'object';
      const refs = isVersion1 ? referenceSpec.refs : referenceSpec;
      // We want the references to point to our `url` regardless
      // of what target URL(s) are specified in the reference spec JSON.
      // Note: we cannot use the ReferenceStore `target` option for this, since
      // as of @zarrita/storage v0.2.0 the target is also used as the base URL
      // from which reference keys are parsed, so keys would not be found.
      const newRefs = Object.fromEntries(
        Object.entries(refs).map(([key, entry]) => {
          if (Array.isArray(entry) && entry.length >= 1) {
            return [key, [url, ...entry.slice(1)]];
          }
          return [key, entry];
        }),
      );
      return isVersion1 ? { ...referenceSpec, refs: newRefs } : newRefs;
    });
  // When given a Promise, ReferenceStore.fromSpec returns a Promise<ReferenceStore>
  // (as of @zarrita/storage v0.2.0).
  return ReferenceStore.fromSpec(referenceSpecPromise, { overrides: requestInit });
}

export function zarrOpenRoot(url: string, fileType: null | string, opts?: ZarrOpenRootOptions) {
  let store: any;
  if (fileType && fileType.endsWith('.zip')) {
    store = ZipFileStore.fromUrl(url, {
      overrides: opts?.requestInit,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      transformEntries: transformEntriesForZipFileStore,
    });
  } else if (fileType && fileType.endsWith('.h5ad')) {
    // zarrOpenRoot must return synchronously, so the H5AD store
    // (which must be initialized asynchronously) is wrapped in a lazy store.
    if (opts?.refSpecUrl) {
      // A pre-computed reference spec avoids parsing the HDF5 metadata in the browser.
      store = createLazyStore(createReferenceStore(url, opts.refSpecUrl, opts.requestInit));
    } else {
      // Parse the HDF5 file metadata on the fly to expose the H5AD file as a Zarr (v3) store.
      // Concurrent small byte-range reads of the HDF5 file (issued while parsing
      // its metadata) are coalesced into fewer, larger range requests.
      // (The source is internal to HdfStore, so it does not pass through
      // applyStoreExtensions and needs its own coalescing wrapper.)
      const hdfSource = withRangeCoalescing(createSingleFileStore(url, opts?.requestInit));
      store = createLazyStore(HdfStore.fromStore(hdfSource));
    }
  } else {
    store = new FetchStore(url, { overrides: opts?.requestInit, fetch: relaxedFetch });
  }

  const extendedStore = applyStoreExtensions(store, url, opts?.queryClient);
  return zarrRoot(extendedStore);
}
