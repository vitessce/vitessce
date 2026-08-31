// @ts-check
import { log } from '@vitessce/globals';
import { zarrOpenRoot } from '@vitessce/zarr-utils';
import { open as zarrOpen, root as zarrRoot, Array as ZarrArray } from 'zarrita';
import { ZarrNodeNotFoundError } from '@vitessce/error';

/** @import { Location as ZarrLocation, Readable } from 'zarrita' */
/** @import { DataSourceParams } from '@vitessce/types' */

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class ZarrDataSource {
  /**
   * @param {DataSourceParams & { refSpecUrl?: string }} params The parameters object.
   */
  constructor({ url, requestInit, refSpecUrl, store, fileType, queryClient }) {
    log.info('Using a Zarr-based data source. 403 and 404 HTTP responses for Zarr metadata files (.zattrs, .zarray, .zgroup, zarr.json) are to be expected and do not necessarily indicate errors.');
    this.queryClient = queryClient;
    if (store) {
      // TODO: check here that it is a valid Zarrita Readable?
      this.storeRoot = zarrRoot(store);
    } else if (url) {
      // The queryClient backs the store-level chunk cache, so that concurrent
      // reads of the same chunk share one request. See CachedStore in zarr-utils.
      this.storeRoot = zarrOpenRoot(url, fileType, { requestInit, refSpecUrl, queryClient });
    } else {
      throw new Error('Either a store or a URL must be provided to the ZarrDataSource constructor.');
    }
    // Zarr nodes opened relative to the store root, memoized per path so that a
    // node's metadata documents (.zattrs/.zarray/.zgroup or zarr.json) are read
    // once per data source, however many methods touch the node.
    /** @type {Map<string, Promise<any>>} */
    this.nodeCache = new Map();
  }

  /**
   * Open the zarr node (array or group) at a path relative to the store root,
   * memoized per path. A rejected open is dropped again, so a later call
   * retries instead of re-awaiting a dead promise.
   * @param {string} path The node path relative to the store root.
   * @returns {Promise<any>} The zarrita Array or Group.
   */
  openNode(path) {
    // Callers pass paths both with and without a leading slash; resolve()
    // treats them the same, so the cache key must too.
    const key = path.startsWith('/') ? path : `/${path}`;
    if (!this.nodeCache.has(key)) {
      const promise = zarrOpen(this.storeRoot.resolve(path)).catch((err) => {
        this.nodeCache.delete(key);
        throw err;
      });
      this.nodeCache.set(key, promise);
    }
    return /** @type {Promise<any>} */ (this.nodeCache.get(key));
  }

  /**
   * Open the zarr array at a path relative to the store root, through the same
   * per-path cache as openNode.
   * @param {string} path The array path relative to the store root.
   * @returns {Promise<any>} The zarrita Array.
   * @throws When the node exists but is a group.
   */
  async openArray(path) {
    const node = await this.openNode(path);
    if (!(node instanceof ZarrArray)) {
      throw new Error(`Expected a zarr array at ${path}, but found a group.`);
    }
    return node;
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
    let dirKey = key;
    // TODO: update calls to not include these file names in the first place.
    if (key.endsWith('.zattrs') || key.endsWith('.zarray') || key.endsWith('.zgroup')) {
      dirKey = key.substring(0, key.length - 8);
    }
    try {
      const arrOrGroup = await (storeRootParam
        // A custom location cannot go through the per-path cache.
        ? zarrOpen(storeRootParam.resolve(dirKey))
        : this.openNode(dirKey));
      return arrOrGroup.attrs;
    } catch (/** @type {any} */ e) {
      if (e.name === 'NodeNotFoundError') {
        // Throw our own error with a more specific message.
        throw new ZarrNodeNotFoundError(dirKey);
      }
      // Re-throw the error if it is not a NodeNotFoundError.
      throw e;
    }
  }
}
