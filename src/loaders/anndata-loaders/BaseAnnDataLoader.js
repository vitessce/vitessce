import { openArray, KeyError } from 'zarr';
import AbstractZarrLoader from '../AbstractZarrLoader';

const readFloat32FromUint8 = (bytes) => {
  if (bytes.length !== 4) {
    throw new Error('readFloat32 only takes in length 4 byte buffers');
  }
  return new Int32Array(bytes.buffer)[0];
};

const HEADER_LENGTH = 4;

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
export default class BaseAnnDataLoader extends AbstractZarrLoader {
  /**
   * Class method for loading cell set ids.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {Array} cellSetZarrLocation An array of strings like obs.leiden or obs.bulk_labels.
   * @returns {Promise} A promise for an array of ids with one per cell.
   */
  loadCellSetIds(cellSetZarrLocation) {
    const { store } = this;
    if (this.cellSets) {
      return this.cellSets;
    }
    this.cellSets = Promise.all(
      cellSetZarrLocation.map(async (setName) => {
        const { categories } = await this.getJson(`${setName}/.zattrs`);
        let categoriesValues;
        if (categories) {
          const { dtype } = await this.getJson(`/obs/${categories}/.zarray`);
          if (dtype === '|O') {
            categoriesValues = await this.getFlatArrDecompressed(`/obs/${categories}`);
          }
        }
        const cellSetsArr = await openArray({
          store,
          path: setName,
          mode: 'r',
        });
        const cellSetsValues = await cellSetsArr.get();
        const { data } = cellSetsValues;
        const mappedCellSetValues = Array.from(data).map(
          i => (!categoriesValues ? String(i) : categoriesValues[i]),
        );
        return mappedCellSetValues;
      }),
    );
    return this.cellSets;
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

  getFlatArrDecompressed(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(async (z) => {
      let data;
      let item = 0;
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
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const buf = await store.getItem(`${z.keyPrefix}${String(item)}`);
          // eslint-disable-next-line no-await-in-loop
          const dbytes = await z.compressor.decode(buf);
          if (Array.isArray(z.meta.filters) && z.meta.filters[0].id === 'vlen-utf8') {
            parseAndMergeTextBytes(dbytes);
          } else {
            mergeBytes(dbytes);
          }
          item += 1;
        } catch (err) {
          if (err instanceof KeyError) {
            break;
          }
          throw err;
        }
      }
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
   * Class method for loading the cell names from obs.
   * @returns {Promise} An promise for a zarr array containing the names.
   */
  loadCellNames() {
    if (this.cellNames) {
      return this.cellNames;
    }
    this.cellNames = this.getJson('obs/.zattrs')
      .then(({ _index }) => this.getFlatArrDecompressed(`/obs/${_index}`));
    return this.cellNames;
  }
}
