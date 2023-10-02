/* eslint-disable no-underscore-dangle */
import { DataSource } from '@vitessce/types';
import { csvParse } from 'd3-dsv';
import { DataSourceFetchError } from '@vitessce/vit-s';

export default class CsvSource extends DataSource {
  _data: ReturnType<typeof csvParse> | undefined;

  async getData() {
    if (this._data) return this._data;
    if (!this.url) throw new DataSourceFetchError('CsvSource', this.url, {});

    const res = await fetch(this.url, this.requestInit);
    if (!res.ok) {
      throw new DataSourceFetchError('CsvSource', this.url, res.headers);
    }
    try {
      const data = await res.text();
      this._data = csvParse(data);
      return this._data;
    } catch (error) {
      throw new DataSourceFetchError('CsvSource', this.url, res.headers);
    }
  }
}
