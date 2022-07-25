import cellSetsSchema from '../schemas/cell-sets.schema.json';
import JsonLoader from './JsonLoader';
import { tryUpgradeTreeToLatestSchema } from '../components/sets/io';
import { AbstractLoaderError } from './errors';
import LoaderResult from './LoaderResult';

import { initializeCellSetColor } from '../components/sets/cell-set-utils';

export default class CellSetsJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = cellSetsSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data: rawData, url } = payload;
    const upgradedData = tryUpgradeTreeToLatestSchema(rawData, 'cell');

    const coordinationValues = {
      obsSetSelection: [],
      obsSetColor: [],
    };

    // Set up the initial coordination values.
    if (upgradedData && upgradedData.tree.length >= 1) {
      const { tree } = upgradedData;
      const newAutoSetSelectionParentName = tree[0].name;
      // Create a list of set paths to initally select.
      const newAutoSetSelections = tree[0].children
        .map(node => ([newAutoSetSelectionParentName, node.name]));
      // Create a list of cell set objects with color mappings.
      const newAutoSetColors = initializeCellSetColor(upgradedData, []);
      coordinationValues.obsSetSelection = newAutoSetSelections;
      coordinationValues.obsSetColor = newAutoSetColors;
    }
    return Promise.resolve(new LoaderResult(upgradedData, url, coordinationValues));
  }
}
