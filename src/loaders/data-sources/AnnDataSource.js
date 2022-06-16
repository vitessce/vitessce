/* eslint-disable */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { openArray } from 'zarr';
import range from 'lodash/range';
import ZarrDataSource from './ZarrDataSource';
import UnsupportedEncodingError from '../errors/UnsupportedEncodingError';

const readFloat32FromUint8 = (bytes) => {
  if (bytes.length !== 4) {
    throw new Error('readFloat32 only takes in length 4 byte buffers');
  }
  return new Int32Array(bytes.buffer)[0];
};

const HEADER_LENGTH = 4;

function dirname(path) {
  const arr = path.split('/');
  arr.pop();
  return arr.join('/');
}

/**
   * Method for decoding text arrays from zarr.
   * Largerly a port of https://github.com/zarr-developers/numcodecs/blob/2c1aff98e965c3c4747d9881d8b8d4aad91adb3a/numcodecs/vlen.pyx#L135-L178
   * @returns {string[]} An array of strings.
   */
function parseVlenUtf8(buffer) {
  const decoder = new TextDecoder();
  let data = 0;
  const dataEnd = data + buffer.length;
  const length = readFloat32FromUint8(buffer.slice(data, HEADER_LENGTH));
  if (buffer.length < HEADER_LENGTH) {
    throw new Error('corrupt buffer, missing or truncated header');
  }
  data += HEADER_LENGTH;
  const output = new Array(length);
  for (let i = 0; i < length; i += 1) {
    if (data + 4 > dataEnd) {
      throw new Error('corrupt buffer, data seem truncated');
    }
    const l = readFloat32FromUint8(buffer.slice(data, data + 4));
    data += 4;
    if (data + l > dataEnd) {
      throw new Error('corrupt buffer, data seem truncated');
    }
    output[i] = decoder.decode(buffer.slice(data, data + l));
    data += l;
  }
  return output;
}

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

  async getEncodingInfo(path) {
    const {
      'encoding-version': encodingVersion = null,
      'encoding-type': encodingType = null,
      ...other
    } = await this.getJson(`${path}/.zattrs`);
    return {
      encodingType,
      encodingVersion,
      ...other,
    };
  }

  async _openSparseArray(path) {
    const { store } = this;
    return Promise.all(
      ['indptr', 'indices', 'data'].map(name => openArray({
        store,
        path: `${path}/${name}`,
        mode: 'r',
      })),
    );
  }

  async loadCSRMatrix_0_1_0(path) {
    return this._openSparseArray(path).then(async (sparseArrays) => {
      const { shape } = await this.getJson(`${path}/.zattrs`);
      const [rows, cols, cellXGene] = await Promise.all(
        sparseArrays.map(async (arr) => {
          const { data } = await arr.getRaw(null);
          return data;
        }),
      );
      const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
      let row = 0;
      rows.forEach((_, index) => {
        const rowStart = rows[index];
        const rowEnd = rows[index + 1];
        for (let i = rowStart; i < rowEnd; i += 1) {
          const val = cellXGene[i];
          const col = cols[i];
          cellXGeneMatrix[row * shape[1] + col] = val;
        }
        row += 1;
      });
      return cellXGeneMatrix;
    });
  }

  async loadCSCMatrix_0_1_0(path) {
    return this._openSparseArray(path).then(async (sparseArrays) => {
      const { shape } = await this.getJson(`${path}/.zattrs`);
      const [cols, rows, cellXGene] = await Promise.all(
        sparseArrays.map(async (arr) => {
          const { data } = await arr.getRaw(null);
          return data;
        }),
      );
      const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
      let col = 0;
      cols.forEach((_, index) => {
        const colStart = cols[index];
        const colEnd = cols[index + 1];
        for (let i = colStart; i < colEnd; i += 1) {
          const val = cellXGene[i];
          const row = rows[i];
          cellXGeneMatrix[row * shape[1] + col] = val;
        }
        col += 1;
      });
      return cellXGeneMatrix;
    });
  }

  async loadArray_0_2_0(path) {
    const arr = await openArray({ store, path, mode: 'r' });
    const values = await arr.get();
    const { data } = values;
    // TODO: should Array.from be used here? Or instead just return `values`?
    return Array.from(data);
  }

  async loadStringArray_0_2_0(path) {
    return this.loadStringArrayLegacy(path);
  }

  // Load a column from encoding-type: dataframe
  // with encoding-version: 0.1.0.
  async loadStringArrayLegacy(path) {
    const { store } = this;
    const { dtype } = await this.getJson(`/${path}/.zarray`);
    if (dtype === '|O') {
      return this.getFlatArrDecompressed(path);
    }
    const arr = await openArray({ store, path, mode: 'r' });
    const values = await arr.get();
    const { data } = values;
    const mappedValues = Array.from(data).map(i => String(i));
    return mappedValues;
  }

  async loadCategorical_0_1_0(path) {
    const { store } = this;
    const prefix = dirname(path);
    const { categories } = await this.getJson(`${path}/.zattrs`);
    let categoriesValues;
    if (categories) {
      categoriesValues = this.loadStringArrayLegacy(`${prefix}/${categories}`);
    }
    const arr = await openArray({ store, path, mode: 'r' });
    const values = await arr.get();
    const { data } = values;
    const mappedValues = Array.from(data).map(
      i => (!categoriesValues ? String(i) : categoriesValues[i]),
    );
    return mappedValues;
  }

  // Load a column from encoding-type: categorical
  // with encoding-version: 0.2.0.
  async loadCategorical_0_2_0(path) {
    const { store } = this;
    const { encodingType } = await this.getEncodingInfo(path);
    if (encodingType === 'categorical') {
      const codesPath = `${path}/codes`;
      const categoriesPath = `${path}/categories`;
      const categories = await this.loadElement(categoriesPath);
      const codes = await this.loadElement(codesPath);

      const categoriesInfo = await this.getEncodingInfo(categoriesPath);
      const codesInfo = await this.getEncodingInfo(codesPath);
      console.assert(categoriesInfo.encodingType === 'string-array');
      const categoriesValues = await this.getFlatArrDecompressed(categoriesPath);
      console.assert(codesInfo.encodingType === 'array');
      const arr = await openArray({
        store,
        path: codesPath,
        mode: 'r',
      });
      const values = await arr.get();
      const { data } = values;
      const mappedValues = Array.from(data).map(
        i => (!categoriesValues ? String(i) : categoriesValues[i]),
      );
      return mappedValues;
    }
  }

  async loadElement(path) {
    const {
      encodingType,
      encodingVersion,
      ...other
    } = await this.getEncodingInfo(path);
    if (encodingType === 'categorical' && encodingVersion === '0.2.0') {
      return this.loadCategorical_0_2_0(path);
    }
    if (encodingType === 'string-array' && encodingVersion === '0.2.0') {
      return this.loadStringArray_0_2_0(path);
    }
    if (encodingType === 'array' && encodingVersion === '0.2.0') {
      return this.loadArray_0_2_0(path);
    }
    if (encodingType === 'csr_matrix' && encodingVersion === '0.1.0') {
      return this.loadCSRMatrix_0_1_0(path);
    }
    if (encodingType === 'csc_matrix' && encodingVersion === '0.1.0') {
      return this.loadCSCMatrix_0_1_0(path);
    }
    if (encodingVersion === null) {
      if(other.categories) {
        // Categorical columns for anndata v0.7.0
        // do not have an encoding-version attribute.
        return this.loadCategorical_0_1_0(path);
      } else {
        return this.loadStringArrayLegacy(path);
      }
      
    }
    throw new UnsupportedEncodingError(encodingType, encodingVersion);
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise} A promise for a zarr array containing the data.
   */
  loadNumeric(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(arr => arr.get());
  }

  /**
   * A common method for loading flattened data
   * i.e that which has shape [n] where n is a natural number.
   * @param {string} path A path to a flat array location, like obs/_index
   * @returns {Array} The data from the zarr array.
   */
  getFlatArrDecompressed(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(async (z) => {
      let data;
      const parseAndMergeTextBytes = (dbytes) => {
        const text = parseVlenUtf8(dbytes);
        if (!data) {
          data = text;
        } else {
          data = data.concat(text);
        }
      };
      const mergeBytes = (dbytes) => {
        if (!data) {
          data = dbytes;
        } else {
          const tmp = new Uint8Array(
            dbytes.buffer.byteLength + data.buffer.byteLength,
          );
          tmp.set(new Uint8Array(data.buffer), 0);
          tmp.set(dbytes, data.buffer.byteLength);
          data = tmp;
        }
      };
      const numRequests = Math.ceil(z.meta.shape[0] / z.meta.chunks[0]);
      const requests = range(numRequests).map(async item => store
        .getItem(`${z.keyPrefix}${String(item)}`)
        .then(buf => z.compressor.then(compressor => compressor.decode(buf))));
      const dbytesArr = await Promise.all(requests);
      dbytesArr.forEach((dbytes) => {
        // Use vlenutf-8 decoding if necessary and merge `data` as a normal array.
        if (
          Array.isArray(z.meta.filters)
          && z.meta.filters[0].id === 'vlen-utf8'
        ) {
          parseAndMergeTextBytes(dbytes);
          // Otherwise just merge the bytes as a typed array.
        } else {
          mergeBytes(dbytes);
        }
      });
      const {
        meta: {
          shape: [length],
        },
      } = z;
      // truncate the filled in values
      return data.slice(0, length);
    });
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
    this.varAlias = this.varAlias.map((val, ind) => val || index[ind]);
    return this.varAlias;
  }
}
