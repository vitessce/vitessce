import { openArray } from 'zarr';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import LoaderResult from './LoaderResult';

export default class MatrixZarrLoader extends AbstractTwoStepLoader {
  loadAttrs() {
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = this.dataSource.getJson('.zattrs');
    return this.attrs;
  }

  loadArr() {
    const { store } = this.dataSource;
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
      .then(data => Promise.resolve(new LoaderResult(data, null)));
  }
}
