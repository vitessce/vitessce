import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/abstract';
import {
  initializeCellSetColor,
  lazyTreeToMembershipMap,
  dataToCellSetsTree,
  codesToCellSetsTree,
  membershipFromCodes,
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

  /**
   * Try to load every obsSets entry as raw categorical codes rather than
   * per-observation strings. Applicable when this is the plain AnnData/MuData
   * loader (not the SpatialData subclass), every entry is a single categorical
   * column without scores, and all columns share one observation axis.
   * @returns {Promise<object|null>} `{ obsIndex, columns }` where columns hold
   * `{ name, path, codes, categories }` per entry, or null to fall back to the
   * string-based route.
   */
  async loadCodesColumns() {
    const { options } = this;
    const entries = options.obsSets || [];
    const eligible = entries.length > 0
      && this.tablePath === null
      && this.region === null
      && typeof this.dataSource.loadObsColumnCodes === 'function'
      && entries.every(entry => typeof entry.path === 'string' && !entry.scorePath);
    if (!eligible) {
      return null;
    }
    const codesResults = await Promise.all(
      entries.map(entry => this.dataSource.loadObsColumnCodes(entry.path)),
    );
    if (codesResults.some(result => !result)) {
      // At least one column is not categorical.
      return null;
    }
    // The codes are positional along each column's dataframe axis; they can only
    // be interpreted together when every column shares one observation index.
    // loadObsIndex caches per obs path, so reference equality is the right check.
    const columnObsIndices = await Promise.all(
      entries.map(entry => this.dataSource.loadObsIndex(entry.path)),
    );
    const columnObsIndex = columnObsIndices[0];
    if (
      !columnObsIndices.every(obsIndex => obsIndex === columnObsIndex)
      || codesResults.some(result => result.codes.length !== columnObsIndex.length)
    ) {
      return null;
    }
    return {
      obsIndex: columnObsIndex,
      columns: entries.map((entry, j) => ({
        name: entry.name,
        path: [entry.name],
        codes: codesResults[j].codes,
        categories: codesResults[j].categories,
      })),
    };
  }

  async load() {
    if (!this.cachedResult) {
      const { options } = this;
      this.cachedResult = (async () => {
        const obsIndex = await this.dataSource.loadObsIndex(this.tablePath);
        const codesData = await this.loadCodesColumns();
        if (codesData) {
          return [obsIndex, codesToCellSetsTree(codesData, options.obsSets), codesData];
        }
        const [obsIndices, cellSetIds, cellSetScores] = await Promise.all([
          this.loadObsIndices(),
          this.loadCellSetIds(),
          this.loadCellSetScores(),
        ]);
        return [
          obsIndex,
          dataToCellSetsTree([obsIndices, cellSetIds, cellSetScores], options.obsSets),
          null,
        ];
      })();
    }
    const [obsIndex, obsSets, codesData] = await this.cachedResult;
    // With codes available, membership lookups read the codes directly; otherwise
    // the tree-based membership map is built lazily (in a worker when possible).
    const obsSetsMembership = codesData
      ? membershipFromCodes(codesData.obsIndex, codesData.columns)
      : lazyTreeToMembershipMap(obsSets, obsIndex);
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
    return new LoaderResult({
      obsIndex,
      obsSets,
      obsSetsMembership,
      // The raw columns let views build positional color encodings without
      // walking the tree; consumers must check obsSetsColumns.obsIndex alignment.
      ...(codesData ? { obsSetsColumns: codesData } : {}),
    }, null, coordinationValues);
  }
}
