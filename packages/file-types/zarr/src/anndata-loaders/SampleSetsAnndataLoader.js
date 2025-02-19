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
export default class SampleSetsAnndataLoader extends AbstractTwoStepLoader {
  loadObsIndices() {
    const { options } = this;
    const obsIndexPromises = options
      .sampleSets
      ?.map(({ path }) => path)
      .map((pathOrPaths) => {
        if (Array.isArray(pathOrPaths)) {
          // The multi-level case, try using the first item to get the obsIndex.
          if (pathOrPaths.length > 0) {
            return this.dataSource.loadDataFrameIndex(pathOrPaths[0]);
          }
          // pathOrPaths should not be of length 0, but if so, fall back to the default obsIndex.
          return this.dataSource.loadDataFrameIndex();
        }
        // The single-level case.
        return this.dataSource.loadDataFrameIndex(pathOrPaths);
      });
    return Promise.all(obsIndexPromises);
  }

  loadCellSetIds() {
    const { options } = this;
    const cellSetZarrLocation = options.sampleSets?.map(({ path }) => path);
    return this.dataSource.loadObsColumns(cellSetZarrLocation);
  }

  loadCellSetScores() {
    const { options } = this;
    const cellSetScoreZarrLocation = options.sampleSets
      ?.map(option => option.scorePath || undefined);
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
        this.dataSource.loadDataFrameIndex(),
        this.loadObsIndices(),
        this.loadCellSetIds(),
        this.loadCellSetScores(),
      ]).then(data => ([
        data[0],
        dataToCellSetsTree([data[1], data[2], data[3]], options.sampleSets),
      ]));
    }
    const [obsIndex, obsSets] = await this.cachedResult;
    const obsSetsMembership = treeToMembershipMap(obsSets);
    const coordinationValues = {};
    const { tree } = obsSets;
    const newAutoSetSelectionParentName = tree[0].name;
    // Create a list of set paths to initally select.
    // eslint-disable-next-line no-unused-vars
    const newAutoSetSelections = tree[0].children.map(node => [
      newAutoSetSelectionParentName,
      node.name,
    ]);
    // Create a list of cell set objects with color mappings.
    const newAutoSetColors = initializeCellSetColor(obsSets, []);
    // coordinationValues.sampleSetSelection = newAutoSetSelections;
    coordinationValues.sampleSetColor = newAutoSetColors;
    return Promise.resolve(
      new LoaderResult({
        sampleIndex: obsIndex,
        sampleSets: obsSets,
        sampleSetsMembership: obsSetsMembership,
      }, null, coordinationValues),
    );
  }
}
