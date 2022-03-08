/* eslint-disable */
import range from 'lodash/range';
import bboxPolygon from '@turf/bbox-polygon';
import booleanIntersects from '@turf/boolean-intersects';
import { InternMap } from 'internmap';

import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

export default class GenesByFOVZarrLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

  }

  /**
   * Class method for loading factors, which are cell set ids.
   * @returns {Promise} A promise for an array of an array of strings of ids,
   * where subarray is a clustering/factor.
   */
  loadBarcodeIndices() {
    const colname = 'var/barcode_id';
    return this.dataSource.loadNumeric(colname);
  }

  loadBarcodeNames() {
    const colname = 'var/name';
    return this.dataSource._loadVarColumn(colname);
  }

  async load() {
    if (!this.result) {
      this.result = Promise.all([
        this.loadBarcodeIndices(),
        this.loadBarcodeNames(),
      ]).then(([barcodeIndices, barcodeNames]) => {
        const moleculesMetadata = {
          barcodeIndices,
          barcodeNames,
        };
        return moleculesMetadata;
      });
    }
    const attrs = {
      cols: (await this.result).barcodeNames,
      rows: [],
    };
    const arr = { data: new Uint8Array(0) };
    return Promise.resolve(new LoaderResult([attrs, arr]));
  }
}
