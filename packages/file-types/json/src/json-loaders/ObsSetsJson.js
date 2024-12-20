import {
  tryUpgradeTreeToLatestSchema,
  initializeCellSetColor,
  nodeToSet,
  treeToMembershipMap,
} from '@vitessce/sets-utils';
import { AbstractLoaderError, LoaderResult } from '@vitessce/abstract';
import { obsSetsSchema } from '@vitessce/schemas';
import JsonLoader from './JsonLoader.js';

export default class ObsSetsJsonLoader extends JsonLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.schema = obsSetsSchema;
  }

  async load() {
    const payload = await super.load().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data: rawData, url } = payload;
    const datatype = this.fileType.endsWith('cell-sets.json') ? 'cell' : 'obs';
    const [upgradedData] = tryUpgradeTreeToLatestSchema(rawData, datatype);
    let obsIndex = [];
    const coordinationValues = {
      obsSetSelection: [],
      obsSetColor: [],
    };
    let obsSetsMembership = new Map();

    // Set up the initial coordination values.
    if (upgradedData && upgradedData.tree.length >= 1) {
      const { tree } = upgradedData;
      obsSetsMembership = treeToMembershipMap(upgradedData);
      const newAutoSetSelectionParentName = tree[0].name;
      // Create a list of set paths to initally select.
      const newAutoSetSelections = tree[0].children
        .map(node => ([newAutoSetSelectionParentName, node.name]));
      // Create a list of cell set objects with color mappings.
      const newAutoSetColors = initializeCellSetColor(upgradedData, []);
      coordinationValues.obsSetSelection = newAutoSetSelections;
      coordinationValues.obsSetColor = newAutoSetColors;

      obsIndex = nodeToSet(tree[0]).map(d => d[0]);
    }
    return Promise.resolve(new LoaderResult({
      obsIndex,
      obsSets: upgradedData,
      obsSetsMembership,
    }, url, coordinationValues));
  }
}
