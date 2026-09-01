import { open as zarrOpen } from 'zarrita';
import { createZarrArrayAdapter } from '@vitessce/zarr-utils';
import { AbstractTwoStepLoader, LoaderResult, allocateDenseMatrix } from '@vitessce/abstract';
import { getBytesPerElement } from '../anndata-loaders/utils.js';

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

  async loadArr() {
    const { storeRoot } = this.dataSource;
    if (this.arr) {
      return this.arr;
    }
    const z = await zarrOpen(storeRoot, { kind: 'array' });
    this.arr = await allocateDenseMatrix({
      source: `"${this.url?.split('?')[0]}"`,
      shape: z.shape,
      bytesPerElement: getBytesPerElement(z.dtype),
      // zarrita allocates the whole selection up front.
      allocate: () => createZarrArrayAdapter(z).getRaw([null, null]),
    });
    return this.arr;
  }

  async load() {
    const [attrs, arr] = await Promise.all([this.loadAttrs(), this.loadArr()]);
    return new LoaderResult(
      { obsIndex: attrs.data.rows, featureIndex: attrs.data.cols, obsFeatureMatrix: arr },
      null,
    );
  }
}
