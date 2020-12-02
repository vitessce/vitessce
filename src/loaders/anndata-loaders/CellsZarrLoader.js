import { openArray } from 'zarr';
import BaseCellsZarrLoader from './BaseCellsZarrLoader';

export default class CellsZarrLoader extends BaseCellsZarrLoader {
  loadUMAPCoords() {
    const { store } = this;
    if (this.UMAPCoords) {
      return this.UMAPCoords;
    }
    // eslint-disable-next-line
    this.UMAPCoords = openArray({ store, path: 'obsm/X_umap', mode: 'r' }).then(arr => new Promise(resolve => { arr.get().then(resolve) }));
    return this.UMAPCoords;
  }

  loadSlideSEQCoords() {
    const { store } = this;
    if (this.slideSEQCoords) {
      return this.slideSEQCoords;
    }
    // eslint-disable-next-line
    this.slideSEQCoords = openArray({ store, path: 'obsm/X_slideseq', mode: 'r' }).then(arr => new Promise(resolve => { arr.get().then(resolve) }));
    return this.slideSEQCoords;
  }

  load() {
    return Promise
      .all([
        this.loadCellNames(),
        this.loadUMAPCoords(),
        this.loadCellSetIds(),
        this.loadSlideSEQCoords(),
      ])
      .then((data) => {
        const [cellNames,
          { data: umapCoords },
          { data: cellSetIds },
          { data: slideSEQCoords }] = data;
        const cells = {};
        // eslint-disable-next-line
        cellNames.forEach((name, i) => cells[name] = { mappings: { UMAP: umapCoords[i] }, xy: slideSEQCoords[i], poly: [], factors: { 'Leiden Cluster': String(cellSetIds[i]) } });
        console.log(cells, cellNames, cellSetIds, slideSEQCoords); // eslint-disable-line
        return { data: cells, url: null };
      });
  }
}
