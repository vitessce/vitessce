import { log } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class DataTypeValidationError extends AbstractLoaderError {
  constructor(errorType, errorMessage1, errorMessage2, url, uid) {
    super(`The provided file does not meet the requirements to be visualized: ${errorMessage1}`);
    this.uid = uid;
    this.name = 'DataTypeValidationError';
    this.message = `Validation error:${errorMessage1 ? ` ${errorMessage1}.` : ''}${errorMessage2 ? ` ${errorMessage2}.` : ''}`;
    this.errorType = errorType;
    this.url = url;
  }

  warnInConsole() {
    const { message } = this;
    log.warn(message);
  }
}
