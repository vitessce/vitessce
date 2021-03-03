/* eslint-disable no-underscore-dangle */
import { openArray } from 'zarr';
import { extent } from 'd3-array';
import BaseAnnDataLoader from './BaseAnnDataLoader';

const normalize = (arr) => {
  const [min, max] = extent(arr);
  const ratio = 255 / (max - min);
  const data = new Uint8Array(
    arr.map(i => Math.floor((i - min) * ratio)),
  );
  return { data };
};

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
    const [rows, cols, cellXGene] = await Promise.all(['indptr', 'indices', 'data'].map(async (name) => {
      const z = await openArray({ store, path: `${matrix}/${name}`, mode: 'r' });
      const { data } = await z.getRaw(null);
      return data;
    }));
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
    return normalize(cellXGeneMatrix);
  }

  /**
   * Class method for loading column oriented (CSC) sparse data from zarr.
   * @param {string} matrix Location of the matrix.
   * @param {string} shape Shape of the non-sparse output.
   * @returns {Object} A { data: Float32Array } contianing the CellXGene matrix.
   */
  async _loadCSCSparseCellXGene(matrix, shape) {
    const { store } = this;
    const [cols, rows, cellXGene] = await Promise.all(['indptr', 'indices', 'data'].map(async (name) => {
      const z = await openArray({ store, path: `${matrix}/${name}`, mode: 'r' });
      const { data } = await z.getRaw(null);
      return data;
    }));
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
    return normalize(cellXGeneMatrix);
  }

  /**
   * Class method for loading the cell x gene matrix.
   * @returns {Promise} A promise for the zarr array contianing the cell x gene data.
   */
  async loadCellXGene() {
    const { store } = this;
    if (this.cellXGene) {
      return this.cellXGene;
    }
    const {
      options: { matrix },
    } = this;
    const zattrs = await this.getJson(`${matrix}/.zattrs`);
    const encodingType = zattrs['encoding-type'];
    if (encodingType) {
      if (encodingType === 'csr_matrix') {
        this.cellXGene = this._loadCSRSparseCellXGene(matrix, zattrs.shape);
        return this.cellXGene;
      }
      if (encodingType === 'csc_matrix') {
        this.cellXGene = this._loadCSCSparseCellXGene(matrix, zattrs.shape);
        return this.cellXGene;
      }
    }
    if (!this.arr) {
      this.arr = openArray({ store, path: matrix, mode: 'r' });
    }
    this.cellXGene = this.arr.then(z => z.getRaw(null)
      .then(({ data }) => normalize(data)));
    return this.cellXGene;
  }

  /**
   * Class method for loading the genes list from AnnData.var.
   * @returns {Promise} A promise for the zarr array contianing the gene names.
   */
  async loadGeneNames() {
    if (this.geneNames) {
      return this.geneNames;
    }
    const { geneFilter: geneFilterZarr } = this.options;
    let geneFilter;
    if (geneFilterZarr) {
      geneFilter = await this.getFlatArrDecompressed(geneFilterZarr);
    }
    const { _index } = await this.getJson('var/.zattrs');
    if (this.geneNames) {
      return this.geneNames;
    }
    this.geneNames = this.getFlatTextArr(`var/${_index}`).then(data => data.filter(
      (_, j) => !geneFilter || geneFilter[j],
    ));
    return this.geneNames;
  }

  async loadGeneSelection(selection) {
    const {
      options: { matrix },
      store,
    } = this;
    const geneNames = await this.loadGeneNames();
    const indices = selection.map(gene => geneNames.indexOf(gene));
    if (!this.arr) {
      this.arr = openArray({ store, path: matrix, mode: 'r' });
    }
    const genes = await Promise.all(
      indices.map(index => this.arr.then(z => z.get([null, index]))),
    );
    return { data: genes.map(i => normalize(i.data).data), url: null };
  }

  loadAttrs() {
    return Promise
      .all([this.loadCellNames(), this.loadGeneNames()])
      .then((d) => {
        const [cellNames, geneNames] = d;
        const attrs = { rows: cellNames, cols: geneNames };
        return {
          data: attrs,
          url: null,
        };
      });
  }

  load() {
    return Promise
      .all([this.loadAttrs(), this.loadCellXGene()])
      .then((d) => {
        const [{ data: attrs }, cellXGene] = d;
        return {
          data: [
            attrs, cellXGene,
          ],
          url: null,
        };
      });
  }
}
