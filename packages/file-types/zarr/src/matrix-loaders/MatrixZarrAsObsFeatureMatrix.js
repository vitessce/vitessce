import { openArray } from 'zarr';
import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';

export default class MatrixZarrAsObsFeatureMatrixLoader extends AbstractTwoStepLoader {
  async loadAttrs() {
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = {
      data: await this.dataSource.getJson('.zattrs'),
      url: null,
    };
    return this.attrs;
  }

  loadArr() {
    const { store } = this.dataSource;
    if (this.arr) {
      return this.arr;
    }
    this.arr = openArray({ store, path: '/', mode: 'r' }).then(
      z => new Promise((resolve) => {
        z.getRaw([null, null]).then(resolve);
      }),
    );
    return this.arr;
  }

  load() {
    return Promise.all([this.loadAttrs(), this.loadArr()]).then(
      ([attrs, arr]) => Promise.resolve(
        new LoaderResult(
          {
            obsIndex: attrs.data.rows,
            featureIndex: attrs.data.cols,
            obsFeatureMatrix: arr,
          },
          null,
        ),
      ),
    );
  }
}
