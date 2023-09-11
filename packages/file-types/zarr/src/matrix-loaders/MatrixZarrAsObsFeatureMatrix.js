import { open as zarrOpen } from '@zarrita/core';
import { createZarrArrayAdapter } from '@vitessce/zarr-utils';
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
    const { storeRoot } = this.dataSource;
    if (this.arr) {
      return this.arr;
    }
    this.arr = zarrOpen(storeRoot.resolve('/'), { kind: 'array' }).then(z => new Promise((resolve) => {
      createZarrArrayAdapter(z).getRaw([null, null])
        .then(resolve);
    }));
    return this.arr;
  }

  load() {
    return Promise
      .all([this.loadAttrs(), this.loadArr()])
      .then(([attrs, arr]) => Promise.resolve(new LoaderResult(
        { obsIndex: attrs.data.rows, featureIndex: attrs.data.cols, obsFeatureMatrix: arr },
        null,
      )));
  }
}
