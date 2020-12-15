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
    const { options } = this;
    // eslint-disable-next-line camelcase
    const cellSetZarrLocation = options.map(({ set_name }) => set_name);
    return Promise
      .all([this.loadCellNames(), this.loadCellSetIds(cellSetZarrLocation)])
      .then((data) => {
        const [cellNames, cellSets] = data;
        const cellSetsTree = treeInitialize(SETS_DATATYPE_CELL);
        cellSets.forEach((cellSetIds, j) => {
          const name = options[j].group_name;
          let levelZeroNode = {
            name,
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
            cluster => levelZeroNode = nodeAppendChild(levelZeroNode, cluster),
          );
          cellSetsTree.tree.push(levelZeroNode);
        });
        return Promise.resolve({ data: cellSetsTree, url: null });
      });
  }
}
