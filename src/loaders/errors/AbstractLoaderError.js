/**
 * A loader error ancestor class containing a default constructor
 * and a stub for the required warnInConsole() method.
 */
export default class AbstractLoaderError {
  constructor(message) {
    this.message = message;
  }

  // eslint-disable-next-line class-methods-use-this
  warnInConsole() {
    throw new Error('The warnInConsole() method has not been implemented.');
  }
}
