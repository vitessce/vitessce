import { openLru } from '@vitessce/zarr-utils';
import { open as zarrOpen } from 'zarrita';

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class ZarrDataSource {
  constructor({ url, requestInit }) {
    this.storeRoot = openLru(url, requestInit);
  }

  /**
   * Class method for decoding json from the store.
   * @param {string} key A path to the item.
   * @returns {Promise} This async function returns a promise
   * that resolves to the parsed JSON if successful.
   * @throws This may throw an error.
   */
  async getJson(key) {
    const { storeRoot } = this;

    let dirKey = key;
    if (key.endsWith('.zattrs') || key.endsWith('.zarray') || key.endsWith('.zgroup')) {
      dirKey = key.substring(0, key.length - 8);
    }
    return (await zarrOpen((await storeRoot).resolve(dirKey))).attrs;
  }
}
