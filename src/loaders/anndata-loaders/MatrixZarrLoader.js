/* eslint-disable no-control-regex */
import { openArray } from 'zarr';
import BaseCellsZarrLoader from './BaseCellsZarrLoader';

export default class MatrixZarrLoader extends BaseCellsZarrLoader {
  loadCellXGene() {
    const { store } = this;
    if (this.arr) {
      return this.arr;
    }
    this.arr = openArray({ store, path: 'X', mode: 'r' }).then(z => new Promise((resolve) => {
      z.getRaw([null, null])
        .then(resolve);
    }));
    return this.arr;
  }

  load() {
    return Promise
      .all([this.loadCellNames(), this.loadGeneNames(), this.loadCellXGene()])
      .then((data) => {
        const [cellNames, geneNames, { data: cellXGene }] = data;
        const attrs = { rows: cellNames, cols: geneNames };
        let max = -Infinity;
        let min = Infinity;
        for (let i = 0; i < cellXGene.length; i += 1) {
          const val = cellXGene[i];
          if (val > max) {
            max = val;
          } else if (val < min) {
            min = val;
          }
        }
        const ratio = 255 / (max - min);
        return {
          data: [
            attrs, { data: new Uint8Array(cellXGene.map(i => Math.floor((i - min) * ratio))) }],
          url: null,
        };
      });
  }
}
