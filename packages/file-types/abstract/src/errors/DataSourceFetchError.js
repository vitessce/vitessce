import { log, getDebugMode, saveError } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class DataSourceFetchError extends AbstractLoaderError {
  constructor(source, url, headers) {
    super(`${source} Error HTTP Status fetching from ${url}`);
    this.source = source;
    this.url = url;
    this.headers = headers;
    this.debugMode = getDebugMode();
    this.message = `${source} failed to fetch from ${url} with headers ${JSON.stringify(headers)}`;

    if (this.debugMode) {
      saveError({ ...this });
    }
  }

  warnInConsole() {
    const { message } = this;
    log.warn(message);
  }
}
