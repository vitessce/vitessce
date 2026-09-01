/* eslint-disable no-underscore-dangle */
import { DataFetchError } from '@vitessce/error';

export default class JsonSource {
  constructor({ url, requestInit, queryClient }) {
    this.url = url;
    this.requestInit = requestInit;
    this.queryClient = queryClient;
  }

  async loadJson() {
    if (this._data) return this._data;
    const response = await fetch(this.url, this.requestInit);
    if (!response.ok) {
      throw new DataFetchError(`loadJson failed for ${this.url}`);
    }
    this._data = await response.json();
    return this._data;
  }
}
