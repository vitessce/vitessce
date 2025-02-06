/**
 * A loader error ancestor class containing a default constructor
 * and a stub for the required warnInConsole() method.
 */

// import { DebugWindow } from '@vitessce/globals';

export default class AbstractLoaderError {
  constructor(message) {
    this.message = message;
  }

  // eslint-disable-next-line class-methods-use-this
  warnInConsole() {
    throw new Error('The warnInConsole() method has not been implemented.');
  }
}
