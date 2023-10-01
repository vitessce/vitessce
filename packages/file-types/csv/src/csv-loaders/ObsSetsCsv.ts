import type { ObsSetsData } from '@vitessce/types';
import type { z, obsSetsCsvSchema } from '@vitessce/schemas';
import { initializeCellSetColor, treeToMembershipMap, dataToCellSetsTree } from '@vitessce/sets-utils';
import CsvLoader from './CsvLoader.js';

function getCoordinationValues(data: ObsSetsData) {
  const coordinationValues: { [key: string]: any } = {};
  const { tree } = data.obsSets;
  const newAutoSetSelectionParentName = tree[0].name;
  // Create a list of set paths to initally select.
  const newAutoSetSelections = tree[0].children.map(node => [
    newAutoSetSelectionParentName,
    node.name,
  ]);
  // Create a list of cell set objects with color mappings.
  const newAutoSetColors = initializeCellSetColor(data.obsSets, []);
  coordinationValues.obsSetSelection = newAutoSetSelections;
  coordinationValues.obsSetColor = newAutoSetColors;
  return coordinationValues;
}

export default class ObsSetsCsvLoader extends CsvLoader<
  ObsSetsData, z.infer<typeof obsSetsCsvSchema>
> {
  cachedResult: ObsSetsData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    if (!this.options) throw new Error('options not defined');
    const { obsIndex: indexCol, obsSets: setsArr } = this.options;
    const data = await this.dataSource.getData();
    const obsIndex = data.map((d: { [key: string]: any }) => String(d[indexCol]));

    const setsCols = setsArr.map(({ column }) => column);
    const cellSetIds = setsCols.map(setCol => (Array.isArray(setCol)
      ? setCol.map(subCol => data.map((d: { [key: string]: any }) => d[subCol]))
      : data.map((d: { [key: string]: any }) => d[setCol])
    ));
    const scoresCols = setsArr.map(option => option.scoreColumn);
    const cellSetScores = scoresCols.map(scoreCol => (
      scoreCol ? data.map((d: { [key: string]: any }) => d[scoreCol]) : undefined
    ));
    const obsIndices = cellSetIds.map(() => obsIndex);
    const cellSetsTree = dataToCellSetsTree([
      obsIndices,
      cellSetIds,
      cellSetScores,
    ], setsArr);
    const obsSetsMembership = treeToMembershipMap(cellSetsTree);

    // TODO(ts): remove 'as' cast when we have types for @vitessce/sets-utils.
    this.cachedResult = { obsIndex, obsSets: cellSetsTree, obsSetsMembership } as ObsSetsData;
    return this.cachedResult;
  }

  async load() {
    const { url } = this;
    const result = await this.loadFromCache();
    const coordinationValues = getCoordinationValues(result);
    return {
      data: result,
      url,
      coordinationValues,
    };
  }
}
