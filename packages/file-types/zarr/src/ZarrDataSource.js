import { zarrOpenRoot } from '@vitessce/zarr-utils';
import { open as zarrOpen, root as zarrRoot } from 'zarrita';

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class ZarrDataSource {
  constructor({ url, requestInit, store }) {
    if (store) {
      // TODO: check here that it is a valid Zarrita Readable?
      this.storeRoot = zarrRoot(store);
    } else {
      this.storeRoot = zarrOpenRoot(url, requestInit);
    }
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
    // TODO: update calls to not include these file names in the first place.
    if (key.endsWith('.zattrs') || key.endsWith('.zarray') || key.endsWith('.zgroup')) {
      dirKey = key.substring(0, key.length - 8);
    }
    return (await zarrOpen(storeRoot.resolve(dirKey))).attrs;
  }
}
