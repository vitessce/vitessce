import { HTTPStore, openArray } from 'zarr';
import AbstractLoader from '../AbstractLoader';

export default class CellsZarrLoader extends AbstractLoader {
  constructor(params) {
    super(params);

    // TODO: Use this.requestInit to provide headers, tokens, etc.
    // eslint-disable-next-line no-unused-vars
    const { url, requestInit } = this;
    this.store = new HTTPStore(url);
  }

  loadCellSetIds() {
    const { url } = this;
    if (this.cellSets) {
      return this.cellSets;
    }
    this.cellSets = openArray({ store: `${url}/obs/leiden`, mode: 'r' }).then(arr => new Promise(resolve => arr.get().then(resolve)));
    return this.cellSets;
  }

  loadCellNames() {
    const { url } = this;
    if (this.cellNames) {
      return this.cellNames;
    }
    this.cellNames = openArray({ store: `${url}/obs/_index`, mode: 'r' }).then(z => z.store
      .getItem('0')
      .then(buf => new Uint8Array(buf))
      .then(cbytes => z.compressor.decode(cbytes))
      // eslint-disable-next-line no-control-regex
      .then(dbytes => new TextDecoder().decode(dbytes)
        .replace(/\0/g, '')
        .replace(/\cP/g, ',')
        .replace(RegExp(String.fromCharCode(30), 'g'), '')
        .split(',')
        .slice(1)));
    return this.cellNames;
  }

  loadUMAPCoords() {
    const { store } = this;
    if (this.UMAPCoords) {
      return this.UMAPCoords;
    }
    // eslint-disable-next-line
    this.UMAPCoords = openArray({ store, path: 'obsm/X_umap', mode: 'r' }).then(arr => new Promise(resolve => { arr.get().then(resolve) }));
    return this.UMAPCoords;
  }

  load() {
    return Promise
      .all([this.loadCellNames(), this.loadUMAPCoords(), this.loadCellSetIds()])
      .then((data) => {
        const [cellNames, { data: umapCoords }, { data: cellSetIds }] = data;
        const cells = {};
        // eslint-disable-next-line no-return-assign,max-len
        cellNames.forEach((name, i) => cells[name] = { mappings: { UMAP: umapCoords[i] }, factors: { 'Leiden Cluster': String(cellSetIds[i]) } });
        return { data: cells, url: null };
      });
  }
}
