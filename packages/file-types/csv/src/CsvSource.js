/* eslint-disable no-underscore-dangle */
import { csvParse } from 'd3-dsv';
import { DataSourceFetchError, AbstractLoaderError } from '@vitessce/abstract';

export default class CsvSource {
  constructor({ url, requestInit }) {
    this.url = url;
    this.requestInit = requestInit;
  }

  get data() {
    if (this._data) return this._data;
    this._data = fetch(this.url, this.requestInit).then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('CsvSource', this.url, response.headers));
      }
      return response.text();
    // eslint-disable-next-line no-console
    }).catch(() => Promise.reject(new DataSourceFetchError('CsvSource', this.url, {})))
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        return csvParse(data);
      });
    return this._data;
  }
}
