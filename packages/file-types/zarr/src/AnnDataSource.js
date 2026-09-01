/* eslint-disable no-underscore-dangle */
import { open as zarrOpen, get as zarrGet, slice as zarrSlice } from 'zarrita';
import { log } from '@vitessce/globals';
import { dirname } from './utils.js';
import ZarrDataSource from './ZarrDataSource.js';
import { maybeDowncastInt64 } from './anndata-loaders/utils.js';
/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { TypedArray as ZarrTypedArray, Chunk, ByteStringArray } from 'zarrita' */


function prependSlash(path) {
  if (typeof path === 'string' && path.length >= 1) {
    if (path.charAt(0) === '/') {
      // No prepending needed.
      return path;
    }
    return `/${path}`;
  }
  return path;
}

/**
 * A base AnnData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from AbstractLoader.
 */
export default class AnnDataSource extends ZarrDataSource {
  /**
   *
   * @param {DataSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {Map<string, Promise<(undefined | string[] | string[][])>>} */
    this.promises = new Map();
  }

  /**
   *
   * @param {string[]} paths Paths to multiple string-valued columns
   * within the obs dataframe.
   * @returns {Promise<(undefined | string[] | string[][])[]>} Returns
   * each column as an array of strings,
   * ordered the same as the paths.
   */
  loadObsColumns(paths) {
    return this._loadColumns(paths);
  }

  /**
   *
   * @param {string[]} paths Paths to multiple string-valued columns
   * within the var dataframe.
   * @returns {Promise<(undefined | string[] | string[][])[]>} Returns
   * each column as an array of strings,
   * ordered the same as the paths.
   */
  loadVarColumns(paths) {
    return this._loadColumns(paths);
  }

  /**
   * Class method for loading obs variables.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {string[] | string[][]} paths An array of strings like
   * "obs/leiden" or "obs/bulk_labels."
   * @returns {Promise<(undefined | string[] | string[][])[]>} A promise
   * for an array of ids with one per cell.
   */
  _loadColumns(paths) {
    const promises = paths.map((path) => {
      /** @type {(a: string) => Promise<string[]>} */
      const getCol = (col) => {
        if (!this.promises.has(col)) {
          const obsPromise = this._loadColumn(col).catch((err) => {
            // clear from cache if promise rejects
            this.promises.delete(col);
            // propagate error
            throw err;
          });
          this.promises.set(col, obsPromise);
        }
        return /** @type {Promise<string[]>} */ (this.promises.get(col));
      };
      if (!path) {
        return Promise.resolve(undefined);
      }
      if (Array.isArray(path)) {
        return Promise.resolve(Promise.all(path.map(getCol)));
      }
      return getCol(path);
    });
    return Promise.all(promises);
  }

  /**
   * Inspect a dataframe column's encoding and resolve where its data lives,
   * without materializing per-observation values. Shared by the string-decoding
   * path (_loadColumn) and the raw-codes path (loadObsColumnCodes).
   * @param {string} pathOrig
   * @returns {Promise<
   *   { kind: 'stringArray', valuesPath: string }
   *   | { kind: 'codes', codesPath: string, categoriesValues: string[] | undefined }
   * >} For 'codes', categoriesValues is undefined when the column is numeric or
   * when its categories could not be decoded; codes are then stringified directly.
   */
  async _getColumnSpec(pathOrig) {
    const { storeRoot } = this;

    const path = prependSlash(pathOrig);
    const prefixOrig = dirname(path);
    const prefix = prependSlash(prefixOrig);
    const { categories, 'encoding-type': encodingType } = await this.getJson(`${path}/.zattrs`);
    /** @type {string[] | undefined} */
    let categoriesValues;
    /** @type {undefined | string} */
    let codesPath;
    if (categories) {
      // AnnData 0.7-style: the column holds codes, and a sibling array
      // (named by the `categories` attribute) holds the category strings.
      const { dtype } = await zarrOpen(
        storeRoot.resolve(`${prefix}/${categories}`),
        { kind: 'array' },
      );
      if (dtype === 'v2:object' || dtype === '|O') {
        categoriesValues = await this.getFlatArrDecompressed(
          `${prefix}/${categories}`,
        );
      }
    } else if (encodingType === 'categorical') {
      // AnnData 0.8+ style: the column is a group with codes/ and categories/.
      const categoriesZattrs = await this.getJson(`${path}/categories/.zattrs`);
      const categoriesEncodingType = categoriesZattrs?.['encoding-type'];
      if (categoriesEncodingType === 'nullable-string-array') {
        categoriesValues = await this.getFlatArrDecompressed(`${path}/categories/values`);
      } else if (categoriesEncodingType === 'string-array') {
        categoriesValues = await this.getFlatArrDecompressed(`${path}/categories`);
      } else {
        const { dtype } = await zarrOpen(
          storeRoot.resolve(`${path}/categories`),
          { kind: 'array' },
        );
        if (dtype === 'v2:object' || dtype === '|O') {
          categoriesValues = await this.getFlatArrDecompressed(`${path}/categories`);
        }
      }
      codesPath = `${path}/codes`;
    } else if (encodingType === 'nullable-string-array') {
      return { kind: 'stringArray', valuesPath: `${path}/values` };
    } else if (encodingType === 'string-array') {
      return { kind: 'stringArray', valuesPath: path };
    } else {
      const { dtype } = await zarrOpen(
        storeRoot.resolve(path),
        { kind: 'array' },
      );
      if (dtype === 'v2:object' || dtype === '|O') {
        return { kind: 'stringArray', valuesPath: path };
      }
    }
    return { kind: 'codes', codesPath: codesPath || path, categoriesValues };
  }

  /**
   *
   * @param {string} pathOrig
   * @returns
   */
  async _loadColumn(pathOrig) {
    const { storeRoot } = this;
    const spec = await this._getColumnSpec(pathOrig);
    if (spec.kind === 'stringArray') {
      return this.getFlatArrDecompressed(spec.valuesPath);
    }
    const { codesPath, categoriesValues } = spec;
    const arr = await zarrOpen(
      storeRoot.resolve(codesPath),
      { kind: 'array' },
    );
    const values = await zarrGet(arr, [null]);
    const { data } = values;
    const mappedValues = Array.from(data).map(
      i => (!categoriesValues ? String(i) : categoriesValues[/** @type {number} */ (i)]),
    );
    return mappedValues;
  }

  /**
   * Load a categorical column as its raw integer codes plus the (small) list of
   * category strings, skipping the per-observation string materialization that
   * _loadColumn performs. Codes are positional along the column's dataframe axis;
   * a negative code means the value is missing.
   * @param {string} path A path to a dataframe column, like "obs/leiden".
   * @returns {Promise<{
   *   codes: ZarrTypedArray<any>, categories: string[],
   * } | null>} Null when the column is not categorical (callers should fall back
   * to the string-based path).
   */
  loadObsColumnCodes(path) {
    if (!this.codesPromises) {
      /** @type {Map<string, Promise<any>>} */
      this.codesPromises = new Map();
    }
    if (!this.codesPromises.has(path)) {
      const promise = (async () => {
        const { storeRoot } = this;
        const spec = await this._getColumnSpec(path);
        if (spec.kind !== 'codes' || !spec.categoriesValues) {
          return null;
        }
        const arr = await zarrOpen(
          storeRoot.resolve(spec.codesPath),
          { kind: 'array' },
        );
        const { data } = await zarrGet(arr, [null]);
        // Codes index into a small category list, so int64 codes (BigInt64Array)
        // are safely downcast for plain numeric indexing.
        return { codes: maybeDowncastInt64(data), categories: spec.categoriesValues };
      })().catch((err) => {
        // Clear from cache if the promise rejects, then propagate.
        this.codesPromises.delete(path);
        throw err;
      });
      this.codesPromises.set(path, promise);
    }
    return this.codesPromises.get(path);
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise<Chunk<any>>} A promise for a zarr array containing the data.
   */
  async loadNumeric(path) {
    const { storeRoot } = this;
    return zarrOpen(storeRoot.resolve(path), { kind: 'array' })
      .then(arr => zarrGet(arr));
  }

  /**
   * Class method for loading specific columns of numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @param {[number, number]} dims The column indices to load.
   * @returns {Promise<{
   *  data: [ZarrTypedArray<any>, ZarrTypedArray<any>],
   *  shape: [number, number],
   * }>} A promise for a zarr array containing the data.
   */
  async loadNumericForDims(path, dims) {
    const { storeRoot } = this;
    const arr = zarrOpen(storeRoot.resolve(path), { kind: 'array' });
    const minDim = Math.min(...dims);
    const maxDim = Math.max(...dims);
    if (maxDim - minDim + 1 === dims.length) {
      // The dims form a contiguous run (the common case, e.g. [0, 1]), so a single
      // sliced read covers all of them. Requesting each dim separately would fetch
      // and decompress any chunk containing multiple requested dims once per dim.
      const loadedArr = await arr;
      const { data, shape, stride } = await zarrGet(
        loadedArr, [null, zarrSlice(minDim, maxDim + 1)],
      );
      const numRows = shape[0];
      const cols = dims.map((dim) => {
        const colIndex = dim - minDim;
        const col = new /** @type {any} */ (data.constructor)(numRows);
        for (let i = 0; i < numRows; i += 1) {
          col[i] = data[i * stride[0] + colIndex * stride[1]];
        }
        return col;
      });
      return {
        data: /** @type {[ZarrTypedArray<any>, ZarrTypedArray<any>]} */ (cols),
        shape: [dims.length, numRows],
      };
    }
    // Non-contiguous dims: load per-dim. The store-level cache still coalesces
    // concurrent reads of any shared chunks.
    return Promise.all(
      dims.map(dim => arr.then(
        loadedArr => zarrGet(loadedArr, [null, dim]),
      )),
    ).then(cols => ({
      data: /** @type {[ZarrTypedArray<any>, ZarrTypedArray<any>]} */ (
        cols.map(col => col.data)
      ),
      shape: [dims.length, cols[0].shape[0]],
    }));
  }

  /**
   * A common method for loading flattened data
   * i.e that which has shape [n] where n is a natural number.
   * @param {string} path A path to a flat array location, like obs/_index
   * @returns {Promise<string[]>} The data from the zarr array.
   */
  async getFlatArrDecompressed(path) {
    const { storeRoot } = this;
    const arr = await zarrOpen(storeRoot.resolve(path), { kind: 'array' });
    if (arr.shape[0] === 0) {
      return [];
    }
    // Zarrita supports decoding vlen-utf8-encoded string arrays.
    const data = await zarrGet(arr);
    if (data.data?.[Symbol.iterator]) {
      return /** @type {string[]} */ (Array.from(data.data));
    }
    return /** @type {string[]} */ (data.data);
  }

  /**
   * Class method for loading the obs index.
   * @param {string|undefined} path Used by subclasses.
   * @returns {Promise<string[]>} An promise for a zarr array
   * containing the indices.
   */
  loadObsIndex(
    // eslint-disable-next-line no-unused-vars
    path = undefined,
  ) {
    if (this.obsIndex) {
      return this.obsIndex;
    }
    this.obsIndex = this.getJson('obs/.zattrs')
      .then(({ _index }) => this._loadColumn(`/obs/${_index}`));
    return this.obsIndex;
  }

  /**
   * Class method for loading the obs index.
   * @param {string|undefined} path Used by subclasses.
   * @returns {Promise<string[]>} An promise for a zarr array
   * containing the indices.
   */
  loadDataFrameIndex(
    // eslint-disable-next-line no-unused-vars
    path = undefined,
  ) {
    const dfPath = path ? dirname(path) : '';
    return this.getJson(`${dfPath}/.zattrs`)
      .then(({ _index }) => this._loadColumn(`${dfPath.length > 0 ? '/' : ''}${dfPath}/${_index}`));
  }

  /**
   * Class method for loading the var index.
   * @param {string|undefined} path Used by subclasses.
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  loadVarIndex(
    // eslint-disable-next-line no-unused-vars
    path = undefined,
  ) {
    if (this.varIndex) {
      return this.varIndex;
    }
    this.varIndex = this.getJson('var/.zattrs')
      .then(({ _index }) => this._loadColumn(`/var/${_index}`));
    return this.varIndex;
  }

  /**
   * Class method for loading the var alias.
   * @param {string} varPath
   * @param {string|undefined} matrixPath
   * @returns {Promise<string[]>} An promise for a zarr array containing the aliased names.
   */
  async loadVarAlias(
    varPath,
    // eslint-disable-next-line no-unused-vars
    matrixPath = undefined,
  ) {
    if (this.varAlias) {
      return this.varAlias;
    }
    [this.varAlias] = await this.loadVarColumns([varPath]);
    const index = await this.loadVarIndex();
    this.varAlias = this.varAlias.map(
      /** @type {(val: string, ind: number) => string} */
      (val, ind) => (val ? val.concat(` (${index[ind]})`) : index[ind]),
    );
    return this.varAlias;
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<object>}
   */
  async _loadAttrs(path) {
    return this.getJson(`${path}/.zattrs`);
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<string>}
   */
  async _loadString(path) {
    const { storeRoot } = this;
    const zattrs = await this._loadAttrs(path);
    if ('encoding-type' in zattrs && 'encoding-version' in zattrs) {
      const {
        'encoding-type': encodingType,
        'encoding-version': encodingVersion,
      } = zattrs;

      if (encodingType === 'string' && encodingVersion === '0.2.0') {
        const arr = await zarrOpen(storeRoot.resolve(path), { kind: 'array' });
        // TODO: Use zarrGet once it supports zero-dimensional array access.
        const { data } = /** @type {{ data: ByteStringArray }} */ (await arr.getChunk([]));
        return data.get(0);
      }
      throw new Error(`Unsupported encoding type ${encodingType} and version ${encodingVersion} in AnnDataSource._loadString`);
    }
    throw new Error('Keys for encoding-type or encoding-version not found in AnnDataSource._loadString');
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<string[]>}
   */
  async _loadStringArray(path) {
    const zattrs = await this._loadAttrs(path);
    if ('encoding-type' in zattrs && 'encoding-version' in zattrs) {
      const { 'encoding-type': encodingType, 'encoding-version': encodingVersion } = zattrs;

      if (encodingType === 'string-array' && encodingVersion === '0.2.0') {
        return this.getFlatArrDecompressed(path);
      }
      throw new Error(`Unsupported encoding type ${encodingType} and version ${encodingVersion} in AnnDataSource._loadStringArray`);
    }
    throw new Error('Keys for encoding-type or encoding-version not found in AnnDataSource._loadString');
  }

  /**
   *
   * @param {string} path
   * @returns
   */
  async _loadElement(path) {
    const zattrs = await this._loadAttrs(path);
    if ('encoding-type' in zattrs) {
      const { 'encoding-type': encodingType } = zattrs;
      if (encodingType === 'string') {
        return this._loadString(path);
      } if (encodingType === 'string-array') {
        return this._loadStringArray(path);
      }
    }
    // TODO: support more elements
    return null;
  }

  /**
   *
   * @param {string} path
   * @param {string[]} keys
   * @returns
   */
  async _loadDict(path, keys) {
    const zattrs = await this._loadAttrs(path);
    if ('encoding-type' in zattrs && 'encoding-version' in zattrs) {
      const {
        'encoding-type': encodingType,
        'encoding-version': encodingVersion,
      } = zattrs;

      if (encodingType === 'dict' && encodingVersion === '0.1.0') {
        /** @type {{ [k: string]: string|string[]|null|undefined }} */
        const result = {};
        await Promise.all(keys.map(async (key) => {
          let val;
          try {
            val = await this._loadElement(`${path}/${key}`);
          } catch (e) {
            log.error(`Error in _loadDict: could not load ${key}`);
          }
          result[key] = val;
        }));
        return result;
      }
      throw new Error(`Unsupported encoding type ${encodingType} and version ${encodingVersion} in AnnDataSource._loadDict`);
    }
    throw new Error('Keys for encoding-type or encoding-version not found in AnnDataSource._loadString');
  }
}
