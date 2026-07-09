// @ts-check
import { log, getDebugMode } from '@vitessce/globals';
import { zarrOpenRoot, getNode } from '@vitessce/zarr-utils';
import { root as zarrRoot } from 'zarrita';
import { ZarrNodeNotFoundError } from '@vitessce/error';

/** @import { Location as ZarrLocation, Readable } from 'zarrita' */
/** @import { DataSourceParams } from '@vitessce/types' */


const METADATA_SUFFIX_LENGTH = '.zattrs'.length + 1; // +1 for the preceding '/'

/**
 * Strip a legacy v2 metadata-file suffix (.zattrs/.zarray/.zgroup) from a
 * path, if present. Zarr v3 has no such files -- attributes live inline in
 * each node's own `zarr.json` -- so a suffix-style path is a v2-only mental
 * model. Returns the input unchanged if it isn't suffixed.
 * @param {string} path
 * @returns {string}
 */
function stripMetadataSuffix(path) {
  if (path.endsWith('.zattrs') || path.endsWith('.zarray') || path.endsWith('.zgroup')) {
    return path.substring(0, path.length - METADATA_SUFFIX_LENGTH);
  }
  return path;
}


/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class ZarrDataSource {
  /**
   * @param {DataSourceParams & { refSpecUrl?: string }} params The parameters object.
   */
  constructor({ url, requestInit, refSpecUrl, store, fileType }) {
    log.info('Using a Zarr-based data source. Occasional 403/404 HTTP responses for Zarr metadata files (.zattrs, .zarray, .zgroup, zarr.json) are to be expected and do not necessarily indicate errors.');
    if (store) {
      // TODO: check here that it is a valid Zarrita Readable?
      this.storeRoot = zarrRoot(store);
    } else if (url) {
      this.storeRoot = zarrOpenRoot(url, fileType, { requestInit, refSpecUrl });
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
   * Version-independent, node-centric attribute access. Prefer this over
   * `getJson`: pass a bare node path (e.g. "obs"), not a v2-style
   * metadata-file path (e.g. "obs/.zattrs"). The suffix-style form is still
   * accepted here temporarily for backward compatibility, but logs a
   * deprecation warning in debug mode.
   * @param {string} nodePath A node path, relative to the store root.
   * @param {ZarrLocation<Readable>|null} storeRootParam An optional location,
   * which if provided will override the default store root.
   * @returns {Promise<any>} This async function returns a promise
   * that resolves to the node's attrs if successful.
   * @throws This may throw an error.
   */
  async getAttrs(nodePath, storeRootParam = null) {
    if (getDebugMode() && stripMetadataSuffix(nodePath) !== nodePath) {
      log.warn(`ZarrDataSource.getAttrs() received a suffix-style path ("${nodePath}"). Zarr v3 has no .zattrs/.zarray/.zgroup files -- pass a bare node path ("${stripMetadataSuffix(nodePath)}") instead.`);
    }
    return this.readAttrs(nodePath, storeRootParam);
  }


  /**
   * Method for accessing JSON attributes, relative to the store root.
   * @deprecated Prefer `getAttrs(nodePath)`. Kept as a compatibility wrapper
   * during the migration off v2-style metadata-file paths; still accepts (and
   * strips) a legacy `.zattrs`/`.zarray`/`.zgroup` suffix, which doesn't
   * correspond to a real file in Zarr v3.
   * @param {string} key A path to the item.
   * @param {ZarrLocation<Readable>|null} storeRootParam An optional location,
   * which if provided will override the default store root.
   * @returns {Promise<any>} This async function returns a promise
   * that resolves to the parsed JSON if successful.
   * @throws This may throw an error.
   */
  async getJson(key, storeRootParam = null) {
    if (getDebugMode()) {
      log.warn(`ZarrDataSource.getJson() is deprecated; prefer getAttrs("${stripMetadataSuffix(key)}") instead.`);
    }
    return this.readAttrs(key, storeRootParam);
  }

  /**
  * Shared implementation behind both `getAttrs` and the deprecated `getJson`
  * Kept separate so calling one doesn't also trigger the other's
  * deprecation warning.
  * @param {string} key
  * @param {ZarrLocation<Readable>|null} storeRootParam
  * @returns {Promise<any>}
  */

  async readAttrs(key, storeRootParam = null) {
    const { storeRoot } = this;
    const storeRootToUse = storeRootParam || storeRoot;

    const dirKey = stripMetadataSuffix(key);
    // `getNode` makes the node-vs-attrs distinction explicit: `null` means the
    // node genuinely doesn't exist (throw our specific error)
    // any other failure (e.g. an unsupported dtype/codec) is
    // surfaced as `ZarrUnsupportedNodeError`
    const node = await getNode(storeRootToUse, dirKey);
    if (!node) {
      throw new ZarrNodeNotFoundError(dirKey);
    }
    return node.attrs;
  }
}
