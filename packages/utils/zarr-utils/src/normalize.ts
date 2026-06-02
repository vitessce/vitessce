// Adapted from https://github.com/hms-dbmi/vizarr/blob/5b0e3ea6fbb42d19d0e38e60e49bb73d1aca0693/src/utils.ts#L26
import { root as zarrRoot, FetchStore, type Readable, type AbsolutePath } from 'zarrita';
import type { ZipInfo } from 'unzipit';
import ZipFileStore from '@zarrita/storage/zip';
import ReferenceStore from '@zarrita/storage/ref';
import { getDebugMode } from '@vitessce/globals';

type ZarrOpenRootOptions = {
  requestInit?: RequestInit,
  refSpecUrl?: string,
};

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

  // Wrap remote stores in a cache
  return zarrRoot(store);
}
