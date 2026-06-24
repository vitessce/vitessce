import { TileFetchingQueryKeys } from '@vitessce/constants-internal';
/**
 * Wraps a TiffPixelSource to route getTile through queryClient.fetchQuery,
 * enabling React Query to track image tile loading state via useIsFetching.
 */
export function createWrappedTiffPixelSource(pixelSource, queryClient) {
  // Proxy to intercept getTile calls and route them through React Query,
  // enabling useIsFetching to track tile loading state.
  return new Proxy(pixelSource, {
    get(target, prop) {
      if (prop === 'getTile') {
        return async ({ x, y, selection, signal }) => queryClient.fetchQuery({
          queryKey: [
            TileFetchingQueryKeys.TILE_QUERY_KEY_PREFIX,
            TileFetchingQueryKeys.TILE_QUERY_KEY_TYPE,
            x,
            y,
            selection],
          queryFn: () => target.getTile({ x, y, selection, signal }),
          gcTime: 0,
          staleTime: Infinity,
        });
      }
      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
