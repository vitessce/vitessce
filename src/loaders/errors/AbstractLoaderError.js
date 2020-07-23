/**
 * A loader error ancestor class containing a default constructor
 * and a stub for the required warnInConsole() method.
 */
export default class AbstractLoaderError extends Error {
  // eslint-disable-next-line class-methods-use-this
  warnInConsole() {
    throw new Error('The warnInConsole() method has not been implemented.');
  }
}
