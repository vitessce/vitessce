import { log } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class DataSourceFetchError extends AbstractLoaderError {
  constructor(source, url, headers) {
    super(`${source} Error HTTP Status fetching from ${url}`);
    this.source = source;
    this.url = url;
    this.headers = headers;
    this.message = `${source} failed to fetch from ${url} with headers ${JSON.stringify(headers)}`;
  }

  warnInConsole() {
    const { message } = this;
    log.warn(message);
  }
}
