import AbstractLoaderError from './AbstractLoaderError.js';

export default class DataSourceFetchError extends AbstractLoaderError {
  constructor(source, url, headers) {
    super(`${source} Error HTTP Status fetching from ${url}`);
    this.source = source;
    this.url = url;
    this.headers = headers;
  }

  warnInConsole() {
    const { source, url, headers } = this;
    console.warn(`${source} failed to fetch from ${url} with headers ${JSON.stringify(headers)}`);
  }
}
