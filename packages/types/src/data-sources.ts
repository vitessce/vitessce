import type { Readable } from 'zarrita';

/**
 * The subset of a TanStack Query QueryClient that data sources use, typed
 * structurally so that consumers do not need a dependency on @tanstack/query-core.
 */
export type QueryClientLike = {
  fetchQuery: (options: {
    queryKey: unknown[],
    queryFn: (ctx?: unknown) => Promise<unknown>,
    staleTime?: number,
    gcTime?: number,
    meta?: Record<string, unknown>,
  }) => Promise<unknown>,
};

export type DataSourceParams = {
  url?: string;
  /** Options to pass to fetch calls. */
  requestInit?: RequestInit;
  /** A Zarrita store object. */
  store?: Readable;
  /** The file type. */
  fileType: string;
  /** A react-query QueryClient, used for request coalescing and caching. */
  queryClient?: QueryClientLike;
}
