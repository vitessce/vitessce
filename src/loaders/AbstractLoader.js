/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractLoader {
  constructor({
    name, type, url, requestInit,
  }) {
    this.name = name;
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;
  }

  // eslint-disable-next-line class-methods-use-this
  load() {
    throw new Error('The load() method has not been implemented.');
  }
}
