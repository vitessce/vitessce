/* eslint-disable no-underscore-dangle */
import { csvParse } from 'd3-dsv';

export default class CsvSource {
  constructor({ url, requestInit }) {
    this.url = url;
    this.requestInit = requestInit;
  }

  async loadCsv() {
    if (this._data) return this._data;
    const response = await fetch(this.url, this.requestInit);
    if (!response.ok) {
      throw new DataFetchError('CsvSource', this.url, response.headers);
    }
    const responseText = await response.text();
    this._data = csvParse(responseText);
    return this._data;
  }
}
