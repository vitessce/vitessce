import uuidv4 from 'uuid/v4';
import { KeyError } from 'zarr';

/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractLoader {
  constructor({
    type, url, requestInit, options,
  }) {
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;
    this.options = options;

    this.subscriptions = {};
  }

  // eslint-disable-next-line class-methods-use-this
  load() {
    throw new Error('The load() method has not been implemented.');
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

  subscribe(subscriber) {
    const token = uuidv4();
    this.subscriptions[token] = subscriber;
    return token;
  }

  unsubscribe(token) {
    delete this.subscriptions[token];
  }

  publish(data) {
    Object.values(this.subscriptions).forEach((subscriber) => {
      subscriber(data);
    });
  }
}
