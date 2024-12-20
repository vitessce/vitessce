import { LoaderResult, AbstractLoaderError } from '@vitessce/abstract';
import { initializeCellSetColor, treeToMembershipMap, dataToCellSetsTree } from '@vitessce/sets-utils';
import CsvLoader from './CsvLoader.js';

export default class ObsSetsCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsSets: setsArr } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));

    const setsCols = setsArr.map(({ column }) => column);
    const cellSetIds = setsCols.map(setCol => (Array.isArray(setCol)
      ? setCol.map(subCol => data.map(d => d[subCol]))
      : data.map(d => d[setCol])
    ));
    const scoresCols = setsArr.map(option => option.scorePath || undefined);
    const cellSetScores = scoresCols.map(scoreCol => (
      scoreCol ? data.map(d => d[scoreCol]) : undefined
    ));
    const obsIndices = cellSetIds.map(() => obsIndex);
    const cellSetsTree = dataToCellSetsTree([
      obsIndices,
      cellSetIds,
      cellSetScores,
    ], setsArr);
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
    return [obsIndex, cellSetsTree, obsSetsMembership, coordinationValues];
  }

  async load() {
    const payload = await this.getSourceData().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const [
      obsIndex,
      cellSetsTree,
      obsSetsMembership,
      coordinationValues,
    ] = this.loadFromCache(data);
    return Promise.resolve(
      new LoaderResult({
        obsIndex, obsSets: cellSetsTree, obsSetsMembership,
      }, url, coordinationValues),
    );
  }
}
