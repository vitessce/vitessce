import { HTTPStore, openArray } from 'zarr';
import AbstractLoader from './AbstractLoader';

export default class MatrixZarrLoader extends AbstractLoader {
  constructor(params) {
    super(params);

    // TODO: Use this.requestInit to provide headers, tokens, etc.
    // eslint-disable-next-line no-unused-vars
    const { url, requestInit } = this;
    this.store = new HTTPStore(url);
  }

  loadAttrs() {
    const { store } = this;
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = store.getItem('.zattrs')
      .then((bytes) => {
        const decoder = new TextDecoder('utf-8');
        const json = JSON.parse(decoder.decode(bytes));
        return json;
      });
    return this.attrs;
  }

  loadArr() {
    const { store } = this;
    if (this.arr) {
      return this.arr;
    }
    this.arr = openArray({ store, path: '/', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw([null, null])
        .then(resolve);
    }));
    return this.arr;
  }

  load() {
    return Promise
      .all([this.loadAttrs(), this.loadArr()])
      .then(data => Promise.resolve({ data, url: null }));
  }
}
