import { root as zarrRoot, FetchStore } from 'zarrita';
import { ZipFileStore } from '@zarrita/storage';
export function zarrOpenRoot(url, fileType, requestInit) {
    let store;
    const opts = requestInit ? { overrides: requestInit } : undefined;
    if (fileType && fileType.endsWith('.zip')) {
        store = ZipFileStore.fromUrl(url, opts);
    }
    else {
        store = new FetchStore(url, opts);
    }
    // Wrap remote stores in a cache
    return zarrRoot(store);
}
