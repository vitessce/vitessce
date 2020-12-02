import { HTTPStore, openArray } from 'zarr';
import AbstractLoader from '../AbstractLoader';

export default class BaseCellsZarrLoader extends AbstractLoader {
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
      .then(dbytes => new TextDecoder().decode(dbytes).match(/[ACTG]+/g).filter(Boolean)));
    return this.cellNames;
  }
}
