import { HTTPStore, openArray, KeyError } from 'zarr';

import AbstractLoader from '../AbstractLoader';

/**
 * A base AnnData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from AbstractLoader.
 */
export default class BaseAnnDataLoader extends AbstractLoader {
  constructor(params) {
    super(params);

    // TODO: Use this.requestInit to provide headers, tokens, etc.
    // eslint-disable-next-line no-unused-vars
    const { url, requestInit } = this;
    this.store = new HTTPStore(url);
  }

  /**
   * Class method for decoding json from the store.
   * @returns {string} An path to the item.
   */
  async getJson(key) {
    try {
      const buf = await this.store.getItem(key);
      const text = new TextDecoder().decode(buf);
      return JSON.parse(text);
    } catch (err) {
      if (err instanceof KeyError) {
        return {};
      }
      throw err;
    }
  }

  /**
   * Class method for decoding text arrays from zarr.
   * @returns {string[]} An array of strings.
   */
  // eslint-disable-next-line class-methods-use-this
  decodeTextArray(buffer) {
    return (
      new TextDecoder()
        // Remove header: https://github.com/zarr-developers/numcodecs/blob/2c1aff98e965c3c4747d9881d8b8d4aad91adb3a/numcodecs/vlen.pyx#L34
        // Should we validate? Seems unnecessary, but maybe?
        .decode(buffer.slice(4))
        // https://stackoverflow.com/questions/11159118/incorrect-string-value-xef-xbf-xbd-for-column
        // for information on the right hand side of the | in the regex.
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001c]|�c/g, ',')
        .split(',')
        .filter(Boolean)
    );
  }

  /**
   * Class method for loading cell set ids.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {string} cellSetZarrLocation A string like obs.leiden or obs.bulk_labels.
   * @returns {Promise} A promise for an array of ids with one per cell.
   */
  loadCellSetIds(cellSetZarrLocation) {
    const { store } = this;
    if (this.cellSets) {
      return this.cellSets;
    }
    this.cellSets = Promise.all(
      cellSetZarrLocation.map(async (setName) => {
        const { categories } = await this.getJson(
          `${setName}/.zattrs`,
        );
        let categoriesValues;
        if (categories) {
          categoriesValues = await this.getFlatTextArr(`/obs/${categories}`);
        }
        const cellSetsArr = await openArray({
          store,
          path: setName,
          mode: 'r',
        });
        const cellSetsValues = await cellSetsArr.get();
        const { data } = cellSetsValues;
        const mappedCellSetValues = new Array(...data).map(
          i => (!categoriesValues ? i : categoriesValues[i]),
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
      let data = new Uint8Array();
      let item = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const buf = await store.getItem(`${z.keyPrefix}${String(item)}`);
          // eslint-disable-next-line no-await-in-loop
          const dbytes = await z.compressor.decode(buf);
          const tmp = new Uint8Array(
            dbytes.buffer.byteLength + data.buffer.byteLength,
          );
          tmp.set(new Uint8Array(data.buffer), 0);
          tmp.set(dbytes, data.buffer.byteLength);
          data = tmp;
          item += 1;
        } catch (err) {
          if (err instanceof KeyError) {
            break;
          }
          throw err;
        }
      }
      return data;
    });
  }

  getFlatTextArr(path) {
    return this.getFlatArrDecompressed(path).then((data) => {
      const text = this.decodeTextArray(data);
      return text;
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
      .then(({ _index }) => this.getFlatTextArr(`/obs/${_index}`));
    return this.cellNames;
  }
}
