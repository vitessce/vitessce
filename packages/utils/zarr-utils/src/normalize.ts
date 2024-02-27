// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import type { Readable } from '@zarrita/storage';
import { root as zarrRoot, FetchStore } from 'zarrita';
import { ZipFileStore } from '@zarrita/storage';


export function zarrOpenRoot(
  url: string, fileType: null | string, requestInit: RequestInit
) {
  let store: Readable;
  if(fileType && fileType.endsWith('.zip')) {
    store = ZipFileStore.fromUrl(url, { overrides: requestInit });
  } else {
    store = new FetchStore(url, { overrides: requestInit });
  }

  // Wrap remote stores in a cache
  return zarrRoot(store);
}
