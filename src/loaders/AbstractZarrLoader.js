import { HTTPStore, KeyError } from 'zarr';
import AbstractLoader from './AbstractLoader';

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractZarrLoader extends AbstractLoader {
  constructor(params) {
    super(params);

    // eslint-disable-next-line no-unused-vars
    const { url, requestInit } = this;
    console.log(requestInit); // eslint-disable-line
    this.store = new HTTPStore(url, { fetchOptions: requestInit });
  }

  /**
   * Class method for decoding json from the store.
   * @param {string} key A path to the item.
   * @returns {Promise} This async function returns a promise
   * that resolves to the parsed JSON if successful.
   * @throws This may throw an error.
   */
  async getJson(key) {
    try {
      const buf = await this.store.getItem(key);
      const text = new TextDecoder('utf-8').decode(buf);
      return JSON.parse(text);
    } catch (err) {
      if (err instanceof KeyError) {
        return {};
      }
      throw err;
    }
  }
}
