// @ts-check
import { zarrOpenRoot } from '@vitessce/zarr-utils';
import { open as zarrOpen, root as zarrRoot } from 'zarrita';

/** @import { Location as ZarrLocation } from '@zarrita/core' */
/** @import { Readable } from '@zarrita/storage' */

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class ZarrDataSource {
  /**
   * 
   * @param {object} params The parameters object.
   * @param {string|undefined} params.url The URLto the root of the store.
   * @param {RequestInit|undefined} params.requestInit Options to pass to fetch calls.
   * @param {Readable|undefined} params.store A Zarrita store object.
   * @param {string} params.fileType The file type.
   */
  constructor({ url, requestInit, store, fileType }) {
    if (store) {
      // TODO: check here that it is a valid Zarrita Readable?
      this.storeRoot = zarrRoot(store);
    } else if(url) {
      this.storeRoot = zarrOpenRoot(url, fileType, requestInit);
    } else {
      throw new Error('Either a store or a URL must be provided to the ZarrDataSource constructor.');
    }
  }

  /**
   * 
   * @param {string} path 
   * @returns {ZarrLocation<Readable>}
   */
  getStoreRoot(path) {
    return this.storeRoot.resolve(path);
  }

  /**
   * Method for accessing JSON attributes, relative to the store root.
   * @param {string} key A path to the item.
   * @param {ZarrLocation<Readable>|null} storeRootParam An optional location,
   * which if provided will override the default store root.
   * @returns {Promise<any>} This async function returns a promise
   * that resolves to the parsed JSON if successful.
   * @throws This may throw an error.
   */
  async getJson(key, storeRootParam = null) {
    const { storeRoot } = this;

    const storeRootToUse = storeRootParam || storeRoot;

    let dirKey = key;
    // TODO: update calls to not include these file names in the first place.
    if (key.endsWith('.zattrs') || key.endsWith('.zarray') || key.endsWith('.zgroup')) {
      dirKey = key.substring(0, key.length - 8);
    }
    return (await zarrOpen(storeRootToUse.resolve(dirKey))).attrs;
  }
}
