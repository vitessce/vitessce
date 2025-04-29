import { log } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class OptimizationError extends AbstractLoaderError {
  constructor(errorType, errorMessage, url, uid) {
    super(`The provided file does not meet the requirements to be visualized: ${errorMessage}`);
    this.uid = uid;
    this.name = 'OptimizationError';
    this.message = `Optimization error: ${errorMessage} This will improve the performance of your OME-TIFF file`;
    this.errorType = errorType;
    this.url = url;
  }

  warnInConsole() {
    const { message } = this;
    log.warn(message);
  }
}
