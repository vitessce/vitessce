import { HTTPStore, openArray } from 'zarr';

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
   * Class method for decoding text arrays from zarr.
   * @returns {string[]} An array of strings.
   */
  // eslint-disable-next-line class-methods-use-this
  decodeTextArray(buffer) {
    return (
      new TextDecoder()
        .decode(buffer)
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001c]/g, ',')
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
    const { url } = this;
    if (this.cellSets) {
      return this.cellSets;
    }
    this.cellSets = Promise.all(
      cellSetZarrLocation.map(async (setName) => {
        const res = await fetch(
          `${this.url}/${setName.replace('.', '/')}/.zattrs`,
        );
        const { categories } = await res.json();
        const categoriesValuesArr = await openArray({
          store: `${url}/obs/${categories}`,
          mode: 'r',
        });
        const categoriesBuffer = await categoriesValuesArr.compressor.decode(
          new Uint8Array(await categoriesValuesArr.store.getItem('0')),
        );
        const categoriesValues = this.decodeTextArray(categoriesBuffer);
        const cellSetsArr = await openArray({
          store: `${url}/${setName.replace('.', '/')}`,
          mode: 'r',
        });
        const cellSetsValues = await cellSetsArr.get();
        const { data } = cellSetsValues;
        const mappedCellSetValues = new Array(...data).map(
          i => categoriesValues[i],
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
      path: path.replace('.', '/'),
      mode: 'r',
    }).then(
      arr => new Promise((resolve) => {
        arr.get().then(resolve);
      }),
    );
  }

  /**
   * Class method for loading the cell names from obs.
   * @returns {Promise} An promise for a zarr array containing the names.
   */
  loadCellNames() {
    if (this.cellNames) {
      return this.cellNames;
    }
    this.cellNames = fetch(`${this.url}/obs/.zattrs`)
      .then(attrs => attrs.json())
      .then(({ _index }) => openArray({
        store: `${this.url}/obs/${_index}`,
        mode: 'r',
      }).then(async (z) => {
        let data = new Uint8Array();
        let item = 0;
        // eslint-disable-next-line no-await-in-loop
        while (await z.store.containsItem(String(item))) {
          // eslint-disable-next-line no-await-in-loop
          const buf = await z.store.getItem(String(item));
          // eslint-disable-next-line no-await-in-loop
          const dbytes = await z.compressor.decode(buf);
          const tmp = new Uint8Array(
            dbytes.buffer.byteLength + data.buffer.byteLength,
          );
          tmp.set(new Uint8Array(data.buffer), 0);
          tmp.set(dbytes, data.buffer.byteLength);
          data = tmp;
          item += 1;
        }
        const text = this.decodeTextArray(data)
          .filter(i => !Number(i))
          .filter(i => i.length > 2);
        return text;
      }));
    return this.cellNames;
  }
}
