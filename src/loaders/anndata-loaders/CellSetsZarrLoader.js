/* eslint-disable no-control-regex */
import { HTTPStore, openArray } from 'zarr';

import {
  treeInitialize,
  nodeAppendChild,
} from '../../components/sets/cell-set-utils';
import {
  SETS_DATATYPE_CELL,
} from '../../components/sets/constants';
import AbstractLoader from '../AbstractLoader';

export default class CellSetsZarrLoader extends AbstractLoader {
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

  load() {
    return Promise
      .all([this.loadCellNames(), this.loadCellSetIds()])
      .then((data) => {
        const [cellNames, { data: cellSetIds }] = data;
        const cellSets = treeInitialize(SETS_DATATYPE_CELL);
        let leidenNode = {
          name: 'Leiden Cluster',
          children: [],
        };
        const uniqueCellSetIds = Array(...(new Set(cellSetIds))).sort();
        const leidenClusters = uniqueCellSetIds.map(id => ({
          name: `Cluster ${id}`,
          set: [],
        }));
        cellSetIds.forEach((id, i) => leidenClusters[id].set.push([cellNames[i], null]));
        // eslint-disable-next-line no-return-assign
        leidenClusters.forEach(cluster => leidenNode = nodeAppendChild(leidenNode, cluster));
        cellSets.tree.push(leidenNode);
        console.log(cellSets) // eslint-disable-line
        return { data: cellSets, url: null };
      });
  }
}
