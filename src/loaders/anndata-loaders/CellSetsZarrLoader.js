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
        const [cellNames, [cellSetIds]] = data;
        // eslint-disable-next-line camelcase
        const { options: [{ group_name }] } = this;
        console.log(cellSetIds, cellNames); // eslint-disable-line
        const cellSets = treeInitialize(SETS_DATATYPE_CELL);
        let leidenNode = {
          name: group_name,
          children: [],
        };
        const uniqueCellSetIds = Array(...(new Set(cellSetIds))).sort();
        const clusters = {};
        // eslint-disable-next-line no-return-assign
        uniqueCellSetIds.forEach(id => clusters[id] = {
          name: id,
          set: [],
        });
        cellSetIds.forEach((id, i) => clusters[id].set.push([cellNames[i], null]));
        Object.values(clusters).forEach(
          // eslint-disable-next-line no-return-assign
          cluster => leidenNode = nodeAppendChild(leidenNode, cluster),
        );
        cellSets.tree.push(leidenNode);
        return { data: cellSets, url: null };
      });
  }
}
