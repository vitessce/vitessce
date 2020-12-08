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

  loadSpatial() {
    const { store } = this;
    if (this.spatial) {
      return this.spatial;
    }
    // eslint-disable-next-line
    this.spatial = openArray({ store, path: 'obsm/X_spatial', mode: 'r' }).then(arr => new Promise(resolve => { arr.get().then(resolve) }));
    return this.spatial;
  }

  load() {
    return Promise
      .all([
        this.loadCellNames(),
        this.loadUMAPCoords(),
        this.loadCellSetIds(),
        this.loadSpatial(),
      ])
      .then((data) => {
        const [cellNames,
          { data: umapCoords },
          { data: cellSetIds },
          { data: spatialData }] = data;
        const { options: { spatial } } = this;
        const cells = {};
        // eslint-disable-next-line
        cellNames.forEach((name, i) => cells[name] = { mappings: { UMAP: umapCoords[i] }, [spatial]: spatialData[i], factors: { 'Leiden Cluster': String(cellSetIds[i]) } });
        return { data: cells, url: null };
      });
  }
}
