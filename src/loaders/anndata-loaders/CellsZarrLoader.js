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

  loadAttrs() {
    const { store } = this;
    if (this.attrs) {
      return this.attrs;
    }
    this.attrs = store.getItem('.zattrs')
      .then((bytes) => {
        const decoder = new TextDecoder('utf-8');
        const json = JSON.parse(decoder.decode(bytes));
        return json;
      });
    return this.attrs;
  }

  loadCellNames() {
    const { store } = this;
    if (this.cellNames) {
      return this.cellNames;
    }
    this.cellNames = openArray({ store, path: '/obs/_index', mode: 'r' }).then(z => z.store
      .getItem('0')
      .then(buf => new Uint8Array(buf))
      .then(cbytes => z.compressor.decode(cbytes))
      .then(dbytes => new TextDecoder().decode(dbytes)));
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

  loadPCACoords() {
    const { store } = this;
    if (this.PCACoords) {
      return this.PCACoords;
    }
    // eslint-disable-next-line
    this.PCACoords = openArray({ store, path: 'obsm/X_pca', mode: 'r' }).then(arr => new Promise(resolve => { arr.get().then(resolve) }));
    return this.PCACoords;
  }

  load() {
    return Promise
      .all([this.loadAttrs(), this.loadPCACoords(), this.loadUMAPCoords()])
      .then(data => Promise.resolve({ data, url: null }));
  }
}
