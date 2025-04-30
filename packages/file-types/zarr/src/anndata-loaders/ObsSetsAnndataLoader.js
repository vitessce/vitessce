import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import {
  initializeCellSetColor,
  treeToMembershipMap,
  dataToCellSetsTree,
} from '@vitessce/sets-utils';


/**
 * Loader for converting zarr into the cell sets json schema.
 */
export default class ObsSetsAnndataLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    // These are used by the subclass SpatialDataObsSetsLoader.
    this.region = null;
    this.tablePath = null;
  }

  loadObsIndices() {
    const { options } = this;
    const obsIndexPromises = options
      .obsSets
      ?.map(({ path }) => path)
      .map((pathOrPaths) => {
        if (Array.isArray(pathOrPaths)) {
          // The multi-level case, try using the first item to get the obsIndex.
          if (pathOrPaths.length > 0) {
            return this.dataSource.loadObsIndex(pathOrPaths[0]);
          }
          // pathOrPaths should not be of length 0, but if so, fall back to the default obsIndex.
          return this.dataSource.loadObsIndex();
        }
        // The single-level case.
        return this.dataSource.loadObsIndex(pathOrPaths);
      });
    return Promise.all(obsIndexPromises);
  }

  loadCellSetIds() {
    const { options } = this;
    const cellSetZarrLocation = options.obsSets?.map(({ path }) => path);
    return this.dataSource.loadObsColumns(cellSetZarrLocation);
  }

  loadCellSetScores() {
    const { options } = this;
    const cellSetScoreZarrLocation = options.obsSets?.map(option => option.scorePath || undefined);
    return this.dataSource.loadObsColumns(cellSetScoreZarrLocation);
  }

  async load() {
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    if (!this.cachedResult) {
      const { options } = this;
      this.cachedResult = Promise.all([
        this.dataSource.loadObsIndex(this.tablePath),
        this.loadObsIndices(),
        this.loadCellSetIds(),
        this.loadCellSetScores(),
      ]).then(data => [data[0], dataToCellSetsTree([data[1], data[2], data[3]], options.obsSets)]);
    }
    const [obsIndex, obsSets] = await this.cachedResult;
    const obsSetsMembership = treeToMembershipMap(obsSets);
    const coordinationValues = {};
    const { tree } = obsSets;
    const newAutoSetSelectionParentName = tree[0].name;
    // Create a list of set paths to initally select.
    const newAutoSetSelections = tree[0].children.map(node => [
      newAutoSetSelectionParentName,
      node.name,
    ]);
    // Create a list of cell set objects with color mappings.
    const newAutoSetColors = initializeCellSetColor(obsSets, []);
    coordinationValues.obsSetSelection = newAutoSetSelections;
    coordinationValues.obsSetColor = newAutoSetColors;
    return Promise.resolve(
      new LoaderResult({ obsIndex, obsSets, obsSetsMembership }, null, coordinationValues),
    );
  }
}
