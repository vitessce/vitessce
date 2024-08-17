import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/vit-s';
import {
  initializeCellSetColor,
  treeToMembershipMap,
  dataToCellSetsTree,
} from '@vitessce/sets-utils';
import { vectorFromArray, Table, Dictionary as arrowDictionary, Utf8 as arrowUtf8, Uint8 as arrowUint8, Uint32 as arrowUint32 } from 'apache-arrow';

export function repeatString(val, numRows) {
  return vectorFromArray(
    Array.from({ length: numRows }).fill(val),
    new arrowDictionary(new arrowUtf8, new arrowUint8),
  )
}

/**
 * Loader for converting zarr into the cell sets json schema.
 */
export default class ObsSetsAnndataLoader extends AbstractTwoStepLoader {
  loadObsIndices() {
    const { options } = this;
    const obsIndexPromises = options
      .map(({ path }) => path)
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

  loadCellSetIds(asVector = false) {
    const { options } = this;
    const cellSetZarrLocation = options.map(({ path }) => path);
    return this.dataSource.loadObsColumns(cellSetZarrLocation, asVector);
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
    if (!this.cachedResult) {
      const { options } = this;
      this.cachedResult = Promise.all([
        this.dataSource.loadObsIndex(),
        this.loadObsIndices(),
        this.loadCellSetIds(),
        this.loadCellSetScores(),
      ]).then(data => [data[0], dataToCellSetsTree([data[1], data[2], data[3]], options)]);
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

  async loadArrow() {
    const { options } = this;
    const asVector = true;
    const [obsIndex, obsSetsCols] = await Promise.all([
      this.dataSource.loadObsIndex(),
      this.loadCellSetIds(asVector),
    ]);
    const colTables = obsSetsCols.map((colVector, j) => {
      const { name } = options[j];
      return new Table({
        obsIndex: vectorFromArray(obsIndex, new arrowUtf8),
        setGroup: repeatString(name, obsIndex.length),
        setName: colVector,
      })
    });
    const arrowTable = colTables
      .reduce((acc, table) => acc.concat(table), colTables[0]);
    return arrowTable;
  }
}
