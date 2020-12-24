import { openArray } from 'zarr';
import AbstractZarrLoader from './AbstractZarrLoader';

export default class MatrixZarrLoader extends AbstractZarrLoader {
  loadAttrs() {
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = this.getJson('.zattrs');
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
