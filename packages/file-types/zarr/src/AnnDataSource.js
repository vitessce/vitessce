/* eslint-disable no-underscore-dangle */
import { open as zarrOpen } from '@zarrita/core';
import { get as zarrGet } from '@zarrita/indexing';
import { dirname } from './utils.js';
import ZarrDataSource from './ZarrDataSource.js';

/**
 * A base AnnData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from AbstractLoader.
 */
export default class AnnDataSource extends ZarrDataSource {
  constructor(...args) {
    super(...args);
    /** @type {Map<string, Promise<string[]>} */
    this.promises = new Map();
  }

  loadObsColumns(paths) {
    return this._loadColumns(paths);
  }

  loadVarColumns(paths) {
    return this._loadColumns(paths);
  }

  /**
   * Class method for loading obs variables.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {string[]} paths An array of strings like "obs/leiden" or "obs/bulk_labels."
   * @returns {Promise} A promise for an array of ids with one per cell.
   */
  _loadColumns(paths) {
    const promises = paths.map((path) => {
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
        return this.promises.get(col);
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

  async _loadColumn(path) {
    const { storeRoot } = this;
    const prefix = dirname(path);
    const { categories, 'encoding-type': encodingType } = await this.getJson(`${path}/.zattrs`);
    let categoriesValues;
    let codes;
    if (categories) {
      const { dtype } = await this.getJson(`/${prefix}/${categories}/.zarray`);
      if (dtype === '|O') {
        categoriesValues = await this.getFlatArrDecompressed(
          `/${prefix}/${categories}`,
        );
      }
    } else if (encodingType === 'categorical') {
      const { dtype } = await this.getJson(`/${path}/categories/.zarray`);
      if (dtype === '|O') {
        categoriesValues = await this.getFlatArrDecompressed(
          `/${path}/categories`,
        );
      }
      codes = `/${path}/codes`;
    } else {
      const { dtype } = await this.getJson(`/${path}/.zarray`);
      if (dtype === '|O') {
        return this.getFlatArrDecompressed(path);
      }
    }
    const arr = await zarrOpen((await storeRoot).resolve(codes || path), { kind: 'array' });
    const values = await zarrGet(arr, [null]);
    const { data } = values;
    const mappedValues = Array.from(data).map(
      i => (!categoriesValues ? String(i) : categoriesValues[i]),
    );
    return mappedValues;
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise} A promise for a zarr array containing the data.
   */
  loadNumeric(path) {
    const { storeRoot } = this;
    return storeRoot
      .then(root => zarrOpen(root.resolve(path), { kind: 'array' }))
      .then(arr => zarrGet(arr, arr.shape.map(() => null)));
  }

  /**
   * Class method for loading specific columns of numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @param {number[]} dims The column indices to load.
   * @returns {Promise} A promise for a zarr array containing the data.
   */
  loadNumericForDims(path, dims) {
    const { storeRoot } = this;
    const arr = storeRoot.then(root => zarrOpen(root.resolve(path), { kind: 'array' }));
    return Promise.all(
      dims.map(dim => arr.then(
        loadedArr => zarrGet(loadedArr, [null, dim]),
      )),
    ).then(cols => ({
      data: cols.map(col => col.data),
      shape: [dims.length, cols[0].shape[0]],
    }));
  }

  /**
   * A common method for loading flattened data
   * i.e that which has shape [n] where n is a natural number.
   * @param {string} path A path to a flat array location, like obs/_index
   * @returns {Array} The data from the zarr array.
   */
  async getFlatArrDecompressed(path) {
    const { storeRoot } = this;
    const arr = await zarrOpen((await storeRoot).resolve(path), { kind: 'array' });
    // Zarrita supports decoding vlen-utf8-encoded string arrays.
    const data = await zarrGet(arr, [null]);
    return data.data;
  }

  /**
   * Class method for loading the obs index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadObsIndex() {
    if (this.obsIndex) {
      return this.obsIndex;
    }
    this.obsIndex = this.getJson('obs/.zattrs').then(({ _index }) => this.getFlatArrDecompressed(`/obs/${_index}`));
    return this.obsIndex;
  }

  /**
   * Class method for loading the var index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadVarIndex() {
    if (this.varIndex) {
      return this.varIndex;
    }
    this.varIndex = this.getJson('var/.zattrs').then(({ _index }) => this.getFlatArrDecompressed(`/var/${_index}`));
    return this.varIndex;
  }

  /**
   * Class method for loading the var alias.
   * @returns {Promise} An promise for a zarr array containing the aliased names.
   */
  async loadVarAlias(varPath) {
    if (this.varAlias) {
      return this.varAlias;
    }
    [this.varAlias] = await this.loadVarColumns([varPath]);
    const index = await this.loadVarIndex();
    this.varAlias = this.varAlias.map(
      (val, ind) => (val ? val.concat(` (${index[ind]})`) : index[ind]),
    );
    return this.varAlias;
  }
}
