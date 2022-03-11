/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import { openArray } from 'zarr';
import range from 'lodash/range';
import ZarrDataSource from './ZarrDataSource';

const readFloat32FromUint8 = (bytes) => {
  if (bytes.length !== 4) {
    throw new Error('readFloat32 only takes in length 4 byte buffers');
  }
  return new Int32Array(bytes.buffer)[0];
};

const HEADER_LENGTH = 4;

function basename(path) {
  return path.split('/').reverse()[0];
}

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
    this.obsPromises = new Map();
  }

  /**
   * Class method for loading obs variables.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {string[]} obsPaths An array of strings like "obs/leiden" or "obs/bulk_labels."
   * @returns {Promise} A promise for an array of ids with one per cell.
   */
  loadObsVariables(obsPaths) {
    const obsPromises = obsPaths.map((obsPath) => {
      const getObsCol = (obsCol) => {
        if (!this.obsPromises.has(obsCol)) {
          const obsPromise = this._loadObsColumn(obsCol).catch((err) => {
            // clear from cache if promise rejects
            this.obsPromises.delete(obsCol);
            // propagate error
            throw err;
          });
          this.obsPromises.set(obsCol, obsPromise);
        }
        return this.obsPromises.get(obsCol);
      };
      if (!obsPath) {
        return Promise.resolve(undefined);
      }
      if (Array.isArray(obsPath)) {
        return Promise.resolve(Promise.all(obsPath.map(getObsCol)));
      }
      return getObsCol(obsPath);
    });
    return Promise.all(obsPromises);
  }

  async _loadObsColumn(col) {
    return this._loadColumn(col);
  }

  async _loadVarColumn(col) {
    return this._loadColumn(col);
  }

  async _loadColumn(path) {
    const col = path;
    const prefix = dirname(path);
    const { store } = this;
    const { categories } = await this.getJson(`${col}/.zattrs`);
    let categoriesValues;
    if (categories) {
      const { dtype } = await this.getJson(`/${prefix}/${categories}/.zarray`);
      if (dtype === '|O') {
        categoriesValues = await this.getFlatArrDecompressed(`/${prefix}/${categories}`);
      }
    } else {
      const { dtype } = await this.getJson(`/${col}/.zarray`);
      if (dtype === '|O') {
        return this.getFlatArrDecompressed(col);
      }
    }
    const obsArr = await openArray({ store, path: col, mode: 'r' });
    const obsValues = await obsArr.get();
    const { data } = obsValues;
    const mappedObsValues = Array.from(data).map(
      i => (!categoriesValues ? String(i) : categoriesValues[i]),
    );
    return mappedObsValues;
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

  async loadColumnNumeric(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(arr => arr.get());
  }

  async loadEmbeddingNumeric(path) {
    const { store } = this;
    const arr = openArray({
      store,
      path,
      mode: 'r',
    });
    return Promise.all([
      arr.then(arr => arr.get([null, 0])),
      arr.then(arr => arr.get([null, 1])),
    ]).then(([x, y]) => {
      return {
        data: [x.data, y.data],
        shape: [2, x.shape[0]]
      };
    });
  }

  async loadColumnString(path) {
    return this._loadColumn(path);
  }

  async loadMatrixNumeric(path) {
    // TODO(scXAI): implement based on MatrixZarrLoader.
    return Promise.resolve(null);
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
          const tmp = new Uint8Array(dbytes.buffer.byteLength + data.buffer.byteLength);
          tmp.set(new Uint8Array(data.buffer), 0);
          tmp.set(dbytes, data.buffer.byteLength);
          data = tmp;
        }
      };
      const numRequests = Math.ceil(z.meta.shape[0] / z.meta.chunks[0]);
      const requests = range(numRequests).map(async item => store.getItem(`${z.keyPrefix}${String(item)}`)
        .then(buf => z.compressor.then(compressor => compressor.decode(buf))));
      const dbytesArr = await Promise.all(requests);
      dbytesArr.forEach((dbytes) => {
        // Use vlenutf-8 decoding if necessary and merge `data` as a normal array.
        if (Array.isArray(z.meta.filters) && z.meta.filters[0].id === 'vlen-utf8') {
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
    this.obsIndex = this.getJson('obs/.zattrs')
      .then(({ _index }) => this.getFlatArrDecompressed(`/obs/${_index}`));
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
    this.varIndex = this.getJson('var/.zattrs')
      .then(({ _index }) => this.getFlatArrDecompressed(`/var/${_index}`));
    return this.varIndex;
  }
}
