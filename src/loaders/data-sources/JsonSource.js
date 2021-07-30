/* eslint-disable no-underscore-dangle */
import DataSourceFetchError from '../errors/DataSourceFetchError';

export default class JsonSource {
  constructor({ url, requestInit }) {
    this._fetch = () => fetch(url, requestInit);
    this._url = url;
  }

  get data() {
    if (this._data) return this._data;
    this._data = this._fetch().then((response) => {
      if (!response.ok) {
        return Promise.reject(new DataSourceFetchError('JsonSource', this._url, response.headers));
      }
      return response.json();
    });
    return this._data;
  }
}
