// The subset of a TanStack Query QueryClient that the store cache and
// fetchQueryWithSignal use. Typed structurally so this package does not need
// a dependency on @tanstack/query-core; the instance is created by vit-s and
// threaded through the DataSource constructor.
// Must be kept compatible with QueryClientLike in @vitessce/types.
export type QueryClientLike = {
  fetchQuery: (options: {
    queryKey: unknown[],
    queryFn?: (context?: { signal?: AbortSignal }) => Promise<unknown>,
    staleTime?: number,
    gcTime?: number,
    meta?: Record<string, unknown>,
  }) => Promise<unknown>,
  cancelQueries?: (filters: { queryKey: unknown[], exact?: boolean }) => Promise<void>,
};

type FetchQueryOptions = Parameters<QueryClientLike['fetchQuery']>[0];

// Number of in-flight fetchQueryWithSignal callers, per query client and query key hash.
const callerCountsByClient = new WeakMap<QueryClientLike, Map<string, number>>();

/**
 * Serialize a query key, sorting the keys of objects
 * (as TanStack Query does when hashing query keys).
 * @param queryKey The query key.
 * @returns The query key hash.
 */
function hashQueryKey(queryKey: unknown[]): string {
  return JSON.stringify(queryKey, (_, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return Object.fromEntries(
        Object.keys(val).sort().map(k => [k, (val as Record<string, unknown>)[k]]),
      );
    }
    return val;
  });
}

/**
 * Call queryClient.fetchQuery, allowing the caller to stop waiting via an AbortSignal.
 *
 * Concurrent fetchQuery calls with the same query key share one request,
 * so one caller aborting must not abort the request for the others.
 * Instead, when the signal is aborted, only this caller's promise rejects
 * (with signal.reason). Once every caller of an in-flight query has aborted,
 * the query is cancelled, which aborts the query function's own signal
 * (the `signal` property of the queryFn context). Query functions should
 * pass that signal (not the signal of a particular caller)
 * to fetch requests and to any nested fetchQueryWithSignal calls.
 *
 * Callers without a signal are also counted, so the query will not be
 * cancelled while they are waiting on it.
 * @param queryClient The query client.
 * @param options The fetchQuery options.
 * @param signal An optional AbortSignal for this caller.
 * @returns The query data.
 */
export function fetchQueryWithSignal<T = unknown>(
  queryClient: QueryClientLike,
  options: FetchQueryOptions,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

  let callerCounts = callerCountsByClient.get(queryClient);
  if (!callerCounts) {
    callerCounts = new Map();
    callerCountsByClient.set(queryClient, callerCounts);
  }
  const counts = callerCounts;
  const hash = hashQueryKey(options.queryKey);
  counts.set(hash, (counts.get(hash) ?? 0) + 1);

  let isRegistered = true;
  // Returns true if this was the last caller waiting on the query.
  const unregister = () => {
    if (!isRegistered) {
      return false;
    }
    isRegistered = false;
    const remainingCount = (counts.get(hash) ?? 1) - 1;
    if (remainingCount > 0) {
      counts.set(hash, remainingCount);
      return false;
    }
    counts.delete(hash);
    return true;
  };

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      if (unregister()) {
        // No other callers are waiting on this query,
        // so cancel it to abort the underlying request.
        // (This is a no-op if the query has already settled.)
        queryClient.cancelQueries?.({ queryKey: options.queryKey, exact: true });
      }
      reject(signal?.reason);
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    const onSettled = () => {
      signal?.removeEventListener('abort', onAbort);
      unregister();
    };

    let queryPromise;
    try {
      queryPromise = Promise.resolve(queryClient.fetchQuery(options));
    } catch (e) {
      queryPromise = Promise.reject(e);
    }
    queryPromise.then(
      (data) => {
        onSettled();
        resolve(data as T);
      },
      (error) => {
        onSettled();
        reject(error);
      },
    );
  });
}
