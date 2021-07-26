/* eslint-disable no-control-regex */
import {
  treeInitialize,
  nodeAppendChild,
  initializeCellSetColor,
} from '../../components/sets/cell-set-utils';
import {
  SETS_DATATYPE_CELL,
} from '../../components/sets/constants';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import LoaderResult from '../LoaderResult';

/**
 * Loader for converting zarr into the cell sets json schema.
 */
export default class CellSetsZarrLoader extends AbstractTwoStepLoader {
  async load() {
    if (!this.cellSetsTree) {
      const { options } = this;
      // eslint-disable-next-line camelcase
      const cellSetZarrLocation = options.map(({ setName }) => setName);
      this.cellSetsTree = Promise.all([
        this.dataSource.loadCellNames(),
        this.dataSource.loadCellSetIds(cellSetZarrLocation),
      ]).then((data) => {
        const [cellNames, cellSets] = data;
        const cellSetsTree = treeInitialize(SETS_DATATYPE_CELL);
        cellSets.forEach((cellSetIds, j) => {
          const name = options[j].groupName;
          let levelZeroNode = {
            name,
            children: [],
          };
          const uniqueCellSetIds = Array(...new Set(cellSetIds)).sort();
          const clusters = {};
          // eslint-disable-next-line no-return-assign
          uniqueCellSetIds.forEach(id => (clusters[id] = { name: id, set: [] }));
          cellSetIds.forEach((id, i) => clusters[id].set.push([cellNames[i], null]));
          Object.values(clusters).forEach(
            // eslint-disable-next-line no-return-assign
            cluster => (levelZeroNode = nodeAppendChild(levelZeroNode, cluster)),
          );
          cellSetsTree.tree.push(levelZeroNode);
        });
        return cellSetsTree;
      });
    }
    const cellSetsTree = await this.cellSetsTree;
    const coordinationValues = {};
    const { tree } = cellSetsTree;
    const newAutoSetSelectionParentName = tree[0].name;
    // Create a list of set paths to initally select.
    const newAutoSetSelections = tree[0].children.map(node => [
      newAutoSetSelectionParentName,
      node.name,
    ]);
    // Create a list of cell set objects with color mappings.
    const newAutoSetColors = initializeCellSetColor(cellSetsTree, []);
    coordinationValues.cellSetSelection = newAutoSetSelections;
    coordinationValues.cellSetColor = newAutoSetColors;
    return Promise.resolve(
      new LoaderResult(cellSetsTree, null, coordinationValues),
    );
  }
}
