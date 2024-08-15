// @ts-check
/* eslint-disable no-underscore-dangle */
import { open as zarrOpen, get as zarrGet } from 'zarrita';
import { makeVector, vectorFromArray, Dictionary as arrowDictionary, Uint8 as arrowUint8, Utf8 as arrowUtf8 } from "apache-arrow";
import { dirname } from './utils.js';
import ZarrDataSource from './ZarrDataSource.js';

/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { ByteStringArray } from '@zarrita/typedarray' */
/** @import { TypedArray as ZarrTypedArray, Chunk } from '@zarrita/core' */
/** @import { Vector } from 'apache-arrow' */

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
    /** @type {Map<string, Promise<(undefined | string[] | string[][] | Vector<any>)>>} */
    this.promises = new Map();
  }

  /**
   *
   * @param {string[]} paths Paths to multiple string-valued columns
   * within the obs dataframe.
   * @param {boolean} [asVector]
   * @returns {Promise<(undefined | string[] | string[][] | Vector<any>)[]>} Returns
   * each column as an array of strings,
   * ordered the same as the paths.
   */
  loadObsColumns(paths, asVector = false) {
    return this._loadColumns(paths, asVector);
  }

  /**
   *
   * @param {string[]} paths Paths to multiple string-valued columns
   * within the var dataframe.
   * @returns {Promise<(undefined | string[] | string[][] | Vector<any>)[]>} Returns
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
   * @param {boolean} [asVector]
   * @returns {Promise<(undefined | string[] | string[][])[]>} A promise
   * for an array of ids with one per cell.
   */
  _loadColumns(paths, asVector = false) {
    const promises = paths.map((path) => {
      /** @type {(a: string) => Promise<string[] | string[][]>} */
      const getCol = (col) => {
        if (!this.promises.has(col)) {
          const obsPromise = (asVector
              ? this._loadColumnAsVector(col)
              : this._loadColumn(col)
            ).catch((err) => {
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
    return /** @type {Promise<(undefined | string[] | string[][])[]>} */ (Promise.all(promises));
  }

  /**
   * 
   * @param {string} path 
   * @returns {Promise<Vector<any>>} A promise
   */
  async _loadColumnAsVector(path) {
    const [codes, categories] = await this._loadColumnAsCategories(path);

    if(categories) {
      const categoriesVector = vectorFromArray(
        /** @type {string[]} */ (categories),
        new arrowUtf8
      );
      return makeVector({
        data: /** @type {number[]} */ (codes), // indexes into the dictionary
        dictionary: /** @type {Vector<any>} */ (categoriesVector),
        type: new arrowDictionary(new arrowUtf8, new arrowUint8),
      });
    } else {
      return vectorFromArray(
        Array.from(/** @type {number[]} */ (codes)).map(i => String(i)),
        new arrowUtf8,
      );
    }
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<[number[]|string[], undefined|string[]]>}
   */
  async _loadColumnAsCategories(path) {
    const { storeRoot } = this;
    const prefix = dirname(path);
    const { categories, 'encoding-type': encodingType } = await this.getJson(`${path}/.zattrs`);
    /** @type {undefined|string[]} */
    let categoriesValues;
    /** @type {undefined | string} */
    let codesPath;
    if (categories) {
      const { dtype } = await zarrOpen(
        storeRoot.resolve(`/${prefix}/${categories}`),
        { kind: 'array' },
      );
      if (dtype === 'v2:object') {
        categoriesValues = await this.getFlatArrDecompressed(
          `/${prefix}/${categories}`,
        );
      }
    } else if (encodingType === 'categorical') {
      const { dtype } = await zarrOpen(
        storeRoot.resolve(`/${path}/categories`),
        { kind: 'array' },
      );
      if (dtype === 'v2:object') {
        categoriesValues = await this.getFlatArrDecompressed(
          `/${path}/categories`,
        );
      }
      codesPath = `/${path}/codes`;
    } else {
      const { dtype } = await zarrOpen(
        storeRoot.resolve(`/${path}`),
        { kind: 'array' },
      );
      if (dtype === 'v2:object') {
        return [await this.getFlatArrDecompressed(path), categoriesValues];
      }
    }
    const arr = await zarrOpen(
      storeRoot.resolve(codesPath || path),
      { kind: 'array' },
    );
    const values = await zarrGet(arr, [null]);
    const { data } = values;
    return [/** @type {number[]} */ (data), categoriesValues];
  }

  /**
   * 
   * @param {string} path 
   * @returns {Promise<(string[])>}
   */
  async _loadColumn(path) {
    const [data, categoriesValues] = await this._loadColumnAsCategories(path);

    const mappedValues = Array.from(/** @type{number[]} */ (data)).map(
      i => (!categoriesValues ? String(i) : categoriesValues[i]),
    );
    return mappedValues;
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise<Chunk<any>>} A promise for a zarr array containing the data.
   */
  loadNumeric(path) {
    const { storeRoot } = this;
    return zarrOpen(storeRoot.resolve(path), { kind: 'array' })
      .then(arr => /** @type {Promise<Chunk<any>>} */ (zarrGet(arr)));
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
  loadNumericForDims(path, dims) {
    const { storeRoot } = this;
    const arr = zarrOpen(storeRoot.resolve(path), { kind: 'array' });
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
      .then(({ _index }) => this.getFlatArrDecompressed(`/obs/${_index}`));
    return this.obsIndex;
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
      .then(({ _index }) => this.getFlatArrDecompressed(`/var/${_index}`));
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
        const { data } = /** @type {{ data: ByteStringArray }} */ (/** @type {unknown} */ (await arr.getChunk([])));
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
        /** @type {{ [k: string]: string|string[]|null }} */
        const result = {};
        await Promise.all(keys.map(async (key) => {
          const val = await this._loadElement(`${path}/${key}`);
          result[key] = val;
        }));
        return result;
      }
      throw new Error(`Unsupported encoding type ${encodingType} and version ${encodingVersion} in AnnDataSource._loadDict`);
    }
    throw new Error('Keys for encoding-type or encoding-version not found in AnnDataSource._loadString');
  }
}
