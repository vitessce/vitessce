/* eslint-disable no-underscore-dangle */
import { DataSourceFetchError } from '@vitessce/abstract';

export default class JsonSource {
  constructor({ url, requestInit }) {
    this.url = url;
    this.requestInit = requestInit;
  }

  get data() {
    if (this._data) return this._data;
    this._data = fetch(this.url, this.requestInit).then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('JsonSource', this.url, response.headers));
      }
      return response.json();
    // eslint-disable-next-line no-console
    }).catch(() => Promise.reject(new DataSourceFetchError('JsonSource', this.url, {})));
    return this._data;
  }
}
