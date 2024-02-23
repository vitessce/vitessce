// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import type { Readable } from '@zarrita/storage';
import { root as zarrRoot, FetchStore } from 'zarrita';
import { ZipFileStore, ReferenceStore } from '@zarrita/storage';

export async function zarrOpenRoot(url: string, requestInit: RequestInit) {
  let store: Readable;
  if(url.endsWith('.zip')) {
    store = ZipFileStore.fromUrl(url);
  } else if(url.endsWith('.json')) {
    const referenceRes = await fetch(url);
    const referenceSpec = await referenceRes.json();
    store = await ReferenceStore.fromSpec(referenceSpec);
  } else {
    store = new FetchStore(url, { overrides: requestInit });
  }

  // Wrap remote stores in a cache
  return zarrRoot(store);
}
