/* eslint-disable no-control-regex */
import {
  treeInitialize,
  nodeAppendChild,
} from '../../components/sets/cell-set-utils';
import {
  SETS_DATATYPE_CELL,
} from '../../components/sets/constants';
import BaseCellsZarrLoader from './BaseCellsZarrLoader';

export default class CellSetsZarrLoader extends BaseCellsZarrLoader {
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
