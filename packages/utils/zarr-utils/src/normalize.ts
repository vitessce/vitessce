// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import type { Readable } from '@zarrita/storage';
import { root as zarrRoot, FetchStore } from 'zarrita';
import ZipFileStore from '@zarrita/storage/zip';
import ReferenceStore from '@zarrita/storage/ref';

type ZarrOpenRootOptions = {
  requestInit?: RequestInit,
  refSpecUrl?: string,
};

export function zarrOpenRoot(url: string, fileType: null | string, opts?: ZarrOpenRootOptions) {
  let store: Readable;
  if (fileType && fileType.endsWith('.zip')) {
    store = ZipFileStore.fromUrl(url, { overrides: opts?.requestInit });
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
    store = new FetchStore(url, { overrides: opts?.requestInit });
  }

  // Wrap remote stores in a cache
  return zarrRoot(store);
}
