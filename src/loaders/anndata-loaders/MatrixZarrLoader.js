/* eslint-disable no-control-regex */
import { openArray } from 'zarr';
import BaseCellsZarrLoader from './BaseCellsZarrLoader';

export default class MatrixZarrLoader extends BaseCellsZarrLoader {
  async loadCSRSparseCellXGene(zattrs) {
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

  async loadCSCSparseCellXGene(zattrs) {
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
        this.arr = this.loadCSRSparseCellXGene(zattrs);
        return this.arr;
      }
      if (zattrs['encoding-type'] === 'csc_matrix') {
        this.arr = this.loadCSCSparseCellXGene(zattrs);
        return this.arr;
      }
    }
    this.arr = openArray({ store, path: matrix.replace('.', '/'), mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw(null)
        .then(resolve);
    }));
    return this.arr;
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
