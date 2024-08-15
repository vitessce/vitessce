// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import type { Readable } from '@zarrita/storage';
import { root as zarrRoot, FetchStore } from 'zarrita';
import { ZipFileStore } from '@zarrita/storage';


export function zarrOpenRoot(
  url: string,
  fileType: null | string,
  requestInit: RequestInit | undefined,
) {
  let store: Readable;
  const opts = requestInit ? { overrides: requestInit } : undefined;
  if (fileType && fileType.endsWith('.zip')) {
    store = ZipFileStore.fromUrl(url, opts);
  } else {
    store = new FetchStore(url, opts);
  }

  // Wrap remote stores in a cache
  return zarrRoot(store);
}
