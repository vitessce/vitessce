/* eslint-disable no-underscore-dangle */
import { openArray } from 'zarr';
import BaseAnnDataLoader from './BaseAnnDataLoader';

/**
 * Loader for converting zarr into the a cell x gene matrix for use in Genes/Heatmap components.
 */
export default class MatrixZarrLoader extends BaseAnnDataLoader {
  /**
   * Class method for loading row oriented (CSR) sparse data from zarr.
   * @param {string} zattrs The zattrs file for the X store,
   * containing the shape of the non-sparse output.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSRSparseCellXGene(zattrs) {
    const { store } = this;
    const { data: rows } = await openArray({ store, path: 'X/indptr', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    const { data: cols } = await openArray({ store, path: 'X/indices', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    const { data: cellXGene } = await openArray({ store, path: 'X/data', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    const { shape } = zattrs;
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
   * @param {string} zattrs The zattrs file for the X store,
   * containing the shape of the non-sparse output.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSCSparseCellXGene(zattrs) {
    const { store } = this;
    const { data: cols } = await openArray({ store, path: 'X/indptr', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    const { data: rows } = await openArray({ store, path: 'X/indices', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    const { data: cellXGene } = await openArray({ store, path: 'X/data', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    const { shape } = zattrs;
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
    const { store, url } = this;
    if (this.arr) {
      return this.arr;
    }
    const {
      options: { matrix },
    } = this;
    const res = await fetch(`${url}/${matrix}/.zattrs`);
    if (matrix === 'X' && res.status !== 404) {
      const zattrs = await res.json();
      if (zattrs['encoding-type'] === 'csr_matrix') {
        this.arr = this._loadCSRSparseCellXGene(zattrs);
        return this.arr;
      }
      if (zattrs['encoding-type'] === 'csc_matrix') {
        this.arr = this._loadCSCSparseCellXGene(zattrs);
        return this.arr;
      }
    }
    this.arr = openArray({ store, path: matrix.replace('.', '/'), mode: 'r' }).then(z => new Promise((resolve) => {
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
    const { genesFilter: genesFilterZarr } = this.options;
    let genesFilter;
    if (genesFilterZarr) {
      const genesFilterArr = await openArray({
        store: `${this.url}/${genesFilterZarr.replace('.', '/')}`,
        mode: 'r',
      });
      const genesBufferCompressed = await genesFilterArr.store.getItem('0');
      genesFilter = await genesFilterArr.compressor.decode(genesBufferCompressed);
    }
    const res = await fetch(`${this.url}/var/.zattrs`);
    const { _index } = await res.json();
    if (this.geneNames) {
      return this.geneNames;
    }
    this.geneNames = openArray({
      store: `${this.url}/var/${_index}`,
      mode: 'r',
    }).then(z => z.store
      .getItem('0')
      .then(buf => new Uint8Array(buf))
      .then(cbytes => z.compressor.decode(cbytes))
      .then((dbytes) => {
        const text = this.decodeTextArray(dbytes)
          .filter(i => !Number(i))
          .filter(i => i.length >= 2)
          .filter((_, j) => !genesFilter || genesFilter[j]);
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
          let max = -Infinity;
          let min = Infinity;
          for (let i = 0; i < cellXGeneMatrix.length; i += 1) {
            const val = cellXGeneMatrix[i];
            if (val > max) {
              max = val;
            } else if (val < min) {
              min = val;
            }
          }
          this.min = min;
          this.max = max;
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
