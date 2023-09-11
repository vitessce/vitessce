// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import * as zarr from '@zarrita/core';
import { FetchStore, Readable } from '@zarrita/storage';
import { lru } from './lru-store.js';


export async function openLru(url: string, requestInit: RequestInit) {
  const store: Readable = new FetchStore(url, { overrides: requestInit });

  // Wrap remote stores in a cache
  return zarr.root(lru(store));
}