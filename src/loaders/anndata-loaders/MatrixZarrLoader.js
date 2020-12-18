/* eslint-disable no-underscore-dangle */
import { openArray } from 'zarr';
import { extent } from 'd3-array';
import BaseAnnDataLoader from './BaseAnnDataLoader';

/**
 * Loader for converting zarr into the a cell x gene matrix for use in Genes/Heatmap components.
 */
export default class MatrixZarrLoader extends BaseAnnDataLoader {
  /**
   * Class method for loading row oriented (CSR) sparse data from zarr.
   * @param {string} matrix Location of the matrix.
   * @param {string} shape Shape of the non-sparse output.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSRSparseCellXGene(matrix, shape) {
    const { store } = this;
    const { data: rows } = await openArray({ store, path: `${matrix}/indptr`, mode: 'r' }).then(z => z.getRaw(null));
    const { data: cols } = await openArray({ store, path: `${matrix}/indices`, mode: 'r' }).then(z => z.getRaw(null));
    const { data: cellXGene } = await openArray({ store, path: `${matrix}/data`, mode: 'r' }).then(z => z.getRaw(null));
    const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
    let row = 0;
    rows.forEach((_, index) => {
      const rowStart = rows[index];
      const rowEnd = rows[index + 1];
      for (let i = rowStart; i < rowEnd; i += 1) {
        const val = cellXGene[i];
        const col = cols[i];
        cellXGeneMatrix[row * shape[1] + col] = val;
      }
      row += 1;
    });
    return { data: cellXGeneMatrix };
  }

  /**
   * Class method for loading column oriented (CSC) sparse data from zarr.
   * @param {string} matrix Location of the matrix.
   * @param {string} shape Shape of the non-sparse output.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSCSparseCellXGene(matrix, shape) {
    const { store } = this;
    const { data: cols } = await openArray({ store, path: `${matrix}/indptr`, mode: 'r' }).then(z => z.getRaw(null));
    const { data: rows } = await openArray({ store, path: `${matrix}/indices`, mode: 'r' }).then(z => z.getRaw(null));
    const { data: cellXGene } = await openArray({ store, path: `${matrix}/data`, mode: 'r' }).then(z => z.getRaw(null));
    const cellXGeneMatrix = new Float32Array(shape[0] * shape[1]).fill(0);
    let col = 0;
    cols.forEach((_, index) => {
      const colStart = cols[index];
      const colEnd = cols[index + 1];
      for (let i = colStart; i < colEnd; i += 1) {
        const val = cellXGene[i];
        const row = rows[i];
        cellXGeneMatrix[row * shape[1] + col] = val;
      }
      col += 1;
    });
    return { data: cellXGeneMatrix };
  }

  /**
   * Class method for loading the cell x gene matrix.
   * @returns {Promise} A promise for the zarr array contianing the cell x gene data.
   */
  async loadCellXGene() {
    const { store } = this;
    if (this.arr) {
      return this.arr;
    }
    const {
      options: { matrix },
    } = this;
    const zattrs = await this.getJson(`${matrix}/.zattrs`);
    const encodingType = zattrs['encoding-type'];
    if (encodingType) {
      if (encodingType === 'csr_matrix') {
        this.arr = this._loadCSRSparseCellXGene(matrix, zattrs.shape);
        return this.arr;
      }
      if (encodingType === 'csc_matrix') {
        this.arr = this._loadCSCSparseCellXGene(matrix, zattrs.shape);
        return this.arr;
      }
    }
    this.arr = openArray({ store, path: matrix, mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    return this.arr;
  }

  /**
   * Class method for loading the genes list from AnnData.var.
   * @returns {Promise} A promise for the zarr array contianing the gene names.
   */
  async loadGeneNames() {
    if (this.geneNames) {
      return this.geneNames;
    }
    const { store } = this;
    const { geneFilter: geneFilterZarr } = this.options;
    let geneFilter;
    if (geneFilterZarr) {
      const geneFilterArr = await openArray({
        store,
        path: geneFilterZarr,
        mode: 'r',
      });
      const genesBufferCompressed = await store.getItem(`${geneFilterArr.keyPrefix}0`);
      geneFilter = await geneFilterArr.compressor.decode(genesBufferCompressed);
    }
    const { _index } = await this.getJson('var/.zattrs');
    if (this.geneNames) {
      return this.geneNames;
    }
    this.geneNames = openArray({
      store,
      path: `var/${_index}`,
      mode: 'r',
    }).then(z => z.store
      .getItem(`${z.keyPrefix}0`)
      .then(buf => new Uint8Array(buf))
      .then(cbytes => z.compressor.decode(cbytes))
      .then((dbytes) => {
        const text = this.decodeTextArray(dbytes)
          .filter(i => !Number(i))
          .filter(i => i.length >= 2)
          .filter((_, j) => !geneFilter || geneFilter[j]);
        return text;
      }));
    return this.geneNames;
  }

  load() {
    return Promise
      .all([this.loadCellNames(), this.loadGeneNames(), this.loadCellXGene()])
      .then((d) => {
        const [cellNames, geneNames, { data: cellXGeneMatrix }] = d;
        const attrs = { rows: cellNames, cols: geneNames };
        if (!this.min || !this.max) {
          [this.min, this.max] = extent(cellXGeneMatrix);
        }
        const ratio = 255 / (this.max - this.min);
        const data = new Uint8Array(cellXGeneMatrix.map(i => Math.floor((i - this.min) * ratio)));
        return {
          data: [
            attrs, { data },
          ],
          url: null,
        };
      });
  }
}
