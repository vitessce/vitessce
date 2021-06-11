import { openArray } from 'zarr';
import range from 'lodash/range';
import AbstractZarrLoader from '../AbstractZarrLoader';
import TextDecodingPool from './TextDecodingPool';

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
      const Pool = new TextDecodingPool();
      const parseAndMergeTextBytes = async (dbytes, index) => {
        const text = await Pool.process(dbytes);
        if (!data) {
          data = text;
        } else {
          const insertion = z.meta.chunks[0] * index;
          data = data.slice(0, insertion).concat(text).concat(data.slice(insertion));
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
        .then(buf => z.compressor.decode(buf)));
      const dbytesArr = await Promise.all(requests);
      await Promise.all(dbytesArr.map(async (dbytes, index) => {
        // Use vlenutf-8 decoding if necessary and merge `data` as a normal array.
        if (Array.isArray(z.meta.filters) && z.meta.filters[0].id === 'vlen-utf8') {
          await parseAndMergeTextBytes(dbytes, index);
          // Otherwise just merge the bytes as a typed array.
        } else {
          mergeBytes(dbytes);
        }
      }));
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
