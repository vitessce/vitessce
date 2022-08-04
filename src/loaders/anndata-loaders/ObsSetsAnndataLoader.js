/* eslint-disable no-control-regex */
import { obsSetsAnndataSchema } from '../../app/file-options-schemas';
import {
  initializeCellSetColor, treeToMembershipMap,
} from '../../components/sets/cell-set-utils';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import { AbstractLoaderError } from '../errors';
import LoaderResult from '../LoaderResult';
import { dataToCellSetsTree } from './CellSetsZarrLoader';


/**
 * Loader for converting zarr into the cell sets json schema.
 */
export default class ObsSetsAnndataLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.optionsSchema = obsSetsAnndataSchema;
  }

  loadCellSetIds() {
    const { options } = this;
    const cellSetZarrLocation = options.map(({ path }) => path);
    return this.dataSource.loadObsColumns(cellSetZarrLocation);
  }

  loadCellSetScores() {
    const { options } = this;
    const cellSetScoreZarrLocation = options.map(option => option.scorePath || undefined);
    return this.dataSource.loadObsColumns(cellSetScoreZarrLocation);
  }

  async load() {
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    if (!this.cellSetsTree) {
      const { options } = this;
      this.cellSetsTree = Promise.all([
        this.dataSource.loadObsIndex(),
        this.loadCellSetIds(),
        this.loadCellSetScores(),
      ]).then(data => dataToCellSetsTree(data, options));
    }
    const cellSetsTree = await this.cellSetsTree;
    const obsSetsMembership = treeToMembershipMap(cellSetsTree);
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
    coordinationValues.obsSetSelection = newAutoSetSelections;
    coordinationValues.obsSetColor = newAutoSetColors;
    return Promise.resolve(
      new LoaderResult({ obsSets: cellSetsTree, obsSetsMembership }, null, coordinationValues),
    );
  }
}
