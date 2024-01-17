/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractLoader {
  constructor({
    type, fileType,
    url, requestInit,
    options, coordinationValues,
  }) {
    this.fileType = fileType;
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;
    this.options = options;
    this.coordinationValues = coordinationValues;
  }

  // eslint-disable-next-line class-methods-use-this
  load() {
    return Promise.resolve(true);
  }
}
